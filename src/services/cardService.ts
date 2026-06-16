import type { AddCard } from "@/types/card";
import type { Card } from "@/types/card";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export async function createCard(payload: AddCard): Promise<Card> {
    const token = localStorage.getItem("apiToken");

    const res = await fetch(`${API_URL}api/cards`, {
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