import type { AuthConnexion, AuthInscription } from "../types/auth";

export function buildAuthConnexion(identifier: string, password: string): AuthConnexion {
    return { identifier, password };
}

export function buildAuthInscription(pseudo: string, email: string, password: string): AuthInscription {
    return { email, pseudo, password };
}