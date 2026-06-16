import { TrendingUp, TrendingDown } from "lucide-react";
import type { LibraryCardItem } from "@/components/home/types";

export function LibraryCard({ card }: { card: LibraryCardItem }) {
  const { name, game, setLabel, rarity, trendPercent, quantity, gradientFrom, gradientTo, icon } = card;
  const isPositive = trendPercent >= 0;

  return (
    <button
      type="button"
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-shadow hover:shadow-md"
    >
      {/* Illustration */}
      <div
        className={`relative flex h-44 items-start justify-between bg-gradient-to-br ${gradientFrom} ${gradientTo} p-3`}
      >
        <span className="rounded-full bg-card/90 px-2 py-0.5 text-xs font-semibold text-foreground">
          {game === "POKEMON" ? "PKM" : "MTG"}
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-foreground/70 px-2 py-0.5 text-xs font-semibold text-background">
          x{quantity}
        </span>
        <span className="absolute inset-0 flex items-center justify-center text-5xl drop-shadow-sm">{icon}</span>
      </div>

      {/* Infos */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{setLabel}</p>

        <div className="mt-2 flex items-center justify-between">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
            {rarity}
          </span>
        </div>

        <div
          className={`mt-2 flex items-center gap-1 text-xs font-medium ${
            isPositive ? "text-success" : "text-destructive"
          }`}
        >
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isPositive ? "+" : ""}
        </div>
      </div>
    </button>
  );
}