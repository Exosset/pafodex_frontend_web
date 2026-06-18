import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Sidebar } from "@/components/home/Sidebar";
import { TopBar } from "@/components/home/TopBar";
import { fetchCurrentUser } from "@/services/userService";
import {
  fetchFallbackCardDetail,
  fetchOwnedCardMetadata,
  fetchRiftcodexCardDetail,
  fetchScryfallCardDetail,
  updateOwnedCardMetadata,
  fetchYgoprodeckCardDetail,
} from "@/services/cardService";
import type { CurrentUserProfile } from "@/types/user";
import type { RiftcodexCard, ScryfallCardDetail, YgoprodeckCard } from "@/types/card";

function normalizeText(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function matchesKeywords(value: string, keywords: string[]) {
  const normalizedValue = normalizeText(value);
  return keywords.some((keyword) => normalizedValue.includes(keyword));
}

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
  const [scryfallCard, setScryfallCard] = useState<ScryfallCardDetail | null>(null);
  const [ygoprodeckCard, setYgoprodeckCard] = useState<YgoprodeckCard | null>(null);
  const [riftcodexCard, setRiftcodexCard] = useState<RiftcodexCard | null>(null);
  const [fallbackCard, setFallbackCard] = useState<Awaited<ReturnType<typeof fetchFallbackCardDetail>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownedQuantity, setOwnedQuantity] = useState(1);
  const [isQuantityDirty, setIsQuantityDirty] = useState(false);
  const [isSavingQuantity, setIsSavingQuantity] = useState(false);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [quantitySuccess, setQuantitySuccess] = useState<string | null>(null);
  const [ownedCardLoaded, setOwnedCardLoaded] = useState(false);

  const libraryCardId = Number(searchParams.get("libraryCardId") ?? "");
  const hasLibraryCardId = Number.isFinite(libraryCardId) && libraryCardId > 0;
  const initialOwnedNumber = Number(searchParams.get("ownedNumber") ?? "");
  const safeInitialOwnedNumber = Number.isFinite(initialOwnedNumber) && initialOwnedNumber > 0 ? initialOwnedNumber : 1;

  // Charge l'utilisateur courant pour afficher le header et sécuriser l'accès à la page.
  useEffect(() => {
    fetchCurrentUser()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.setItem("apiToken", "");
        navigate("/");
      });
  }, [navigate]);

  useEffect(() => {
    setOwnedQuantity(safeInitialOwnedNumber);
    setIsQuantityDirty(false);
    setQuantityError(null);
    setQuantitySuccess(null);
    setOwnedCardLoaded(false);
  }, [safeInitialOwnedNumber, cardId, searchParams]);

  useEffect(() => {
    if (!hasLibraryCardId) return;

    let isCancelled = false;

    async function loadOwnedCardMetadata() {
      try {
        const metadata = await fetchOwnedCardMetadata(libraryCardId);
        if (isCancelled || !metadata) return;

        const effectiveQuantity = typeof metadata.numberCard === "number" && metadata.numberCard > 0
          ? metadata.numberCard
          : safeInitialOwnedNumber;

        setOwnedQuantity(effectiveQuantity);
        setIsQuantityDirty(false);
        setQuantityError(null);
        setQuantitySuccess(null);
        setOwnedCardLoaded(true);
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
          setQuantityError(err instanceof Error ? err.message : "Impossible de récupérer la quantité de la carte.");
        }
      }
    }

    loadOwnedCardMetadata();

    return () => {
      isCancelled = true;
    };
  }, [hasLibraryCardId, libraryCardId, safeInitialOwnedNumber]);

  // Charge les détails de la carte selon le type de jeu : Magic -> Scryfall, autre -> fallback local.
  useEffect(() => {
    let isCancelled = false;

    async function loadCard() {
      setIsLoading(true);
      setError(null);
      setScryfallCard(null);
      setYgoprodeckCard(null);
      setRiftcodexCard(null);
      setFallbackCard(null);

      try {
        if (!cardId) {
          throw new Error("Aucune carte sélectionnée.");
        }

        const decodedCardName = decodeURIComponent(cardId);
        const setCode = searchParams.get("setCode") ?? undefined;
        const gameTypeId = Number(searchParams.get("gameTypeId") ?? "");
        const gameTypeName = searchParams.get("gameTypeName") ?? "";
        const apiSource = (searchParams.get("apiSource") ?? "").toLowerCase();

        const isMagicById = gameTypeId === 4;
        const isMagicByName = matchesKeywords(gameTypeName, ["magic", "mtg"]);
        const isMagic = isMagicById || isMagicByName;

        const isYgoById = gameTypeId === 5;
        const isYgoByName = matchesKeywords(gameTypeName, ["yu-gi-oh", "yugioh", "ygo"]);
        const isYgo = isYgoById || isYgoByName;

        const isRiftboundByName = matchesKeywords(gameTypeName, ["riftbound", "rift codex", "riftcodex"]);
        const isRiftbound = isRiftboundByName;

        const explicitMagic = apiSource === "magic" || apiSource === "scryfall";
        const explicitYgo = apiSource === "yugioh" || apiSource === "ygo" || apiSource === "ygoprodeck";
        const explicitRiftbound = apiSource === "riftbound" || apiSource === "riftcodex";

        if (explicitMagic || isMagic) {
          const detail = await fetchScryfallCardDetail(decodedCardName, setCode);
          if (isCancelled) return;

          if (!detail) {
            const fallback = await fetchFallbackCardDetail(
              decodedCardName,
              setCode,
              undefined,
              undefined
            );
            if (isCancelled) return;
            setFallbackCard(fallback);
            return;
          }

          setScryfallCard(detail);
        } else if (explicitYgo || isYgo) {
          const detail = await fetchYgoprodeckCardDetail(decodedCardName);
          if (isCancelled) return;

          if (!detail) {
            const fallback = await fetchFallbackCardDetail(
              decodedCardName,
              setCode,
              undefined,
              undefined
            );
            if (isCancelled) return;
            setFallbackCard(fallback);
            return;
          }

          setYgoprodeckCard(detail);
        } else if (explicitRiftbound || isRiftbound) {
          const detail = await fetchRiftcodexCardDetail(decodedCardName);
          if (isCancelled) return;

          if (!detail) {
            const fallback = await fetchFallbackCardDetail(
              decodedCardName,
              setCode,
              undefined,
              undefined
            );
            if (isCancelled) return;
            setFallbackCard(fallback);
            return;
          }

          setRiftcodexCard(detail);
        } else {
          const scryfallDetail = await fetchScryfallCardDetail(decodedCardName, setCode);
          if (isCancelled) return;

          if (scryfallDetail) {
            setScryfallCard(scryfallDetail);
          } else {
            const ygoprodeckDetail = await fetchYgoprodeckCardDetail(decodedCardName);
            if (isCancelled) return;

            if (ygoprodeckDetail) {
              setYgoprodeckCard(ygoprodeckDetail);
            } else {
              const riftcodexDetail = await fetchRiftcodexCardDetail(decodedCardName);
              if (isCancelled) return;

              if (riftcodexDetail) {
                setRiftcodexCard(riftcodexDetail);
              } else {
                const fallback = await fetchFallbackCardDetail(
                  decodedCardName,
                  setCode,
                  undefined,
                  undefined
                );
                if (isCancelled) return;
                setFallbackCard(fallback);
              }
            }
          }
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

  const imageUrl = useMemo(
    () =>
      scryfallCard
        ? getCardImage(scryfallCard)
        : ygoprodeckCard?.card_images?.[0]?.image_url ?? riftcodexCard?.media?.image_url ?? "",
    [scryfallCard, ygoprodeckCard, riftcodexCard]
  );

  function handleOwnedQuantityChange(nextValue: number) {
    if (!Number.isFinite(nextValue)) return;
    const boundedValue = Math.max(1, Math.min(999, nextValue));
    setOwnedQuantity(boundedValue);
    setIsQuantityDirty(boundedValue !== safeInitialOwnedNumber);
    setQuantityError(null);
    setQuantitySuccess(null);
  }

  async function handleSaveOwnedQuantity() {
    if (!hasLibraryCardId) return;

    setIsSavingQuantity(true);
    setQuantityError(null);
    setQuantitySuccess(null);

    try {
      await updateOwnedCardMetadata(libraryCardId, {
        numberCard: ownedQuantity,
        isFavorite: searchParams.get("isFavorite") === "1",
      });
      setIsQuantityDirty(false);
      setQuantitySuccess("Quantité mise à jour.");
      setOwnedCardLoaded(true);
    } catch (err) {
      setQuantityError(err instanceof Error ? err.message : "Impossible de mettre à jour la quantité.");
    } finally {
      setIsSavingQuantity(false);
    }
  }

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

          {hasLibraryCardId && (
            <div className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Collection</p>
                  <h2 className="text-lg font-semibold">
                    Quantité possédée {ownedCardLoaded ? "" : "(chargement...)"}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOwnedQuantityChange(ownedQuantity - 1)}
                    className="h-9 w-9 rounded-lg border border-border text-lg font-medium transition hover:bg-secondary"
                    aria-label="Diminuer la quantité"
                    disabled={isSavingQuantity}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={ownedQuantity}
                    onChange={(e) => handleOwnedQuantityChange(Number(e.target.value))}
                    className="h-9 w-20 rounded-lg border border-border bg-background px-2 text-center text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
                    disabled={isSavingQuantity}
                  />
                  <button
                    type="button"
                    onClick={() => handleOwnedQuantityChange(ownedQuantity + 1)}
                    className="h-9 w-9 rounded-lg border border-border text-lg font-medium transition hover:bg-secondary"
                    aria-label="Augmenter la quantité"
                    disabled={isSavingQuantity}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveOwnedQuantity}
                    disabled={isSavingQuantity || !isQuantityDirty}
                    className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingQuantity ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </div>

              {quantityError && (
                <p className="mt-3 text-sm text-destructive">{quantityError}</p>
              )}
              {quantitySuccess && (
                <p className="mt-3 text-sm text-emerald-600">{quantitySuccess}</p>
              )}
            </div>
          )}

          {isLoading ? (
            <p className="mt-6 text-sm text-muted-foreground">Chargement des informations...</p>
          ) : scryfallCard ? (
            <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={scryfallCard.name}
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
                  <h1 className="text-3xl font-semibold tracking-tight">{scryfallCard.printed_name || scryfallCard.name}</h1>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoBlock label="Type" value={scryfallCard.printed_type_line || scryfallCard.type_line || "—"} />
                  <InfoBlock label="Rareté" value={scryfallCard.rarity ? scryfallCard.rarity.toUpperCase() : "—"} />
                  <InfoBlock label="Édition" value={scryfallCard.set_name || "—"} />
                  <InfoBlock label="Numéro" value={scryfallCard.collector_number || "—"} />
                  <InfoBlock label="Coût de mana" value={scryfallCard.mana_cost || "—"} />
                  <InfoBlock label="Puissance / Endurance" value={scryfallCard.power && scryfallCard.toughness ? `${scryfallCard.power} / ${scryfallCard.toughness}` : "—"} />
                  <InfoBlock label="Loyauté" value={scryfallCard.loyalty || "—"} />
                  <InfoBlock label="Artiste" value={scryfallCard.artist || "—"} />
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="mb-2 text-lg font-semibold">Texte</h2>
                  <p className="whitespace-pre-wrap text-sm text-foreground">
                    {scryfallCard.printed_text || scryfallCard.oracle_text || "Aucun texte disponible."}
                  </p>
                </div>

                {scryfallCard.flavor_text && (
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h2 className="mb-2 text-lg font-semibold">Flavor text</h2>
                    <p className="italic text-sm text-muted-foreground">{scryfallCard.flavor_text}</p>
                  </div>
                )}

                {(scryfallCard.prices?.eur || scryfallCard.prices?.usd) && (
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h2 className="mb-2 text-lg font-semibold">Prix</h2>
                    <div className="flex gap-4 text-sm">
                      {scryfallCard.prices?.eur && <span>EUR : {scryfallCard.prices.eur}</span>}
                      {scryfallCard.prices?.usd && <span>USD : {scryfallCard.prices.usd}</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : ygoprodeckCard ? (
            <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={ygoprodeckCard.name}
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
                  <p className="text-sm text-muted-foreground">Carte Yu-Gi-Oh!</p>
                  <h1 className="text-3xl font-semibold tracking-tight">{ygoprodeckCard.name}</h1>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoBlock label="Type" value={ygoprodeckCard.type || "—"} />
                  <InfoBlock label="Race" value={ygoprodeckCard.race || "—"} />
                  <InfoBlock label="Attribut" value={ygoprodeckCard.attribute || "—"} />
                  <InfoBlock label="Niveau" value={ygoprodeckCard.level ? String(ygoprodeckCard.level) : "—"} />
                  <InfoBlock label="ATK / DEF" value={ygoprodeckCard.atk !== undefined && ygoprodeckCard.def !== undefined ? `${ygoprodeckCard.atk} / ${ygoprodeckCard.def}` : "—"} />
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="mb-2 text-lg font-semibold">Texte</h2>
                  <p className="whitespace-pre-wrap text-sm text-foreground">
                    {ygoprodeckCard.desc || "Aucun texte disponible."}
                  </p>
                </div>

                {ygoprodeckCard.card_sets && ygoprodeckCard.card_sets.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h2 className="mb-2 text-lg font-semibold">Éditions</h2>
                    <div className="space-y-2 text-sm">
                      {ygoprodeckCard.card_sets.map((set) => (
                        <div key={`${set.set_code}-${set.set_name}`} className="flex justify-between gap-4">
                          <span>{set.set_name}</span>
                          <span className="text-muted-foreground">{set.set_code} · {set.set_rarity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : riftcodexCard ? (
            <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={riftcodexCard.name}
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
                  <p className="text-sm text-muted-foreground">Carte Riftbound</p>
                  <h1 className="text-3xl font-semibold tracking-tight">{riftcodexCard.name}</h1>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoBlock label="Type" value={riftcodexCard.classification?.type || "—"} />
                  <InfoBlock label="Rareté" value={riftcodexCard.classification?.rarity || "—"} />
                  <InfoBlock label="Édition" value={riftcodexCard.set?.label || riftcodexCard.set?.set_id || "—"} />
                  <InfoBlock label="Numéro" value={String(riftcodexCard.collector_number ?? riftcodexCard.riftbound_id ?? "—")} />
                  <InfoBlock label="Artiste" value={riftcodexCard.media?.artist || "—"} />
                  <InfoBlock label="Domaines" value={riftcodexCard.classification?.domain?.join(", ") || "—"} />
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="mb-2 text-lg font-semibold">Texte</h2>
                  <p className="whitespace-pre-wrap text-sm text-foreground">
                    {riftcodexCard.text?.plain || "Aucun texte disponible."}
                  </p>
                </div>

                {riftcodexCard.text?.flavour && (
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h2 className="mb-2 text-lg font-semibold">Flavor text</h2>
                    <p className="italic text-sm text-muted-foreground">{riftcodexCard.text.flavour}</p>
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
