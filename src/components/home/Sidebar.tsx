import { Home, Layers, BookOpen, Settings, ScrollText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/Logo.png";

export interface SidebarProps {
  activeItem?: "accueil" | "bibliotheque" | "collections" | "regles" | "parametres";
  userName: string;
}

const navItems = [
  { key: "accueil", label: "Accueil", icon: Home, path: "/home" },
  { key: "collections", label: "Collections", icon: Layers, path: "/collections" },
  { key: "bibliotheque", label: "Bibliothèque", icon: BookOpen, path: "/library" },
  { key: "regles", label: "Règles", icon: ScrollText, path: "/rules" },
  { key: "parametres", label: "Paramètres", icon: Settings, path: "/parametres" },
] as const;

export function Sidebar({ activeItem = "accueil", userName }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <aside className="fixed inset-y-0 left-0 flex h-screen w-64 flex-col justify-between border-r border-border bg-card px-4 py-5">
      <div>
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3 px-2">
          <img src={logo} alt="PAF'O'Dex" className="h-9 w-9 rounded-full object-cover" />
          <div>
            <p className="text-base font-semibold leading-tight text-foreground">PAF'O'Dex</p>
            <p className="text-xs text-muted-foreground">TCG Manager</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map(({ key, label, icon: Icon, path }) => {
            const isActive = key === activeItem;
            return (
              <button
                key={key}
                type="button"
                onClick={() => navigate(path)}
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
        </div>
      </div>
    </aside>
  );
}