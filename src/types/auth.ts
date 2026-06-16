export interface AuthInscription {
    email: string;
    pseudo: string;
    password: string;
}

export interface AuthConnexion {
    identifier: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    error?: string;
}