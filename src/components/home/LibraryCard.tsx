import type { Card } from "@/types/card";

const GAME_ACCENT_VAR: Record<string, string> = {
  Pokémon: "var(--color-pokemon)",
  Pokemon: "var(--color-pokemon)",
  "Magic The Gathering": "var(--color-mtg)",
  Magic: "var(--color-mtg)",
};

export function LibraryCard({ card }: { card: Card }) {
  const { name, extension, number, image, gameType } = card;
  const accent = GAME_ACCENT_VAR[gameType.nom] ?? "var(--color-primary)";

  return (
    <button
      type="button"
      style={{ "--accent": accent } as React.CSSProperties}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--accent)]/10"
    >
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
            className="relative z-10 h-full w-full object-contain p-4 drop-shadow-md transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="relative z-10 text-5xl text-muted-foreground/60">🎴</span>
        )}

        {/* Balayage holographique au survol */}
        <div
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          aria-hidden="true"
        />

        {/* Badge jeu, ancré en haut à gauche, par-dessus l'illustration */}
        <span
          className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-foreground shadow-sm backdrop-blur-sm"
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
    </button>
  );
}