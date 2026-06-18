import type { AddCard, Card, ScryfallCard, ScryfallSearchResponse, ScryfallCardDetail } from "@/types/card";

export interface FallbackCardDetail {
    name: string;
    extension?: string;
    number?: string;
    image?: string;
    source: string;
    note: string;
}

// Base URL de l'API du projet, avec gestion du cas où la variable d'env contient déjà /api.
const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
const API_URL = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;

// API externe utilisée pour Magic.
const SCRYFALL_API_URL = "https://api.scryfall.com";

export async function searchScryfallCards(query: string): Promise<ScryfallCard[]> {
    if (!query.trim()) return [];

    const res = await fetch(
        `${SCRYFALL_API_URL}/cards/search?q=${encodeURIComponent(query.trim())}&unique=art&order=name&dir=asc&include_multilingual=true`
    );

    if (res.status === 404) return [];

    if (!res.ok) {
        throw new Error("Impossible de contacter la base de cartes Magic.");
    }

    const data: ScryfallSearchResponse = await res.json();
    return data.data ?? [];
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