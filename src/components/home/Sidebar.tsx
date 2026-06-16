import { Home, Layers, BookOpen, Settings } from "lucide-react";

export interface SidebarProps {
  activeItem?: "accueil" | "bibliotheque" | "collections" | "parametres";
  userName: string;
  userPlan: string;
}

const navItems = [
  { key: "accueil", label: "Accueil", icon: Home },
  { key: "collections", label: "Collections", icon: Layers },
  { key: "bibliotheque", label: "Bibliothèque", icon: BookOpen },
  { key: "parametres", label: "Paramètres", icon: Settings },
] as const;

export function Sidebar({ activeItem = "accueil", userName, userPlan }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 flex h-screen w-64 flex-col justify-between border-r border-border bg-card px-4 py-5">
      <div>
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-secondary" />
          <div>
            <p className="text-base font-semibold leading-tight text-foreground">Deckhaus</p>
            <p className="text-xs text-muted-foreground">TCG Manager</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map(({ key, label, icon: Icon }) => {
            const isActive = key === activeItem;
            return (
              <button
                key={key}
                type="button"
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profil utilisateur */}
      <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
          {userName.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium leading-tight text-foreground">{userName}</p>
          <p className="text-xs text-muted-foreground">{userPlan}</p>
        </div>
      </div>
    </aside>
  );
}