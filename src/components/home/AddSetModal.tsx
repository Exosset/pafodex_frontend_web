import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { fetchGameTypes } from "@/services/gameTypeService";
import { createSet } from "@/services/setService";
import type { GameType } from "@/types/gameType";
import type { Set } from "@/types/set";

export interface AddSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetCreated: (set: Set) => void;
}

const DEFAULT_COLOR = "#6265ED";

export function AddSetModal({ isOpen, onClose, onSetCreated }: AddSetModalProps) {
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [isLoadingGameTypes, setIsLoadingGameTypes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState(DEFAULT_COLOR);

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

    if (!data.name.trim() || !data.gameTypeId) {
      setError("Merci de remplir tous les champs obligatoires.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newSet = await createSet({
        name: data.name,
        color: data.color || DEFAULT_COLOR,
        gameTypeId: Number(data.gameTypeId),
      });

      onSetCreated(newSet);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de créer la collection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter une collection">
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="set-name" className="mb-1.5 block text-sm font-medium text-foreground">
            Nom
          </label>
          <input
            id="set-name"
            name="name"
            type="text"
            placeholder="Pokémon 151"
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="set-color" className="mb-1.5 block text-sm font-medium text-foreground">
            Couleur
          </label>
          <div className="flex items-center gap-3">
            <input
              id="set-color"
              name="color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-card"
            />
            <span className="text-sm text-muted-foreground">{color}</span>
          </div>
        </div>

        <div>
          <label htmlFor="set-gameTypeId" className="mb-1.5 block text-sm font-medium text-foreground">
            Jeu
          </label>
          <select
            id="set-gameTypeId"
            name="gameTypeId"
            disabled={isLoadingGameTypes || gameTypes.length === 0}
            defaultValue=""
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
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

          {!isLoadingGameTypes && gameTypes.length === 0 && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Aucun type de jeu n'est encore configuré. Contacte un administrateur pour en ajouter avant
              de pouvoir créer une collection.
            </p>
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
            disabled={isSubmitting || isLoadingGameTypes || gameTypes.length === 0}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Créer
          </button>
        </div>
      </form>
    </Modal>
  );
}