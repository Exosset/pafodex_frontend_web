import type { AddCard } from "@/types/card";
import type { Card } from "@/types/card";
import type { TcgdexCard } from "@/types/card";
import type { ScryfallCard, ScryfallSearchResponse } from "@/types/card";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const TCGDEX_API_URL = "https://api.tcgdex.net/v2/fr";
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

export async function createCard(payload: AddCard): Promise<Card> {
    const token = localStorage.getItem("apiToken");

    const res = await fetch(`${API_URL}api/cards/add-user-card`, {
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

export async function searchTcgdexCards(query: string): Promise<TcgdexCard[]> {
    if (!query.trim()) return [];
 
    const res = await fetch(`${TCGDEX_API_URL}/cards?name=${encodeURIComponent(query.trim())}`);
 
    if (!res.ok) {
        throw new Error("Impossible de contacter la base de cartes Pokémon.");
    }
 
    const data: TcgdexCard[] = await res.json();
    return data;
}
