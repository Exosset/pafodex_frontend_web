import type { CreateSetPayload } from "@/types/set";
import type { Set } from "@/types/set";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export async function createSet(payload: CreateSetPayload): Promise<Set> {
    const token = localStorage.getItem("apiToken");

    const res = await fetch(`${API_URL}api/me/sets`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error ?? "Impossible de créer la collection");
    }

    return res.json();
}