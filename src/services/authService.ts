import type { AuthConnexion, AuthInscription, AuthResponse } from '@/types/auth';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
export async function login(payload: AuthConnexion): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return res.json();
}

export async function register(payload: AuthInscription): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    console.log("sortie", res)
    return res.json();
}