import { useEffect, useRef, useState } from "react";
import { Home, Layers, BookOpen, Settings, ScrollText, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/Logo.png";
import { logout } from "@/services/authService";

export interface SidebarProps {
  activeItem?: "accueil" | "bibliotheque" | "collections" | "regles" | "parametres";
  userName: string;
}

const navItems = [
  { key: "accueil", label: "Accueil", icon: Home, path: "/home" },
  { key: "collections", label: "Collections", icon: Layers, path: "/sets" },
  { key: "bibliotheque", label: "Bibliothèque", icon: BookOpen, path: "/library" },
  { key: "regles", label: "Règles", icon: ScrollText, path: "/rules" },
  { key: "parametres", label: "Paramètres", icon: Settings, path: "/parametres" },
] as const;

export function Sidebar({ activeItem = "accueil", userName }: SidebarProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Ferme le menu si on clique en dehors
  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

async function handleLogout() {
    try {
        await logout();
    } catch (err) {
        console.error("Erreur lors de la déconnexion côté serveur :", err);
        // On déconnecte quand même localement, même si l'appel serveur échoue
    } finally {
        localStorage.removeItem("apiToken");
        setIsMenuOpen(false);
        navigate("/");
    }
}

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

      {/* Profil utilisateur, avec menu déroulant vers le haut */}
      <div ref={menuRef} className="relative">
        {isMenuOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut size={16} />
              Se déconnecter
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsMenuOpen((v) => !v)}
          className="flex w-full items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-left transition-colors hover:bg-secondary/60"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
            {userName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium leading-tight text-foreground">{userName}</p>
          </div>
        </button>
      </div>
    </aside>
  );
}