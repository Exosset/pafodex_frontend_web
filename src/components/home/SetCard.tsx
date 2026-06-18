import { useNavigate } from "react-router-dom";
import type { Set } from "@/types/set";

export function SetCard({ set }: { set: Set }) {
  const { name, color, gameType } = set;
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/set/${set.id}`)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-shadow hover:shadow-md"
    >
      {/* Bandeau coloré */}
      <div
        className="relative flex h-32 items-start justify-between p-4"
        style={{ backgroundColor: color ?? "#e8686f" }}
      >
        <span className="rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold text-foreground">
          {gameType.name}
        </span>
      </div>

      {/* Infos */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
      </div>
    </button>
  );
}