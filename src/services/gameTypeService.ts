import { buildGameType } from "@/mappers/gameTypeMapper";
import type { DataGameType, GameType } from "@/types/gameType";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export async function fetchGameTypes(): Promise<GameType[]> {
    const token = localStorage.getItem("apiToken");

    const res = await fetch(`${API_URL}api/gametype`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        throw new Error("Impossible de récupérer la liste des jeux");
    }

    const response: DataGameType = await res.json();

    console.log("fetchGameTypes: ",response)

    if (!Array.isArray(response.data)) {
        console.error("Format inattendu pour /gameTypes:", response);
        return [];
    }

    return response.data.map(buildGameType);
}