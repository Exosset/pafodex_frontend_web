import { buildAuthLogout } from '@/mappers/authMapper';
import type { AuthConnexion, AuthInscription, AuthResponse, Logout } from '@/types/auth';

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '');
const API_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;

export async function login(payload: AuthConnexion): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    return res.json();
}

export async function register(payload: AuthInscription): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    return res.json();
}


//se déconnecter
export async function logout(): Promise<Logout> {
    const token = localStorage.getItem("apiToken");

    const res = await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error ?? "Impossible de se déconnecter");
    }

    const data: Logout = await res.json();
    return buildAuthLogout(data);
}