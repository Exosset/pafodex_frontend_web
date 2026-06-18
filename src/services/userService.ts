import { buildCurrentUser } from "@/mappers/userMapper";
import type { CurrentUserProfile, OutputCurrentUserProfile } from "@/types/user";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '');
const API_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;

export async function fetchCurrentUser(): Promise<CurrentUserProfile> {
    const token = localStorage.getItem("apiToken");

    const res = await fetch(`${API_URL}/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error("Impossible de récupérer le profil utilisateur");
    }

    const data: OutputCurrentUserProfile = await res.json();
    return buildCurrentUser(data);
}