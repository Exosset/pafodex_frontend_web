import type { CreateSetPayload } from "@/types/set";
import type { Set } from "@/types/set";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
const API_URL = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;

export async function createSet(payload: CreateSetPayload): Promise<Set> {
    const token = localStorage.getItem("apiToken");

    const res = await fetch(`${API_URL}/me/sets`, {
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

export async function addCardToSet(setId: number, cardId: number): Promise<void> {
    const token = localStorage.getItem("apiToken");

    const res = await fetch(`${API_URL}/me/sets/${setId}/card`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardId }),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error ?? "Impossible d'ajouter la carte à la collection");
    }
}

export async function removeCardFromSet(setId: number, cardId: number): Promise<void> {
    const token = localStorage.getItem("apiToken");

    async function readErrorMessage(res: Response) {
        const cloned = res.clone();
        const text = await cloned.text();

        if (!text) {
            return `Erreur ${res.status}`;
        }

        try {
            const parsed = JSON.parse(text);
            return parsed?.error ?? parsed?.message ?? text;
        } catch {
            return text;
        }
    }

    const deleteAttempts: Array<{ url: string; init: RequestInit }> = [
        {
            url: `${API_URL}/me/sets/${setId}/card`,
            init: {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                } as HeadersInit,
                body: JSON.stringify({ cardId }),
            } as RequestInit,
        },
        {
            url: `${API_URL}/me/sets/${setId}/card/${cardId}`,
            init: {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                } as HeadersInit,
            } as RequestInit,
        },
        {
            url: `${API_URL}/me/sets/${setId}/card?cardId=${cardId}`,
            init: {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                } as HeadersInit,
            } as RequestInit,
        },
    ];

    let lastError = "Impossible de retirer la carte de la collection";

    for (const attempt of deleteAttempts) {
        const res = await fetch(attempt.url, attempt.init);
        if (res.ok) {
            return;
        }
        lastError = await readErrorMessage(res);
    }

    throw new Error(lastError);
}