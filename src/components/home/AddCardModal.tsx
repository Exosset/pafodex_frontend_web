import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { fetchGameTypes } from "@/services/gameTypeService";
import { createCard } from "@/services/cardService";
import type { GameType } from "@/types/gameType";
import type { Card } from "@/types/card";

export interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardCreated: (card: Card) => void;
}

export function AddCardModal({ isOpen, onClose, onCardCreated }: AddCardModalProps) {
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [isLoadingGameTypes, setIsLoadingGameTypes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charge la liste des jeux à l'ouverture de la modal
  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    async function loadGameTypes() {
      setIsLoadingGameTypes(true);
      try {
        const result = await fetchGameTypes();
        if (!isCancelled) setGameTypes(result);
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
          setError("Impossible de charger la liste des jeux.");
        }
      } finally {
        if (!isCancelled) setIsLoadingGameTypes(false);
      }
    }

    loadGameTypes();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;

    if (!data.name.trim() || !data.extension.trim() || !data.number.trim() || !data.gameTypeId) {
      setError("Merci de remplir tous les champs obligatoires.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newCard = await createCard({
        name: data.name,
        extension: data.extension,
        number: data.number,
        image: data.image ?? "",
        gameTypeId: Number(data.gameTypeId),
      });

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
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
            Nom
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Charizard ex"
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="extension" className="mb-1.5 block text-sm font-medium text-foreground">
              Extension
            </label>
            <input
              id="extension"
              name="extension"
              type="text"
              placeholder="151"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="number" className="mb-1.5 block text-sm font-medium text-foreground">
              Numéro
            </label>
            <input
              id="number"
              name="number"
              type="text"
              placeholder="199/165"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div>
          <label htmlFor="image" className="mb-1.5 block text-sm font-medium text-foreground">
            Image (URL)
          </label>
          <input
            id="image"
            name="image"
            type="url"
            placeholder="https://example.com/image.png"
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="gameTypeId" className="mb-1.5 block text-sm font-medium text-foreground">
            Jeu
          </label>
          <select
            id="gameTypeId"
            name="gameTypeId"
            disabled={isLoadingGameTypes}
            defaultValue=""
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          >
            <option value="" disabled>
              {isLoadingGameTypes ? "Chargement..." : "Sélectionne un jeu"}
            </option>
            {gameTypes.map((gameType) => (
              <option key={gameType.id} value={gameType.id}>
                {gameType.name}
              </option>
            ))}
          </select>
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