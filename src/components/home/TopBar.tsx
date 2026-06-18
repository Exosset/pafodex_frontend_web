import { useEffect, useState } from "react";
import { Search, Moon, Sun } from "lucide-react";

export interface TopBarProps {
  title: string;
  greeting: string;
}

export function TopBar({ title, greeting }: TopBarProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

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
            className="w-72 rounded-full border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
          onClick={() => setIsDark((prev) => !prev)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        
      </div>
    </header>
  );
}