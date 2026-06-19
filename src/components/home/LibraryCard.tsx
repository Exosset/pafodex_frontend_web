import { useRef, useState } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import type { Card } from "@/types/card";

const GAME_ACCENT_VAR: Record<string, string> = {
  "Magic The Gathering": "var(--color-mtg)",
  Magic: "var(--color-mtg)",
  Riftbound: "var(--color-riftbound)",
  "Yu-Gi-Oh!": "var(--color-yugioh)",
};
export function LibraryCard({
  card,
  onAddToSet,
  onRemove,
  onDeleteFromLibrary,
  onToggleFavorite,
  onDragToSetStart,
  onDragToSetEnd,
  isDraggableToSet = false,
  isRemoving = false,
  isDeletingFromLibrary = false,
  isTogglingFavorite = false,
  onCardClick,
}: {
  card: Card;
  onAddToSet?: () => void;
  onRemove?: () => void;
  onDeleteFromLibrary?: () => void;
  onToggleFavorite?: () => void;
  onDragToSetStart?: (card: Card) => void;
  onDragToSetEnd?: () => void;
  isDraggableToSet?: boolean;
  isRemoving?: boolean;
  isDeletingFromLibrary?: boolean;
  isTogglingFavorite?: boolean;
  onCardClick?: () => void;
}) {
  const DELETE_ACTION_HEIGHT = 56;
  const OPEN_THRESHOLD = 24;

  const { name, extension, number, image, gameType } = card;
  const accent = GAME_ACCENT_VAR[gameType.nom] ?? "var(--color-primary)";
  const [isDeleteRevealed, setIsDeleteRevealed] = useState(false);
  const [isDraggingDelete, setIsDraggingDelete] = useState(false);
  const [dragOffsetY, setDragOffsetY] = useState(0);

  const pointerStartYRef = useRef<number | null>(null);
  const startOffsetYRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const currentOffsetY = isDraggingDelete
    ? dragOffsetY
    : isDeleteRevealed
      ? -DELETE_ACTION_HEIGHT
      : 0;
  const deleteRevealProgress = Math.min(1, Math.max(0, -currentOffsetY / DELETE_ACTION_HEIGHT));
  const showFavoriteButton = typeof onToggleFavorite === "function";

  function beginDeleteSlide(clientY: number) {
    pointerStartYRef.current = clientY;
    startOffsetYRef.current = isDeleteRevealed ? -DELETE_ACTION_HEIGHT : 0;
    hasDraggedRef.current = false;
    setIsDraggingDelete(true);
    setDragOffsetY(startOffsetYRef.current);
  }

  function moveDeleteSlide(clientY: number) {
    if (pointerStartYRef.current === null) return;

    const deltaY = clientY - pointerStartYRef.current;
    if (Math.abs(deltaY) > 4) {
      hasDraggedRef.current = true;
    }

    const rawOffset = startOffsetYRef.current + deltaY;
    const boundedOffset = Math.max(-DELETE_ACTION_HEIGHT, Math.min(0, rawOffset));
    setDragOffsetY(boundedOffset);
  }

  function endDeleteSlide() {
    if (!isDraggingDelete) return;

    const shouldReveal = dragOffsetY <= -OPEN_THRESHOLD;
    setIsDeleteRevealed(shouldReveal);
    setDragOffsetY(shouldReveal ? -DELETE_ACTION_HEIGHT : 0);
    setIsDraggingDelete(false);
    pointerStartYRef.current = null;
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl">
      {onDeleteFromLibrary && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteFromLibrary();
          }}
          disabled={isDeletingFromLibrary}
          aria-label={`Supprimer ${name} de la bibliothèque`}
          className="absolute inset-x-0 bottom-0 z-10 flex h-14 items-center justify-center bg-destructive px-4 text-sm font-semibold text-destructive-foreground transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            transform: `translateY(${(1 - deleteRevealProgress) * 100}%)`,
            opacity: deleteRevealProgress,
          }}
        >
          Supprimer la carte
        </button>
      )}

      <div
        role={onCardClick ? "button" : undefined}
        tabIndex={onCardClick ? 0 : undefined}
        onClick={() => {
          if (hasDraggedRef.current) {
            hasDraggedRef.current = false;
            return;
          }
          onCardClick?.();
        }}
        onKeyDown={(e) => {
          if (!onCardClick) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onCardClick();
          }
        }}
        onPointerDown={(e) => {
          if (!onDeleteFromLibrary) return;
          const target = e.target as HTMLElement;
          if (target.closest("[data-card-drag-source='true']")) return;
          if (target.closest("button")) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          beginDeleteSlide(e.clientY);
        }}
        onPointerMove={(e) => {
          if (!onDeleteFromLibrary) return;
          moveDeleteSlide(e.clientY);
        }}
        onPointerUp={(e) => {
          if (!onDeleteFromLibrary) return;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
          endDeleteSlide();
        }}
        onPointerCancel={(e) => {
          if (!onDeleteFromLibrary) return;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
          endDeleteSlide();
        }}
        className="relative z-20 flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-[transform,box-shadow] duration-300 hover:shadow-xl hover:shadow-[var(--accent)]/10 select-none touch-none cursor-grab active:cursor-grabbing"
        style={{
          "--accent": accent,
          transform: `translateY(${currentOffsetY}px)`,
        } as React.CSSProperties}
        onDragStart={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-card-drag-source='true']")) return;
          e.preventDefault();
        }}
      >
      {onAddToSet && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddToSet();
          }}
          aria-label={`Ajouter ${name} à une collection`}
          className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-border backdrop-blur-sm transition hover:bg-background"
        >
          <Plus size={16} />
        </button>
      )}

      {showFavoriteButton && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          disabled={isTogglingFavorite}
          aria-label={card.isFavorite ? `Retirer ${name} des favoris` : `Ajouter ${name} aux favoris`}
          className={`absolute left-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm ring-1 ring-border backdrop-blur-sm transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-60 ${
            card.isFavorite ? "text-rose-500" : "text-foreground"
          }`}
        >
          <Heart size={16} fill={card.isFavorite ? "currentColor" : "none"} />
        </button>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          disabled={isRemoving}
          aria-label={`Retirer ${name} de la collection`}
          className="pointer-events-none absolute right-3 top-3 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-border backdrop-blur-sm opacity-0 transition hover:bg-background group-hover:pointer-events-auto group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Minus size={16} />
        </button>
      )}

      {/* Liseré supérieur coloré, façon tranche de carte premium */}
      <div
        className="h-1.5 w-full"
        style={{ background: "var(--accent)" }}
        aria-hidden="true"
      />

      {/* Illustration */}
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-secondary">
        {/* Halo radial diffus derrière l'image, teinté à la couleur du jeu */}
        <div
          className="absolute inset-0 opacity-25 transition-opacity duration-300 group-hover:opacity-40"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, var(--accent), transparent 65%)",
          }}
          aria-hidden="true"
        />

        {image ? (
          <img
            src={image}
            alt={name}
            draggable={isDraggableToSet}
            data-card-drag-source={isDraggableToSet ? "true" : undefined}
            onDragStart={(e) => {
              if (!isDraggableToSet) return;
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", String(card.id));
              onDragToSetStart?.(card);
            }}
            onDragEnd={() => {
              if (!isDraggableToSet) return;
              onDragToSetEnd?.();
            }}
            className="relative z-10 h-full w-full object-contain p-4 drop-shadow-md transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <span
            className="relative z-10 text-5xl text-muted-foreground/60"
            draggable={isDraggableToSet}
            data-card-drag-source={isDraggableToSet ? "true" : undefined}
            onDragStart={(e) => {
              if (!isDraggableToSet) return;
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", String(card.id));
              onDragToSetStart?.(card);
            }}
            onDragEnd={() => {
              if (!isDraggableToSet) return;
              onDragToSetEnd?.();
            }}
          >
            🎴
          </span>
        )}

        {/* Balayage holographique au survol */}
        <div
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          aria-hidden="true"
        />

        {/* Badge jeu, ancré en bas à gauche, par-dessus l'illustration */}
        <span
          className="absolute bottom-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-foreground shadow-sm backdrop-blur-sm"
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--accent)" }}
            aria-hidden="true"
          />
          {gameType.nom}
        </span>
      </div>

      {/* Infos */}
      <div className="flex flex-1 flex-col gap-1 border-t border-border/60 p-3.5">
        <h3 className="truncate text-sm font-semibold leading-tight text-foreground">
          {name}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{extension}</p>
          <p
            className="rounded-md px-1.5 py-0.5 text-[11px] font-mono font-medium tabular-nums"
            style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }}
          >
            #{number}
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}