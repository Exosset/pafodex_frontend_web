import { buildCardSet, buildSearchLibrary } from "@/mappers/libraryMapper";
import type { OutputCurrentUserCardSet, CurrentUserCardSet, OutputSearchLibrary, SearchLibraryResponse } from "@/types/library";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
const API_URL = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;

export async function fetchCurrentUserCardSet(page: number): Promise<CurrentUserCardSet> {
    const token = localStorage.getItem("apiToken");

    const res = await fetch(`${API_URL}/me/library?page=${page}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error("Impossible de récupérer les cartes et collections de l'utilisateur");
    }

    const data: OutputCurrentUserCardSet = await res.json();
    return buildCardSet(data);
}

export async function fetchSearchCurrentLibrary(text: string, page: number): Promise<SearchLibraryResponse> {
    const token = localStorage.getItem("apiToken");

    const res = await fetch(
        `${API_URL}/me/library/search?q=${encodeURIComponent(text)}&page=${page}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!res.ok) {
        throw new Error("Impossible d'effectuer la recherche.");
    }

    const data: OutputSearchLibrary = await res.json();
    return buildSearchLibrary(data);
}


