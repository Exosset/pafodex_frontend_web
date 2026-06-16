import { ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/home/Sidebar";
import { TopBar } from "@/components/home/TopBar";
import { CollectionCard } from "@/components/home/CollectionCard";
import { LibraryCard } from "@/components/home/LibraryCard";
import { mockCollections, mockLibraryCards } from "@/components/home/mockData";

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar activeItem="accueil" userName="Alex Dupont" userPlan="Plan Collector" />

      {/* pl-64 = compense la largeur fixe de la Sidebar (w-64) pour ne pas être recouvert */}
      <div className="flex-1 pl-64">
        <TopBar title="Tableau de bord" greeting="Bienvenue, Alex 👋" />

        <main className="px-8 py-6">
          {/* ----- Section Collections ----- */}
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

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {mockCollections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          </section>

          {/* ----- Section Bibliothèque ----- */}
          <section className="mt-12">
            <h2 className="text-2xl font-semibold tracking-tight">Bibliothèque</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mockLibraryCards.length} cartes possédées · triées par valeur
            </p>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {mockLibraryCards.map((card) => (
                <LibraryCard key={card.id} card={card} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}