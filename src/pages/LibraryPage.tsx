import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Sidebar } from "@/components/home/Sidebar";
import { TopBar } from "@/components/home/TopBar";
import { LibraryCard } from "@/components/home/LibraryCard";
import { PaginationControls } from "@/components/home/PaginationControls";
import { AddCardModal } from "@/components/home/AddCardModal";
import { SiteFooter } from "@/components/common/SiteFooter";
import { fetchCurrentUser } from "@/services/userService";
import { fetchCurrentUserCardSet, fetchSearchCurrentLibrary } from "@/services/libraryService";
import { deleteLibraryCard, updateOwnedCardMetadata } from "@/services/cardService";
import type { CurrentUserProfile } from "@/types/user";
import type { Card } from "@/types/card";
import { useNavigate } from "react-router-dom";

export default function LibraryPage() {
  const navigate = useNavigate();
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
  const [searchQuery, setSearchQuery] = useState("");
  const isSearching = searchQuery.trim() !== "";
  const [favoritingCardId, setFavoritingCardId] = useState<number | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedGameTypeId, setSelectedGameTypeId] = useState<number | null>(null);

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
    if (isSearching) return;

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
  }, [page, isSearching]);

  useEffect(() => {
    if (!isSearching) return;

    let isCancelled = false;

    async function runSearch() {
      setIsLoadingData(true);
      setDataError(null);

      try {
        const result = await fetchSearchCurrentLibrary(searchQuery.trim(), 1);
        if (isCancelled) return;

        setCards(result.cards);
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
  }, [searchQuery, isSearching]);

  function handleSearch(query: string) {
    setSearchQuery(query);
  }

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

  async function handleToggleFavorite(card: Card) {
    setFavoritingCardId(card.id);
    setDataError(null);

    try {
      await updateOwnedCardMetadata(card.id, {
        numberCard: card.numberCard > 0 ? card.numberCard : 1,
        isFavorite: !card.isFavorite,
      });

      setCards((prev) =>
        prev.map((item) =>
          item.id === card.id ? { ...item, isFavorite: !item.isFavorite } : item
        )
      );
    } catch (err) {
      console.error(err);
      setDataError(err instanceof Error ? err.message : "Impossible de mettre à jour les favoris.");
    } finally {
      setFavoritingCardId(null);
    }
  }

  const availableGameTypes = Array.from(
    new Map(cards.map((c) => [c.gameType.id, c.gameType])).values()
  ).sort((a, b) => a.nom.localeCompare(b.nom));

  const displayedCards = cards
    .filter((card) => !showFavoritesOnly || card.isFavorite)
    .filter((card) => selectedGameTypeId === null || card.gameType.id === selectedGameTypeId);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        activeItem="bibliotheque"
        userName={isLoadingUser ? "Chargement..." : (user?.pseudo ?? "Utilisateur")}
      />

      <div className="flex min-h-screen flex-1 flex-col pl-[var(--sidebar-width)] transition-[padding] duration-200">
        <TopBar title="Bibliothèque" greeting={`Bienvenue, ${user?.pseudo ?? "..."} 👋`} onSearch={handleSearch} />

        <main className="flex-1 px-8 py-6">
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
              <button
                type="button"
                onClick={() => setShowFavoritesOnly((prev) => !prev)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  showFavoritesOnly
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-secondary"
                }`}
              >
                Favoris uniquement
              </button>
            </div>

            {availableGameTypes.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGameTypeId(null)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    selectedGameTypeId === null
                      ? "border-transparent bg-foreground text-background"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  Tous
                </button>
                {availableGameTypes.map((gt) => (
                  <button
                    key={gt.id}
                    type="button"
                    onClick={() => setSelectedGameTypeId(gt.id === selectedGameTypeId ? null : gt.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      selectedGameTypeId === gt.id
                        ? "border-transparent bg-foreground text-background"
                        : "border-border bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    {gt.nom}
                  </button>
                ))}
              </div>
            )}

            <p className="mt-1 text-sm text-muted-foreground">{cardsTotal} cartes possédées</p>

            {isLoadingData ? (
              <p className="mt-6 text-sm text-muted-foreground">Chargement des cartes...</p>
            ) : displayedCards.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">Aucune carte trouvée.</p>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                  {displayedCards.map((card) => (
                    <LibraryCard
                      key={card.id}
                      card={card}
                      onDeleteFromLibrary={() => handleDeleteFromLibrary(card.id)}
                      isDeletingFromLibrary={deletingCardId === card.id}
                      onToggleFavorite={() => handleToggleFavorite(card)}
                      isTogglingFavorite={favoritingCardId === card.id}
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

                {!showFavoritesOnly && selectedGameTypeId === null && <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />}
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