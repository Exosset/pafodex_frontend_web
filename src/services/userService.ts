import { buildCurrentUser } from "@/mappers/userMapper";
import type { CurrentUserProfile, OutputCurrentUserProfile } from "@/types/user";

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export async function fetchCurrentUser(): Promise<CurrentUserProfile> {
    const token = localStorage.getItem("apiToken");

    console.log(token)

    const res = await fetch(`${API_URL}api/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error("Impossible de récupérer le profil utilisateur");
    }

    const data: OutputCurrentUserProfile = await res.json();
    console.log("data_test: ", data)
    return buildCurrentUser(data);
}