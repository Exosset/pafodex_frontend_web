import { buildCardSet } from "@/mappers/cardSetMapper";
import type { OutputCurrentUserCardSet, CurrentUserCardSet } from "@/types/cardSet";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export async function fetchCurrentUserCardSet(page: number): Promise<CurrentUserCardSet> {
    const token = localStorage.getItem("apiToken");

    const res = await fetch(`${API_URL}api/me/library?page=${page}`, {
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