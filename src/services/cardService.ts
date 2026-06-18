import type {
    AddCard,
    Card,
    OwnedLibraryCard,
    ScryfallCard,
    ScryfallSearchResponse,
    ScryfallCardDetail,
    YgoprodeckCard,
    YgoprodeckCardInfoResponse,
    RiftcodexCard,
    RiftcodexSearchResponse,
} from "@/types/card";

export interface FallbackCardDetail {
    name: string;
    extension?: string;
    number?: string;
    image?: string;
    source: string;
    note: string;
}

export interface UpdateOwnedCardPayload {
    numberCard: number;
    isFavorite: boolean;
}

export async function fetchOwnedCardMetadata(cardId: number): Promise<OwnedLibraryCard | null> {
    const token = localStorage.getItem("apiToken");

    const res = await fetch(`${API_URL}/me/library/cards/${cardId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Impossible de récupérer la carte possédée.");
    }

    return res.json();
}

// Base URL de l'API du projet, avec gestion du cas où la variable d'env contient déjà /api.
const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
const API_URL = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;

// APIs externes utilisées selon le type de jeu.
const SCRYFALL_API_URL = "https://api.scryfall.com";
const YGOPRODECK_API_URL = "https://db.ygoprodeck.com/api/v7";
const RIFTCODEX_API_URL = "https://api.riftcodex.com";

function normalizeForSearch(value: string): string {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function getRelevanceScore(query: string, candidate: string): number {
    const normalizedQuery = normalizeForSearch(query);
    const normalizedCandidate = normalizeForSearch(candidate);

    if (!normalizedQuery || !normalizedCandidate) return 0;
    if (normalizedQuery === normalizedCandidate) return 1000;
    if (normalizedCandidate.startsWith(normalizedQuery)) return 800;

    const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
    const candidateWords = normalizedCandidate.split(/\s+/).filter(Boolean);
    const wholeWordMatches = queryWords.filter((word) => candidateWords.includes(word)).length;

    if (wholeWordMatches === queryWords.length && queryWords.length > 0) {
        return 700 + wholeWordMatches * 10;
    }

    if (normalizedCandidate.includes(normalizedQuery)) {
        return 600;
    }

    if (wholeWordMatches > 0) {
        return 300 + wholeWordMatches * 10;
    }

    return 0;
}

function sortByRelevance<T>(items: T[], query: string, getName: (item: T) => string): T[] {
    return [...items]
        .map((item) => ({
            item,
            score: getRelevanceScore(query, getName(item)),
        }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return getName(a.item).localeCompare(getName(b.item), "fr", { sensitivity: "base" });
        })
        .map((entry) => entry.item);
}

export async function searchScryfallCards(query: string): Promise<ScryfallCard[]> {
    if (!query.trim()) return [];
    const normalizedQuery = query.trim();

    const res = await fetch(
        `${SCRYFALL_API_URL}/cards/search?q=${encodeURIComponent(normalizedQuery)}&unique=art&order=name&dir=asc&include_multilingual=true`
    );

    if (res.status === 404) return [];

    if (!res.ok) {
        throw new Error("Impossible de contacter la base de cartes Magic.");
    }

    const data: ScryfallSearchResponse = await res.json();
    return sortByRelevance(data.data ?? [], normalizedQuery, (card) => card.name);
}

// Recherche la carte Magic en utilisant le nom et, si disponible, le code d'édition exacte.
export async function fetchScryfallCardDetail(
    name: string,
    setCode?: string
): Promise<ScryfallCardDetail | null> {
    const params = new URLSearchParams({
        fuzzy: name.trim(),
        format: "json",
        pretty: "true",
    });

    if (setCode?.trim()) {
        params.set("set", setCode.trim());
    }

    const res = await fetch(`${SCRYFALL_API_URL}/cards/named?${params.toString()}`);

    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Impossible de récupérer les détails de la carte depuis Scryfall.");
    }

    return await res.json();
}

export async function fetchFallbackCardDetail(
    name: string,
    extension?: string,
    number?: string,
    image?: string
): Promise<FallbackCardDetail> {
    return {
        name,
        extension,
        number,
        image,
        source: "API externe non configurée",
        note: "Les détails complets pour ce jeu seront chargés depuis une autre API dès qu'elle sera disponible.",
    };
}

export async function searchYgoprodeckCards(query: string): Promise<YgoprodeckCard[]> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return [];

    const res = await fetch(`${YGOPRODECK_API_URL}/cardinfo.php`);

    if (!res.ok) {
        throw new Error("Impossible de contacter la base de cartes Yu-Gi-Oh!");
    }

    const data: YgoprodeckCardInfoResponse = await res.json();
    const allCards = data.data ?? [];

    return sortByRelevance(allCards, normalizedQuery, (card) => card.name);
}

export async function fetchYgoprodeckCardDetail(name: string): Promise<YgoprodeckCard | null> {
    const params = new URLSearchParams({
        name: name.trim(),
    });

    const res = await fetch(`${YGOPRODECK_API_URL}/cardinfo.php?${params.toString()}`);

    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Impossible de récupérer les détails de la carte depuis Yu-Gi-Oh!");
    }

    const data: YgoprodeckCardInfoResponse = await res.json();
    return data.data?.[0] ?? null;
}

export async function searchRiftcodexCards(query: string): Promise<RiftcodexCard[]> {
    if (!query.trim()) return [];
    const normalizedQuery = query.trim();
    const results: RiftcodexCard[] = [];
    let page = 1;
    const maxPages = 5;

    while (page <= maxPages) {
        const res = await fetch(
            `${RIFTCODEX_API_URL}/cards?query=${encodeURIComponent(normalizedQuery)}&page=${page}`
        );

        if (!res.ok) {
            throw new Error("Impossible de contacter la base de cartes Riftbound.");
        }

        const data: RiftcodexSearchResponse = await res.json();
        const items = data.items ?? [];
        results.push(...items);

        if (!data.pages || page >= data.pages || items.length === 0) {
            break;
        }

        page += 1;
    }

    return sortByRelevance(results, normalizedQuery, (card) => card.name);
}

export async function fetchRiftcodexCardDetail(name: string): Promise<RiftcodexCard | null> {
    const normalizedName = name.trim();
    if (!normalizedName) return null;
    const normalizedQuery = normalizedName;
    let page = 1;
    const maxPages = 5;

    while (page <= maxPages) {
        const res = await fetch(
            `${RIFTCODEX_API_URL}/cards?query=${encodeURIComponent(normalizedQuery)}&page=${page}`
        );

        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error("Impossible de récupérer les détails de la carte depuis Riftbound.");
        }

        const data: RiftcodexSearchResponse = await res.json();
        const items = data.items ?? [];
        const exact = items.find((card) => card.name.toLowerCase() === normalizedName.toLowerCase());
        if (exact) return exact;

        if (!data.pages || page >= data.pages || items.length === 0) {
            break;
        }

        page += 1;
    }

    return null;
}

export async function createCard(payload: AddCard): Promise<Card> {
    const token = localStorage.getItem("apiToken");

    const res = await fetch(`${API_URL}/cards/add-user-card`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error ?? "Impossible d'ajouter la carte");
    }

    return res.json();
}

export async function updateOwnedCardMetadata(cardId: number, payload: UpdateOwnedCardPayload): Promise<void> {
    const token = localStorage.getItem("apiToken");

    const res = await fetch(`${API_URL}/me/library/cards/${cardId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error ?? "Impossible de mettre à jour la quantité de la carte.");
    }
}

export async function deleteLibraryCard(cardId: number): Promise<void> {
    const token = localStorage.getItem("apiToken");

    const res = await fetch(`${API_URL}/me/library/cards/${cardId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error ?? "Impossible de supprimer la carte de la bibliothèque.");
    }
}
