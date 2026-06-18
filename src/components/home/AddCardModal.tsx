import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Search, Check } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { fetchGameTypes } from "@/services/gameTypeService";
import { fetchCurrentUser } from "@/services/userService";
import { createCard, searchScryfallCards } from "@/services/cardService";
import { mapperAPIScryfall } from "@/mappers/apiMapper";
import { buildCardAdd } from "@/mappers/cardMapper";
import { validateCard, type CardValidationErrors } from "@/validators/cardValidator";
import type { GameType } from "@/types/gameType";
import type { Card, ScryfallCard } from "@/types/card";

export interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardCreated: (card: Card) => void;
}

// Nom exact du jeu Magic tel que renvoyé par votre backend /game-types
const MTG_GAME_NAME = "Magic The Gathering";

export function AddCardModal({ isOpen, onClose, onCardCreated }: AddCardModalProps) {
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [isLoadingGameTypes, setIsLoadingGameTypes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CardValidationErrors>({});

  const [selectedGameTypeId, setSelectedGameTypeId] = useState("");
  const [nameValue, setNameValue] = useState("");

  // Champs renseignés automatiquement par Scryfall, invisibles dans l'UI.
  // Aucune valeur de repli ici : c'est le mapper buildCardAdd qui s'en occupe.
  const [extension, setExtension] = useState("");
  const [number, setNumber] = useState("");
  const [image, setImage] = useState("");
  const [hasSelectedExternalCard, setHasSelectedExternalCard] = useState(false);

  const [libraryId, setLibraryId] = useState<number | null>(null);

  // ----- Recherche Scryfall (Magic uniquement) -----
  const [searchResults, setSearchResults] = useState<ScryfallCard[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // gameType actuellement sélectionné dans le menu déroulant (objet complet, pas juste l'id)
  const selectedGameType = gameTypes.find((g) => String(g.id) === selectedGameTypeId);
  const isMtgSelected = selectedGameType?.name === MTG_GAME_NAME;

  // Charge la liste des jeux + le profil utilisateur (pour libraryId) à l'ouverture
  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    async function loadInitialData() {
      setIsLoadingGameTypes(true);
      try {
        const [gameTypesResult, userResult] = await Promise.all([
          fetchGameTypes(),
          fetchCurrentUser(),
        ]);
        if (isCancelled) return;
        setGameTypes(gameTypesResult);
        setLibraryId(userResult.id);
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
          setError("Impossible de charger les informations nécessaires.");
        }
      } finally {
        if (!isCancelled) setIsLoadingGameTypes(false);
      }
    }

    loadInitialData();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  async function handleSearch() {
    if (!nameValue.trim() || !isMtgSelected) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await searchScryfallCards(nameValue);
      setSearchResults(results);
      setIsSearchOpen(true);
    } catch (err) {
      console.error(err);
      setSearchError("Impossible d'effectuer la recherche.");
    } finally {
      setIsSearching(false);
    }
  }

  function handleSelectResult(card: ScryfallCard) {
    if (!selectedGameType || libraryId === null) return;

    const mapped = mapperAPIScryfall(card, selectedGameType.id, libraryId);

    setNameValue(mapped.name);
    setExtension(mapped.extension);
    setNumber(mapped.number);
    setImage(mapped.image);
    setHasSelectedExternalCard(true);
    setIsSearchOpen(false);
    setSearchResults([]);
  }

  function handleGameTypeChange(value: string) {
    setSelectedGameTypeId(value);
    setSearchResults([]);
    setIsSearchOpen(false);
    setHasSelectedExternalCard(false);
  }

  function handleNameChange(value: string) {
    setNameValue(value);
    setIsSearchOpen(false);
    // Si l'utilisateur modifie le nom manuellement après une sélection Scryfall,
    // on ne sait plus garantir que extension/number/image correspondent encore.
    if (hasSelectedExternalCard) {
      setHasSelectedExternalCard(false);
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const validationErrors = validateCard(nameValue, selectedGameTypeId);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }
    setFieldErrors({});

    if (libraryId === null) {
      setError("Impossible de déterminer ta bibliothèque. Réessaie plus tard.");
      return;
    }

    // Construction du payload entièrement déléguée au mapper : la page ne fait
    // que transmettre les valeurs brutes du formulaire, sans logique de repli ici.
    const payload = buildCardAdd({
      name: nameValue,
      extension,
      number,
      image,
      gameTypeId: Number(selectedGameTypeId),
      libraryId,
      hasSelectedExternalCard,
    });

    setIsSubmitting(true);
    try {
      const newCard = await createCard(payload);
      onCardCreated(newCard);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'ajouter la carte.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter une carte">
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Jeu — en premier, conditionne la recherche Scryfall */}
        <div>
          <label htmlFor="gameTypeId" className="mb-1.5 block text-sm font-medium text-foreground">
            Jeu
          </label>
          <select
            id="gameTypeId"
            value={selectedGameTypeId}
            onChange={(e) => handleGameTypeChange(e.target.value)}
            disabled={isLoadingGameTypes || gameTypes.length === 0}
            className={`w-full rounded-lg border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 ${
              fieldErrors.gameTypeId ? "border-destructive" : "border-border"
            }`}
          >
            <option value="" disabled>
              {isLoadingGameTypes
                ? "Chargement..."
                : gameTypes.length === 0
                  ? "Aucun jeu disponible"
                  : "Sélectionne un jeu"}
            </option>
            {gameTypes.map((gameType) => (
              <option key={gameType.id} value={gameType.id}>
                {gameType.name}
              </option>
            ))}
          </select>
          {fieldErrors.gameTypeId && (
            <p className="mt-1 text-xs text-destructive">{fieldErrors.gameTypeId}</p>
          )}
        </div>

        {/* Nom — avec recherche Scryfall intégrée pour Magic */}
        <div className="relative">
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
            Nom
          </label>
          <div className="flex gap-2">
            <input
              id="name"
              type="text"
              value={nameValue}
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isMtgSelected) {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Charizard ex"
              autoComplete="off"
              className={`flex-1 rounded-lg border bg-card px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring ${
                fieldErrors.name ? "border-destructive" : "border-border"
              }`}
            />
            {isMtgSelected && (
              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching || !nameValue.trim()}
                className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Rechercher
              </button>
            )}
          </div>
          {fieldErrors.name && <p className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>}

          {hasSelectedExternalCard && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-success">
              <Check size={14} />
              Carte trouvée sur Scryfall — édition et numéro pré-remplis automatiquement.
            </p>
          )}

          {searchError && <p className="mt-1.5 text-xs text-destructive">{searchError}</p>}

          {/* Menu déroulant des résultats, positionné sous le champ Nom */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
              {searchResults.length === 0 ? (
                <p className="px-3 py-2.5 text-sm text-muted-foreground">Aucune carte trouvée.</p>
              ) : (
                <ul className="py-1">
                  {searchResults.map((result) => {
                    const resultKey = `${result.id}-${result.set}-${result.collector_number}`;

                    return (
                      <li key={resultKey}>
                        <button
                          type="button"
                          onClick={() => handleSelectResult(result)}
                          className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-secondary"
                        >
                          <span className="flex items-center gap-3">
                            {result.image_uris?.normal && (
                              <img
                                src={result.image_uris.normal}
                                alt={result.name}
                                className="h-10 w-auto rounded"
                              />
                            )}
                            <span className="font-semibold">{result.name}</span>
                          </span>
                          <span className="whitespace-nowrap text-sm text-muted-foreground">
                            {result.set.toUpperCase()} {result.collector_number}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Ajouter
          </button>
        </div>
      </form>
    </Modal>
  );
}