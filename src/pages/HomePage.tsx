import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/home/Sidebar";
import { TopBar } from "@/components/home/TopBar";
import { SetCard } from "@/components/home/SetCard";
import { LibraryCard } from "@/components/home/LibraryCard";
import { PaginationControls } from "@/components/home/PaginationControls";
import { AddCardModal } from "@/components/home/AddCardModal";
import { fetchCurrentUser } from "@/services/userService";
import { fetchCurrentUserCardSet } from "@/services/cardSetService";
import type { CurrentUserProfile } from "@/types/user";
import type { Card } from "@/types/card";
import type { Set } from "@/types/set";

export default function HomePage() {
  const [user, setUser] = useState<CurrentUserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // ----- Sets (collections) -----
  const [sets, setSets] = useState<Set[]>([]);

  // ----- Cards (bibliothèque), paginées par 25 -----
  const [cards, setCards] = useState<Card[]>([]);
  const [cardsTotal, setCardsTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

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

        setSets(result.sets);
        setCards(result.cards);
        setCardsTotal(result.pagination.total);
        setTotalPages(result.pagination.pages);
      } catch (err) {
        if (isCancelled) return;
        console.error(err);
        setDataError("Impossible de charger les collections et cartes.");
      } finally {
        if (!isCancelled) setIsLoadingData(false);
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [page]);

  function handleAddCard() {
    setIsAddCardOpen(true);
  }

  function handleCardCreated(newCard: Card) {
    // Ajoute la carte créée en tête de liste, sans refaire d'appel réseau
    setCards((prev) => [newCard, ...prev]);
    setCardsTotal((prev) => prev + 1);
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        activeItem="accueil"
        userName={isLoadingUser ? "Chargement..." : (user?.pseudo ?? "Utilisateur")}
      />

      {/* pl-64 = compense la largeur fixe de la Sidebar (w-64) pour ne pas être recouvert */}
      <div className="flex-1 pl-64">
        <TopBar
          title="Tableau de bord"
          greeting={`Bienvenue, ${user?.pseudo ?? "..."} 👋`}
          onAddClick={handleAddCard}
        />

        <main className="px-8 py-6">
          {dataError && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {dataError}
            </div>
          )}

          {/* ----- Section Collections (sets) ----- */}
          <section>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Mes collections</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cliquez sur une collection pour explorer ses cartes.
                </p>
              </div>
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Tout voir
                <ChevronRight size={16} />
              </button>
            </div>

            {isLoadingData ? (
              <p className="mt-6 text-sm text-muted-foreground">Chargement...</p>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {sets.map((set) => (
                  <SetCard key={set.id} set={set} />
                ))}
              </div>
            )}
          </section>

          {/* ----- Section Bibliothèque (cards, paginées par 25) ----- */}
          <section className="mt-12">
            <h2 className="text-2xl font-semibold tracking-tight">Bibliothèque</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {cardsTotal} cartes possédées
            </p>

            {isLoadingData ? (
              <p className="mt-6 text-sm text-muted-foreground">Chargement des cartes...</p>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                  {cards.map((card) => (
                    <LibraryCard key={card.id} card={card} />
                  ))}
                </div>

                <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </section>
        </main>
      </div>

      <AddCardModal
        isOpen={isAddCardOpen}
        onClose={() => setIsAddCardOpen(false)}
        onCardCreated={handleCardCreated}
      />
    </div>
  );
}