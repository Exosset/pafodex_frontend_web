import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Set } from "@/types/set";

export function SetCard({
  set,
  onDelete,
  onDragOverCard,
  onDragLeaveCard,
  onDropCard,
  isCardDragActive = false,
  isDropTarget = false,
  isDropDisabled = false,
  isDropping = false,
  isDeleting = false,
}: {
  set: Set;
  onDelete?: () => void;
  onDragOverCard?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeaveCard?: () => void;
  onDropCard?: (event: React.DragEvent<HTMLDivElement>) => void;
  isCardDragActive?: boolean;
  isDropTarget?: boolean;
  isDropDisabled?: boolean;
  isDropping?: boolean;
  isDeleting?: boolean;
}) {
  const DELETE_ACTION_HEIGHT = 56;
  const OPEN_THRESHOLD = 24;

  const { name, color, gameType } = set;
  const navigate = useNavigate();
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
    <div className="relative overflow-hidden rounded-2xl">
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={isDeleting}
          aria-label={`Supprimer la collection ${name}`}
          className="absolute inset-x-0 bottom-0 z-10 flex h-14 items-center justify-center bg-destructive px-4 text-sm font-semibold text-destructive-foreground transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            transform: `translateY(${(1 - deleteRevealProgress) * 100}%)`,
            opacity: deleteRevealProgress,
          }}
        >
          Supprimer la collection
        </button>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (hasDraggedRef.current) {
            hasDraggedRef.current = false;
            return;
          }
          navigate(`/set/${set.id}`);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(`/set/${set.id}`);
          }
        }}
        onPointerDown={(e) => {
          if (!onDelete) return;
          const target = e.target as HTMLElement;
          if (target.closest("button")) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          beginDeleteSlide(e.clientY);
        }}
        onPointerMove={(e) => {
          if (!onDelete) return;
          moveDeleteSlide(e.clientY);
        }}
        onPointerUp={(e) => {
          if (!onDelete) return;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
          endDeleteSlide();
        }}
        onPointerCancel={(e) => {
          if (!onDelete) return;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
          endDeleteSlide();
        }}
        onDragOver={onDragOverCard}
        onDragLeave={() => {
          onDragLeaveCard?.();
        }}
        onDrop={onDropCard}
        onDragStart={(e) => e.preventDefault()}
        className={`group relative z-20 flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-[transform,box-shadow] duration-300 hover:shadow-md select-none touch-none cursor-grab active:cursor-grabbing ${
          isCardDragActive && isDropDisabled ? "opacity-55" : ""
        } ${isDropTarget ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
        style={{ transform: `translateY(${currentOffsetY}px)` }}
      >
        {/* Bandeau coloré */}
        <div
          className="relative flex h-32 items-start justify-between p-4"
          style={{ backgroundColor: color ?? "#e8686f" }}
        >
          <span className="rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold text-foreground">
            {gameType.name}
          </span>
          {isDropTarget && (
            <span className="rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-semibold text-primary">
              {isDropping ? "Ajout..." : "Dépose ici"}
            </span>
          )}
        </div>

        {/* Infos */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        </div>
      </div>
    </div>
  );
}