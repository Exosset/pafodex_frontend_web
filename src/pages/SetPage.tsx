import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Copy, Check } from "lucide-react";
import { Sidebar } from "@/components/home/Sidebar";
import { TopBar } from "@/components/home/TopBar";
import { LibraryCard } from "@/components/home/LibraryCard";
import { SiteFooter } from "@/components/common/SiteFooter";
import { Modal } from "@/components/common/Modal";
import { fetchCurrentUser } from "@/services/userService";
import { removeCardFromSet } from "@/services/setService";
import type { CurrentUserProfile } from "@/types/user";
import type { Card } from "@/types/card";
import type { Set } from "@/types/set";

function normalizeGameTypeName(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function isMagicGameType(set: Set | null, cards: Card[]): boolean {
  // Détection uniquement par nom (jamais par ID).
  const rawSetGameType = set?.gameType as { name?: string; nom?: string } | undefined;
  const setGameTypeName = normalizeGameTypeName(rawSetGameType?.name ?? rawSetGameType?.nom ?? "");

  if (setGameTypeName.includes("magic") || setGameTypeName.includes("mtg")) {
    return true;
  }

  // Fallback robuste si la réponse set n'expose pas correctement le gameType.
  const cardGameTypeName = normalizeGameTypeName(cards[0]?.gameType?.nom ?? "");
  return cardGameTypeName.includes("magic") || cardGameTypeName.includes("mtg");
}

function buildArchidektContent(cards: Card[]): string {
  return cards
    .map((card) => {
      const qty = card.numberCard > 0 ? card.numberCard : 1;
      const setCode = card.extension ? ` (${card.extension.toUpperCase()})` : "";
      return `${qty} ${card.name}${setCode}`;
    })
    .join("\n");
}

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
const API_URL = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;

export default function SetPage() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<CurrentUserProfile | null>(null);
  const [setDetails, setSetDetails] = useState<Set | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingCardId, setRemovingCardId] = useState<number | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isArchidektOpen, setIsArchidektOpen] = useState(false);
  const archidektContent = buildArchidektContent(cards);
  const canExportArchidekt = cards.length > 0 && isMagicGameType(setDetails, cards);

  function handleCopyInModal() {
    if (typeof navigator.clipboard?.writeText === "function") {
      navigator.clipboard.writeText(archidektContent).then(() => {
        setCopySuccess(true);
        window.setTimeout(() => setCopySuccess(false), 2500);
      }).catch(() => {});
    } else {
      const el = document.getElementById("archidekt-textarea") as HTMLTextAreaElement | null;
      if (el) { el.select(); document.execCommand("copy"); }
      setCopySuccess(true);
      window.setTimeout(() => setCopySuccess(false), 2500);
    }
  }

  useEffect(() => {
    fetchCurrentUser()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.setItem("apiToken", "");
        navigate("/");
      });
  }, [navigate]);

  async function handleRemoveCard(cardId: number) {
    if (!setId) return;

    setRemovingCardId(cardId);
    setError(null);

    try {
      await removeCardFromSet(Number(setId), cardId);
      setCards((prev) => prev.filter((card) => card.id !== cardId));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Impossible de retirer la carte.");
    } finally {
      setRemovingCardId(null);
    }
  }

  useEffect(() => {
    if (!setId) return;

    let isCancelled = false;

    async function loadSetCards() {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("apiToken");
        const res = await fetch(`${API_URL}/me/sets/${setId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Impossible de charger les cartes de cette collection.");
        }

        const data = await res.json();
        if (isCancelled) return;

        setSetDetails(data.set);
        setCards(data.cards ?? []);
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
          setError(err instanceof Error ? err.message : "Une erreur est survenue.");
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadSetCards();

    return () => {
      isCancelled = true;
    };
  }, [setId]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        activeItem="collections"
        userName={user?.pseudo ?? "Utilisateur"}
      />

      <div className="flex min-h-screen flex-1 flex-col pl-[var(--sidebar-width)] transition-[padding] duration-200">
        <TopBar
          title={setDetails?.name ?? "Collection"}
          greeting={`Bienvenue, ${user?.pseudo ?? "..."} 👋`}
        />

        <main className="flex-1 px-8 py-6">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ChevronLeft size={16} />
            Retour à l'accueil
          </button>

          {error && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="mt-6 text-sm text-muted-foreground">Chargement...</p>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Collection</p>
                  <h1 className="text-3xl font-semibold tracking-tight">
                    {setDetails?.name ?? "Collection"}
                  </h1>
                </div>

                {canExportArchidekt && (
                  <button
                    type="button"
                    onClick={() => setIsArchidektOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    Exporter pour Archidekt
                  </button>
                )}
              </div>

              {cards.length === 0 ? (
                <p className="text-sm text-muted-foreground">Cette collection ne contient aucune carte pour l'instant.</p>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                  {cards.map((card) => (
                    <LibraryCard
                      key={card.id}
                      card={card}
                      onRemove={() => handleRemoveCard(card.id)}
                      isRemoving={removingCardId === card.id}
                      onCardClick={
                        () =>
                          navigate(
                            `/card/${encodeURIComponent(card.name)}?setCode=${encodeURIComponent(
                              card.extension
                            )}&gameTypeId=${card.gameType.id}&gameTypeName=${encodeURIComponent(
                              card.gameType.nom
                            )}&apiSource=${encodeURIComponent(
                              card.gameType.nom.toLowerCase().includes("rift")
                                ? "riftbound"
                                : card.gameType.nom.toLowerCase().includes("yu") || card.gameType.nom.toLowerCase().includes("ygo")
                                  ? "yugioh"
                                  : "magic"
                            )}&libraryCardId=${card.id}&ownedNumber=${card.number}&isFavorite=${card.isFavorite ? "1" : "0"}`
                          )
                      }
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        <SiteFooter />
      </div>

      <Modal
        isOpen={isArchidektOpen && canExportArchidekt}
        onClose={() => { setIsArchidektOpen(false); setCopySuccess(false); }}
        title={`Export Archidekt — ${setDetails?.name ?? "Collection"}`}
      >
        <p className="mb-3 text-sm text-muted-foreground">
          Copie ce texte et colle-le dans Archidekt via <strong>Import &gt; Text</strong>.
        </p>
        <textarea
          id="archidekt-textarea"
          readOnly
          value={archidektContent}
          rows={Math.min(20, cards.length + 2)}
          className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
        />
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleCopyInModal}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              copySuccess
                ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {copySuccess ? <Check size={16} /> : <Copy size={16} />}
            {copySuccess ? "Copié !" : "Copier tout"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
