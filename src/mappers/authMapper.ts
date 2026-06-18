import type { AuthConnexion, AuthInscription, Logout } from "../types/auth";

export function buildAuthConnexion(mail: string, password: string): AuthConnexion {
    return { mail, password };
}

export function buildAuthInscription(pseudo: string, mail: string, password: string, passwordConfirm: string): AuthInscription {
    return { mail, pseudo, password, passwordConfirm };
}

export function buildAuthLogout(payload: Logout): Logout {
    return payload;
}