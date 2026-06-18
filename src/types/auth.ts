export interface AuthInscription {
    mail: string;
    pseudo: string;
    password: string;
    passwordConfirm: string;
}

export interface AuthConnexion {
    mail: string;
    password: string;
}

export interface AuthResponse {
    apiToken?: string;
    id?: number;
    error?: string
}

export interface Logout {
    success: boolean
}