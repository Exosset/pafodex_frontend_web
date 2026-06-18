import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Sidebar } from "@/components/home/Sidebar";
import { TopBar } from "@/components/home/TopBar";
import { LibraryCard } from "@/components/home/LibraryCard";
import { PaginationControls } from "@/components/home/PaginationControls";
import { AddCardModal } from "@/components/home/AddCardModal";
import { SiteFooter } from "@/components/common/SiteFooter";
import { fetchCurrentUser } from "@/services/userService";
import { fetchCurrentUserCardSet } from "@/services/cardSetService";
import { deleteLibraryCard } from "@/services/cardService";
import type { CurrentUserProfile } from "@/types/user";
import type { Card } from "@/types/card";

export default function LibraryPage() {
  const [user, setUser] = useState<CurrentUserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // ----- Cards, paginées par 25 -----
  const [cards, setCards] = useState<Card[]>([]);
  const [cardsTotal, setCardsTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<number | null>(null);

  // ----- Modal d'ajout de carte -----
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch((err) => {
        console.error(err);
        // TODO: rediriger vers /login si le token est invalide/expiré
      })
      .finally(() => setIsLoadingUser(false));
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setIsLoadingData(true);
      setDataError(null);

      try {
        const result = await fetchCurrentUserCardSet(page);
        if (isCancelled) return;

        setCards(result.cards);
        setCardsTotal(result.pagination.total);
        setTotalPages(result.pagination.pages);
      } catch (err) {
        if (isCancelled) return;
        console.error(err);
        setDataError("Impossible de charger les cartes.");
      } finally {
        if (!isCancelled) setIsLoadingData(false);
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [page]);

  function handleCardCreated(newCard: Card) {
    setCards((prev) => [newCard, ...prev]);
    setCardsTotal((prev) => prev + 1);
  }

  async function handleDeleteFromLibrary(cardId: number) {
    setDeletingCardId(cardId);
    setDataError(null);

    try {
      await deleteLibraryCard(cardId);
      setCards((prev) => prev.filter((card) => card.id !== cardId));
      setCardsTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
      setDataError(err instanceof Error ? err.message : "Impossible de supprimer la carte de la bibliothèque.");
    } finally {
      setDeletingCardId(null);
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        activeItem="bibliotheque"
        userName={isLoadingUser ? "Chargement..." : (user?.pseudo ?? "Utilisateur")}
      />

      <div className="flex min-h-screen flex-1 flex-col pl-[var(--sidebar-width)] transition-[padding] duration-200">
        <TopBar title="Bibliothèque" greeting={`Bienvenue, ${user?.pseudo ?? "..."} 👋`} />

        <main className="flex-1 px-8 py-6">
          {dataError && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {dataError}
            </div>
          )}

          {/* ----- Section Bibliothèque (cards, paginées par 25) ----- */}
          <section className="mt-12">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">Bibliothèque</h2>
              <button
                type="button"
                onClick={() => setIsAddCardOpen(true)}
                aria-label="Ajouter une carte"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus size={16} />
              </button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{cardsTotal} cartes possédées</p>

            {isLoadingData ? (
              <p className="mt-6 text-sm text-muted-foreground">Chargement des cartes...</p>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                  {cards.map((card) => (
                    <LibraryCard
                      key={card.id}
                      card={card}
                      onDeleteFromLibrary={() => handleDeleteFromLibrary(card.id)}
                      isDeletingFromLibrary={deletingCardId === card.id}
                    />
                  ))}
                </div>

                <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </section>
        </main>

        <SiteFooter />
      </div>

      <AddCardModal
        isOpen={isAddCardOpen}
        onClose={() => setIsAddCardOpen(false)}
        onCardCreated={handleCardCreated}
      />
    </div>
  );
}