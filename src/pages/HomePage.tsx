import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Sidebar } from "@/components/home/Sidebar";
import { TopBar } from "@/components/home/TopBar";
import { LibraryCard } from "@/components/home/LibraryCard";
import { PaginationControls } from "@/components/home/PaginationControls";
import { AddCardModal } from "@/components/home/AddCardModal";
import { AddSetModal } from "@/components/home/AddSetModal";
import { Modal } from "@/components/common/Modal";
import { SiteFooter } from "@/components/common/SiteFooter";
import { fetchCurrentUser } from "@/services/userService";
import { fetchCurrentUserCardSet, fetchSearchCurrentLibrary } from "@/services/libraryService";
import { addCardToSet, deleteSet } from "@/services/setService";
import { deleteLibraryCard, updateOwnedCardMetadata } from "@/services/cardService";
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
  const [deletingCardId, setDeletingCardId] = useState<number | null>(null);
  const [deletingSetId, setDeletingSetId] = useState<number | null>(null);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);
  const [favoritingCardId, setFavoritingCardId] = useState<number | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedGameTypeId, setSelectedGameTypeId] = useState<number | null>(null);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [dropTargetSetId, setDropTargetSetId] = useState<number | null>(null);
  const [droppingSetId, setDroppingSetId] = useState<number | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!deleteSuccessMessage) return;

    const timeoutId = window.setTimeout(() => {
      setDeleteSuccessMessage(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [deleteSuccessMessage]);

  useEffect(() => {
    if (!toastError) return;

    const timeoutId = window.setTimeout(() => {
      setToastError(null);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [toastError]);

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

  async function handleDeleteFromLibrary(cardId: number) {
    setDeletingCardId(cardId);
    setDataError(null);

    try {
      await deleteLibraryCard(cardId);
      setCards((prev) => prev.filter((card) => card.id !== cardId));
      setCardsTotal((prev) => Math.max(0, prev - 1));
      setDeleteSuccessMessage("Carte supprimée avec succès.");
    } catch (err) {
      console.error(err);
      setDataError(err instanceof Error ? err.message : "Impossible de supprimer la carte de la bibliothèque.");
    } finally {
      setDeletingCardId(null);
    }
  }

  async function handleDeleteSet(setId: number) {
    setDeletingSetId(setId);
    setDataError(null);

    try {
      await deleteSet(setId);
      setSets((prev) => prev.filter((set) => set.id !== setId));
      setDeleteSuccessMessage("Collection supprimée avec succès.");
    } catch (err) {
      console.error(err);
      setDataError(err instanceof Error ? err.message : "Impossible de supprimer la collection.");
    } finally {
      setDeletingSetId(null);
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

  function isSetCompatibleWithCard(set: Set, card: Card) {
    return set.gameType.id === card.gameType.id;
  }

  function handleCardDragStart(card: Card) {
    setDraggedCard(card);
    setDropTargetSetId(null);
    setDataError(null);
  }

  function handleCardDragEnd() {
    setDraggedCard(null);
    setDropTargetSetId(null);
  }

  function handleSetDragOver(event: React.DragEvent<HTMLDivElement>, set: Set) {
    if (!draggedCard || droppingSetId !== null) {
      return;
    }

    event.preventDefault();
    const isCompatible = isSetCompatibleWithCard(set, draggedCard);
    event.dataTransfer.dropEffect = isCompatible ? "move" : "none";

    if (!isCompatible) {
      if (dropTargetSetId !== null) {
        setDropTargetSetId(null);
      }
      return;
    }

    if (dropTargetSetId !== set.id) {
      setDropTargetSetId(set.id);
    }
  }

  function handleSetDragLeave(setId: number) {
    if (dropTargetSetId === setId) {
      setDropTargetSetId(null);
    }
  }

  async function handleSetDrop(event: React.DragEvent<HTMLDivElement>, set: Set) {
    event.preventDefault();

    if (!draggedCard) {
      return;
    }

    if (!isSetCompatibleWithCard(set, draggedCard)) {
      setToastError(`Impossible d'ajouter « ${draggedCard.name} » : ce set est pour « ${set.gameType.name} », pas pour « ${draggedCard.gameType.nom} ».`);
      setDropTargetSetId(null);
      setDraggedCard(null);
      return;
    }

    setDroppingSetId(set.id);
    setDataError(null);

    try {
      await addCardToSet(set.id, draggedCard.id);
      setDeleteSuccessMessage(`Carte ajoutée à la collection « ${set.name} ».`);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : "Impossible d'ajouter la carte.");
    } finally {
      setDroppingSetId(null);
      setDropTargetSetId(null);
      setDraggedCard(null);
    }
  }

  const matchingSets = selectedCard
    ? sets.filter((set) => set.gameType.id === selectedCard.gameType.id)
    : [];

  const availableGameTypes = Array.from(
    new Map(cards.map((c) => [c.gameType.id, c.gameType])).values()
  ).sort((a, b) => a.nom.localeCompare(b.nom));

  const displayedCards = cards
    .filter((card) => !showFavoritesOnly || card.isFavorite)
    .filter((card) => selectedGameTypeId === null || card.gameType.id === selectedGameTypeId);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        activeItem="accueil"
        userName={isLoadingUser ? "Chargement..." : (user?.pseudo ?? "Utilisateur")}
      />

      <div className="flex min-h-screen flex-1 flex-col pl-[var(--sidebar-width)] transition-[padding] duration-200">
        <TopBar title="Tableau de bord" greeting={`Bienvenue, ${user?.pseudo ?? "..."} 👋`} onSearch={handleSearch} />

        {toastError && (
        <div
          aria-live="assertive"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 max-w-sm w-[calc(100%-2rem)] rounded-xl border border-destructive/40 bg-destructive/95 px-4 py-3 text-sm font-medium text-destructive-foreground shadow-lg backdrop-blur-sm transition-all"
        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0">✗</span>
            <span>{toastError}</span>
            <button
              type="button"
              onClick={() => setToastError(null)}
              aria-label="Fermer"
              className="ml-auto shrink-0 opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 px-8 py-6">
          {deleteSuccessMessage && (
            <div className="mb-6 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
              {deleteSuccessMessage}
            </div>
          )}

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
            </div>

            {isLoadingData ? (
              <p className="mt-6 text-sm text-muted-foreground">Chargement...</p>
            ) : sets.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">Aucune collection trouvée.</p>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {sets.map((set) => (
                  <SetCard
                    key={set.id}
                    set={set}
                    onDelete={() => handleDeleteSet(set.id)}
                    onDragOverCard={(event) => handleSetDragOver(event, set)}
                    onDragLeaveCard={() => handleSetDragLeave(set.id)}
                    onDropCard={(event) => {
                      void handleSetDrop(event, set);
                    }}
                    isCardDragActive={draggedCard !== null}
                    isDropTarget={dropTargetSetId === set.id}
                    isDropDisabled={draggedCard ? !isSetCompatibleWithCard(set, draggedCard) : false}
                    isDropping={droppingSetId === set.id}
                    isDeleting={deletingSetId === set.id}
                  />
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
                      onAddToSet={() => openAddToSetModal(card)}
                      onDeleteFromLibrary={() => handleDeleteFromLibrary(card.id)}
                      isDeletingFromLibrary={deletingCardId === card.id}
                      onToggleFavorite={() => handleToggleFavorite(card)}
                      isTogglingFavorite={favoritingCardId === card.id}
                      isDraggableToSet={true}
                      onDragToSetStart={handleCardDragStart}
                      onDragToSetEnd={handleCardDragEnd}
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
                {!isSearching && !showFavoritesOnly && selectedGameTypeId === null && (
                  <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
                )}
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