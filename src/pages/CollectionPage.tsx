import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Sidebar } from "@/components/home/Sidebar";
import { TopBar } from "@/components/home/TopBar";
import { SetCard } from "@/components/home/SetCard";
import { AddSetModal } from "@/components/home/AddSetModal";
import { fetchCurrentUser } from "@/services/userService";
import { fetchCurrentUserCardSet } from "@/services/libraryService";
import type { CurrentUserProfile } from "@/types/user";
import type { Set } from "@/types/set";

const GAME_TYPE_COLORS: Record<string, string> = {
  Pokémon: "var(--color-pokemon)",
  Pokemon: "var(--color-pokemon)",
  "Magic The Gathering": "var(--color-mtg)",
  Magic: "var(--color-mtg)",
  "Yu-Gi-Oh!": "var(--color-yugioh)",
  "One Piece": "var(--color-onepiece)",
};

export default function CollectionsPage() {
  const [user, setUser] = useState<CurrentUserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // ----- Sets (collections) -----
  const [sets, setSets] = useState<Set[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [selectedGameTypeIds, setSelectedGameTypeIds] = useState<number[]>([]);

  // ----- Modal d'ajout de set -----
  const [isAddSetOpen, setIsAddSetOpen] = useState(false);

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
        // On utilise la page 1 uniquement pour récupérer la liste des sets,
        // qui n'est pas paginée côté backend (contrairement aux cartes).
        const result = await fetchCurrentUserCardSet(1);
        if (isCancelled) return;

        setSets(result.sets);
      } catch (err) {
        if (isCancelled) return;
        console.error(err);
        setDataError("Impossible de charger les collections.");
      } finally {
        if (!isCancelled) setIsLoadingData(false);
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, []);

  const gameTypes = useMemo(() => {
    return Array.from(
      new Map(
        sets.map((set) => [set.gameType.id, set.gameType])
      ).values()
    );
  }, [sets]);

  const filteredSets = useMemo(() => {
    if (selectedGameTypeIds.length === 0) {
      return sets;
    }

    return sets.filter((set) => selectedGameTypeIds.includes(set.gameType.id));
  }, [selectedGameTypeIds, sets]);

  function toggleGameType(gameTypeId: number) {
    setSelectedGameTypeIds((prev) =>
      prev.includes(gameTypeId)
        ? prev.filter((id) => id !== gameTypeId)
        : [...prev, gameTypeId]
    );
  }

  function handleSetCreated(newSet: Set) {
    setSets((prev) => [newSet, ...prev]);
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        activeItem="collections"
        userName={isLoadingUser ? "Chargement..." : (user?.pseudo ?? "Utilisateur")}
      />

      {/* pl-64 = compense la largeur fixe de la Sidebar (w-64) pour ne pas être recouvert */}
      <div className="flex-1 pl-64">
        <TopBar title="Collections" greeting={`Bienvenue, ${user?.pseudo ?? "..."} 👋`} />

        <main className="px-8 py-6">
          {dataError && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {dataError}
            </div>
          )}

          {/* ----- Section Collections (sets) ----- */}
          <section>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">Mes collections</h2>
              <button
                type="button"
                onClick={() => setIsAddSetOpen(true)}
                aria-label="Ajouter une collection"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus size={16} />
              </button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Cliquez sur une collection pour explorer ses cartes.
            </p>

            {!isLoadingData && gameTypes.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-sm text-muted-foreground">Filtrer :</span>
                {gameTypes.map((gameType) => {
                  const isSelected = selectedGameTypeIds.includes(gameType.id);
                  const accent = GAME_TYPE_COLORS[gameType.name] ?? "var(--color-primary)";

                  return (
                    <button
                      key={gameType.id}
                      type="button"
                      onClick={() => toggleGameType(gameType.id)}
                      style={{ backgroundColor: isSelected ? accent : "transparent", color: isSelected ? "white" : "inherit" }}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                        isSelected
                          ? "border-transparent shadow-sm"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
                      {gameType.name}
                    </button>
                  );
                })}
              </div>
            )}

            {isLoadingData ? (
              <p className="mt-6 text-sm text-muted-foreground">Chargement...</p>
            ) : filteredSets.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">
                Aucune collection ne correspond à ce filtre.
              </p>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {filteredSets.map((set) => (
                  <SetCard key={set.id} set={set} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      <AddSetModal
        isOpen={isAddSetOpen}
        onClose={() => setIsAddSetOpen(false)}
        onSetCreated={handleSetCreated}
      />
    </div>
  );
}