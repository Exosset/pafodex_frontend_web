import { buildGameType } from "@/mappers/gameTypeMapper";
import type { DataGameType, GameType } from "@/types/gameType";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
const API_URL = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;

export async function fetchGameTypes(): Promise<GameType[]> {
    const token = localStorage.getItem("apiToken");

    const res = await fetch(`${API_URL}/gametype`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        throw new Error("Impossible de récupérer la liste des jeux");
    }

    const response: DataGameType = await res.json();

    if (!Array.isArray(response.data)) {
        return [];
    }

    return response.data.map(buildGameType);
}