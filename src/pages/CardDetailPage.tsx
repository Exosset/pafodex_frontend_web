import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Sidebar } from "@/components/home/Sidebar";
import { TopBar } from "@/components/home/TopBar";
import { fetchCurrentUser } from "@/services/userService";
import { fetchFallbackCardDetail, fetchScryfallCardDetail } from "@/services/cardService";
import type { CurrentUserProfile } from "@/types/user";
import type { ScryfallCardDetail } from "@/types/card";

function getCardImage(card: ScryfallCardDetail) {
  if (card.card_faces?.[0]?.image_uris?.normal) {
    return card.card_faces[0].image_uris.normal;
  }
  if (card.image_uris?.normal) {
    return card.image_uris.normal;
  }
  return "";
}

export default function CardDetailPage() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [user, setUser] = useState<CurrentUserProfile | null>(null);
  const [card, setCard] = useState<ScryfallCardDetail | null>(null);
  const [fallbackCard, setFallbackCard] = useState<Awaited<ReturnType<typeof fetchFallbackCardDetail>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charge l'utilisateur courant pour afficher le header et sécuriser l'accès à la page.
  useEffect(() => {
    fetchCurrentUser()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.setItem("apiToken", "");
        navigate("/");
      });
  }, [navigate]);

  // Charge les détails de la carte selon le type de jeu : Magic -> Scryfall, autre -> fallback local.
  useEffect(() => {
    let isCancelled = false;

    async function loadCard() {
      setIsLoading(true);
      setError(null);
      setCard(null);
      setFallbackCard(null);

      try {
        if (!cardId) {
          throw new Error("Aucune carte sélectionnée.");
        }

        const decodedCardName = decodeURIComponent(cardId);
        const setCode = searchParams.get("setCode") ?? undefined;
        const gameTypeId = Number(searchParams.get("gameTypeId") ?? "");

        // Les cartes Magic utilisent l'API Scryfall, avec une précision supplémentaire par édition.
        if (gameTypeId === 4) {
          const detail = await fetchScryfallCardDetail(decodedCardName, setCode);
          if (isCancelled) return;

          if (!detail) {
            throw new Error(
              "Aucune information Scryfall disponible pour cette carte avec ce nom et cette édition."
            );
          }

          setCard(detail);
        } else {
          // Pour les autres jeux, on garde un affichage de secours jusqu'à la mise en place d'une API dédiée.
          const fallback = await fetchFallbackCardDetail(
            decodedCardName,
            setCode,
            undefined,
            undefined
          );
          if (isCancelled) return;
          setFallbackCard(fallback);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
          setError(err instanceof Error ? err.message : "Impossible de charger la carte.");
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadCard();

    return () => {
      isCancelled = true;
    };
  }, [cardId, searchParams]);

  const imageUrl = useMemo(() => (card ? getCardImage(card) : ""), [card]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar activeItem="collections" userName={user?.pseudo ?? "Utilisateur"} />

      <div className="flex-1 pl-64">
        <TopBar title="Carte" greeting={`Bienvenue, ${user?.pseudo ?? "..."} 👋`} />

        <main className="px-8 py-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ChevronLeft size={16} />
            Retour
          </button>

          {error && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="mt-6 text-sm text-muted-foreground">Chargement des informations...</p>
          ) : card ? (
            <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={card.name}
                    className="w-full rounded-xl object-contain"
                  />
                ) : (
                  <div className="flex h-80 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                    Aucune image disponible
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground">Carte Magic</p>
                  <h1 className="text-3xl font-semibold tracking-tight">{card.printed_name || card.name}</h1>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoBlock label="Type" value={card.printed_type_line || card.type_line || "—"} />
                  <InfoBlock label="Rareté" value={card.rarity ? card.rarity.toUpperCase() : "—"} />
                  <InfoBlock label="Édition" value={card.set_name || "—"} />
                  <InfoBlock label="Numéro" value={card.collector_number || "—"} />
                  <InfoBlock label="Coût de mana" value={card.mana_cost || "—"} />
                  <InfoBlock label="Puissance / Endurance" value={card.power && card.toughness ? `${card.power} / ${card.toughness}` : "—"} />
                  <InfoBlock label="Loyauté" value={card.loyalty || "—"} />
                  <InfoBlock label="Artiste" value={card.artist || "—"} />
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="mb-2 text-lg font-semibold">Texte</h2>
                  <p className="whitespace-pre-wrap text-sm text-foreground">
                    {card.printed_text || card.oracle_text || "Aucun texte disponible."}
                  </p>
                </div>

                {card.flavor_text && (
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h2 className="mb-2 text-lg font-semibold">Flavor text</h2>
                    <p className="italic text-sm text-muted-foreground">{card.flavor_text}</p>
                  </div>
                )}

                {(card.prices?.eur || card.prices?.usd) && (
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h2 className="mb-2 text-lg font-semibold">Prix</h2>
                    <div className="flex gap-4 text-sm">
                      {card.prices?.eur && <span>EUR : {card.prices.eur}</span>}
                      {card.prices?.usd && <span>USD : {card.prices.usd}</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : fallbackCard ? (
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <p className="text-sm text-muted-foreground">Carte non Magic</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{fallbackCard.name}</h1>
              <p className="mt-4 text-sm text-foreground">{fallbackCard.note}</p>
              {fallbackCard.extension && (
                <p className="mt-2 text-sm text-muted-foreground">Édition : {fallbackCard.extension}</p>
              )}
              {fallbackCard.number && (
                <p className="mt-1 text-sm text-muted-foreground">Numéro : {fallbackCard.number}</p>
              )}
              {fallbackCard.image && (
                <img src={fallbackCard.image} alt={fallbackCard.name} className="mt-6 max-h-96 rounded-xl object-contain" />
              )}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}
