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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return true;

    const stored = localStorage.getItem("sidebarCollapsed");
    return stored === null ? true : stored === "true";
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const [isSlidingSidebar, setIsSlidingSidebar] = useState(false);
  const [slideStartX, setSlideStartX] = useState<number | null>(null);
  const [slideOffsetX, setSlideOffsetX] = useState(0);

  const SLIDE_THRESHOLD = 48;
  const CLICK_TOLERANCE = 8;

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(isCollapsed));
    document.documentElement.style.setProperty("--sidebar-width", isCollapsed ? "5rem" : "16rem");
  }, [isCollapsed]);

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

  function beginSidebarSlide(e: React.PointerEvent<HTMLDivElement>) {
    setIsSlidingSidebar(true);
    setSlideStartX(e.clientX);
    setSlideOffsetX(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function moveSidebarSlide(e: React.PointerEvent<HTMLDivElement>) {
    if (!isSlidingSidebar || slideStartX === null) return;
    setSlideOffsetX(e.clientX - slideStartX);
  }

  function endSidebarSlide() {
    if (!isSlidingSidebar) return;

    if (Math.abs(slideOffsetX) <= CLICK_TOLERANCE) {
      setIsCollapsed((prev) => !prev);
      setIsSlidingSidebar(false);
      setSlideStartX(null);
      setSlideOffsetX(0);
      return;
    }

    if (!isCollapsed && slideOffsetX <= -SLIDE_THRESHOLD) {
      setIsCollapsed(true);
    } else if (isCollapsed && slideOffsetX >= SLIDE_THRESHOLD) {
      setIsCollapsed(false);
    }

    setIsSlidingSidebar(false);
    setSlideStartX(null);
    setSlideOffsetX(0);
  }

  const clampedSlideOffset = Math.max(-56, Math.min(56, slideOffsetX));

  return (
    <aside
      className={`fixed inset-y-0 left-0 flex h-screen flex-col justify-between border-r border-border bg-card py-5 transition-[width,padding] duration-200 ${
        isCollapsed ? "w-20 px-2" : "w-64 px-4"
      }`}
      style={{ transform: isSlidingSidebar ? `translateX(${clampedSlideOffset * 0.2}px)` : undefined }}
    >
      <div>
        {/* Logo */}
        <div className={`mb-8 flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-2"}`}>
          <img src={logo} alt="PAF'O'Dex" className="h-9 w-9 flex-none rounded-full object-cover" />
          {!isCollapsed && (
            <div>
              <p className="text-base font-semibold leading-tight text-foreground">PAF'O'Dex</p>
              <p className="text-xs text-muted-foreground">TCG Manager</p>
            </div>
          )}
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
                title={label}
                className={`flex w-full items-center rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  isCollapsed ? "justify-center px-2" : "gap-3 px-3"
                } ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                {!isCollapsed && label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profil utilisateur, avec menu déroulant vers le haut */}
      <div ref={menuRef} className="relative">
        {isMenuOpen && (
          <div
            className={`absolute bottom-full mb-2 overflow-hidden rounded-lg border border-border bg-card shadow-lg ${
              isCollapsed ? "left-0 w-52" : "left-0 right-0"
            }`}
          >
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
          title={userName}
          className={`flex w-full items-center rounded-lg border border-border py-2.5 text-left transition-colors hover:bg-secondary/60 ${
            isCollapsed ? "justify-center px-2" : "gap-3 px-3"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
            {userName.charAt(0) || "U"}
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-sm font-medium leading-tight text-foreground">{userName}</p>
            </div>
          )}
        </button>
      </div>

      <div
        role="slider"
        aria-label="Replier ou déplier la barre latérale"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={isCollapsed ? 0 : 1}
        title={isCollapsed ? "Glisse vers la droite pour déplier" : "Glisse vers la gauche pour replier"}
        onPointerDown={beginSidebarSlide}
        onPointerMove={moveSidebarSlide}
        onPointerUp={endSidebarSlide}
        onPointerCancel={endSidebarSlide}
        className="absolute inset-y-0 right-0 z-20 w-6 cursor-ew-resize touch-none select-none"
      >
        <div className="pointer-events-none absolute right-0 top-1/2 flex h-20 w-5 -translate-y-1/2 items-center justify-center rounded-l-xl bg-border/70">
          <div className="grid grid-cols-2 gap-1">
            {Array.from({ length: 6 }).map((_, index) => (
              <span key={index} className="h-1 w-1 rounded-full bg-muted-foreground/80" />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}