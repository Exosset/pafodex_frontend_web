import { Search, Bell } from "lucide-react";

export interface TopBarProps {
  title: string;
  greeting: string;
  hasNotification?: boolean;
}

export function TopBar({ title, greeting, hasNotification = true }: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-8 py-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{greeting}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Barre de recherche */}
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une carte, un set, un artiste..."
            className="w-72 rounded-full border border-border bg-card py-2 pl-9 pr-12 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary"
        >
          <Bell size={16} />
          {hasNotification && (
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
          )}
        </button>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
          A
        </div>
        
      </div>
    </header>
  );
}