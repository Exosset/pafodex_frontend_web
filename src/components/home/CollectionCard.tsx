import type { CollectionSummary } from "@/components/home/types";

export function CollectionCard({ collection }: { collection: CollectionSummary }) {
  const { name, game, gradientFrom, gradientTo, icon } =
    collection;

  return (
    <button
      type="button"
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-shadow hover:shadow-md"
    >
      {/* Bandeau coloré */}
      <div
        className={`relative flex h-32 items-start justify-between bg-gradient-to-br ${gradientFrom} ${gradientTo} p-4`}
      >
        <span className="rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold text-foreground">
          {game === "POKEMON" ? "POKÉMON" : "MTG"}
        </span>
        <span className="text-3xl drop-shadow-sm">{icon}</span>
      </div>

      {/* Infos */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        </div>

        {/* Barre de progression */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        </div>
      </div>
    </button>
  );
}