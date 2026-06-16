import type { Card } from "@/types/card";

export function LibraryCard({ card }: { card: Card }) {
  const { name, extension, number, image, gameType } = card;

  return (
    <button
      type="button"
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-shadow hover:shadow-md"
    >
      {/* Illustration */}
      <div className="relative flex h-44 items-start justify-between bg-secondary p-3">
        <span className="rounded-full bg-card/90 px-2 py-0.5 text-xs font-semibold text-foreground">
          {gameType.nom}
        </span>
        {image ? (
          <img
            src={image}
            alt={name}
            className="absolute inset-0 h-full w-full object-contain p-4"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-4xl text-muted-foreground">
            🎴
          </span>
        )}
      </div>

      {/* Infos */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {extension} · {number}
        </p>
      </div>
    </button>
  );
}