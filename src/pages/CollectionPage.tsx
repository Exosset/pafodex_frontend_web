import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Sidebar } from "@/components/home/Sidebar";
import { TopBar } from "@/components/home/TopBar";
import { SetCard } from "@/components/home/SetCard";
import { AddSetModal } from "@/components/home/AddSetModal";
import { fetchCurrentUser } from "@/services/userService";
import { fetchCurrentUserCardSet } from "@/services/cardSetService";
import type { CurrentUserProfile } from "@/types/user";
import type { Set } from "@/types/set";

export default function CollectionsPage() {
  const [user, setUser] = useState<CurrentUserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // ----- Sets (collections) -----
  const [sets, setSets] = useState<Set[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

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