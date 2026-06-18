import { useEffect, useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { Sidebar } from "@/components/home/Sidebar";
import { TopBar } from "@/components/home/TopBar";
import { LibraryCard } from "@/components/home/LibraryCard";
import { PaginationControls } from "@/components/home/PaginationControls";
import { AddCardModal } from "@/components/home/AddCardModal";
import { AddSetModal } from "@/components/home/AddSetModal";
import { Modal } from "@/components/common/Modal";
import { fetchCurrentUser } from "@/services/userService";
import { fetchCurrentUserCardSet } from "@/services/libraryService";
import { fetchSearchCurrentLibrary } from "@/services/libraryService";
import { addCardToSet } from "@/services/setService";
import type { CurrentUserProfile } from "@/types/user";
import type { Card } from "@/types/card";
import type { Set } from "@/types/set";
import { SetCard } from "@/components/home/SetCard";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [user, setUser] = useState<CurrentUserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const navigate = useNavigate();

  // ----- Sets (collections) -----
  const [sets, setSets] = useState<Set[]>([]);

  // ----- Cards (bibliothèque), paginées par 25 -----
  const [cards, setCards] = useState<Card[]>([]);
  const [cardsTotal, setCardsTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // ----- Recherche -----
  const [searchQuery, setSearchQuery] = useState("");
  const isSearching = searchQuery.trim() !== "";

  // ----- Modals -----
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isAddSetOpen, setIsAddSetOpen] = useState(false);
  const [isAddToSetOpen, setIsAddToSetOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isAddingToSet, setIsAddingToSet] = useState(false);
  const [addToSetError, setAddToSetError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("apiToken");
        navigate("/");
      })
      .finally(() => setIsLoadingUser(false));
  }, []);

  // Charge les données normales (sans recherche) — désactivé tant qu'une recherche est active
  useEffect(() => {
    if (isSearching) return;

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
  }, [page, isSearching]);

  // Lance la recherche dès que searchQuery change (déclenché par Entrée dans TopBar)
  useEffect(() => {
    if (!isSearching) return;

    let isCancelled = false;

    async function runSearch() {
      setIsLoadingData(true);
      setDataError(null);

      try {
        const result = await fetchSearchCurrentLibrary(searchQuery.trim(), 1);
        if (isCancelled) return;

        setSets(result.sets);
        setCards(result.cards);
        // La réponse de recherche n'a pas de pagination : tous les résultats
        // correspondants sont renvoyés en une seule fois.
        setCardsTotal(result.cards.length);
        setTotalPages(1);
        setPage(1);
      } catch (err) {
        if (isCancelled) return;
        console.error(err);
        setDataError("Impossible d'effectuer la recherche.");
      } finally {
        if (!isCancelled) setIsLoadingData(false);
      }
    }

    runSearch();

    return () => {
      isCancelled = true;
    };
}, [searchQuery]);

  function handleSearch(query: string) {
    setSearchQuery(query);
  }

  function handleCardCreated(newCard: Card) {
    setCards((prev) => [newCard, ...prev]);
    setCardsTotal((prev) => prev + 1);
  }

  function handleSetCreated(newSet: Set) {
    setSets((prev) => [newSet, ...prev]);
  }

  function openAddToSetModal(card: Card) {
    setSelectedCard(card);
    setAddToSetError(null);
    setIsAddToSetOpen(true);
  }

  async function handleAddCardToSet(setId: number) {
    if (!selectedCard) return;

    setIsAddingToSet(true);
    setAddToSetError(null);

    try {
      await addCardToSet(setId, selectedCard.id);
      setIsAddToSetOpen(false);
      setSelectedCard(null);
    } catch (err) {
      setAddToSetError(err instanceof Error ? err.message : "Impossible d'ajouter la carte.");
    } finally {
      setIsAddingToSet(false);
    }
  }

  const matchingSets = selectedCard
    ? sets.filter((set) => set.gameType.id === selectedCard.gameType.id)
    : [];

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
          onSearch={handleSearch}
        />

        <main className="px-8 py-6">
          {dataError && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {dataError}
            </div>
          )}

          {isSearching && (
            <div className="mb-6 flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-4 py-2.5">
              <p className="text-sm text-foreground">
                Résultats pour <span className="font-semibold">« {searchQuery} »</span>
              </p>
              <button
                type="button"
                onClick={() => handleSearch("")}
                className="text-sm font-medium text-primary hover:underline"
              >
                Effacer
              </button>
            </div>
          )}

          {/* ----- Section Collections (sets) ----- */}
          <section>
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight">Mes collections</h2>
                    {!isSearching && (
                      <button
                        type="button"
                        onClick={() => setIsAddSetOpen(true)}
                        aria-label="Ajouter une collection"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Cliquez sur une collection pour explorer ses cartes.
                  </p>
                </div>
              </div>
              {!isSearching && (
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Tout voir
                  <ChevronRight size={16} />
                </button>
              )}
            </div>

            {isLoadingData ? (
              <p className="mt-6 text-sm text-muted-foreground">Chargement...</p>
            ) : sets.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">Aucune collection trouvée.</p>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {sets.map((set) => (
                  <SetCard key={set.id} set={set} />
                ))}
              </div>
            )}
          </section>

          {/* ----- Section Bibliothèque (cards) ----- */}
          <section className="mt-12">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">Bibliothèque</h2>
              {!isSearching && (
                <button
                  type="button"
                  onClick={() => setIsAddCardOpen(true)}
                  aria-label="Ajouter une carte"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{cardsTotal} cartes possédées</p>

            {isLoadingData ? (
              <p className="mt-6 text-sm text-muted-foreground">Chargement des cartes...</p>
            ) : cards.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">Aucune carte trouvée.</p>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                  {cards.map((card) => (
                    <LibraryCard
                      key={card.id}
                      card={card}
                      onAddToSet={() => openAddToSetModal(card)}
                      onCardClick={() =>
                        navigate(
                          `/card/${encodeURIComponent(card.name)}?setCode=${encodeURIComponent(
                            card.extension
                          )}&gameTypeId=${card.gameType.id}`
                        )
                      }
                    />
                  ))}
                </div>

                {!isSearching && (
                  <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
                )}
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

      <AddSetModal
        isOpen={isAddSetOpen}
        onClose={() => setIsAddSetOpen(false)}
        onSetCreated={handleSetCreated}
      />

      <Modal
        isOpen={isAddToSetOpen}
        onClose={() => {
          setIsAddToSetOpen(false);
          setSelectedCard(null);
          setAddToSetError(null);
        }}
        title={selectedCard ? `Ajouter ${selectedCard.name}` : "Ajouter à une collection"}
      >
        {addToSetError && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {addToSetError}
          </div>
        )}

        {matchingSets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune collection disponible pour ce jeu.
          </p>
        ) : (
          <div className="space-y-2">
            {matchingSets.map((set) => (
              <button
                key={set.id}
                type="button"
                onClick={() => handleAddCardToSet(set.id)}
                disabled={isAddingToSet}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/50 px-4 py-3 text-left transition-colors hover:bg-secondary"
              >
                <div>
                  <p className="font-medium text-foreground">{set.name}</p>
                  <p className="text-xs text-muted-foreground">{set.gameType.name}</p>
                </div>
                <span className="text-sm text-primary">Choisir</span>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}