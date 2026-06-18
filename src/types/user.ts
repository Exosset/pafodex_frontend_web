export interface OutputCurrentUserProfile {
    id: number;
    pseudo: string;
    mail: string;
}

export interface CurrentUserProfile {
    id: number;
    pseudo: string;
    mail: string;
}

export interface UpdateProfilePayload {
    pseudo?: string;
    mail?: string;
}

export interface UpdateCurrentUserPayload {
    pseudo: string;
    mail: string;
    password?: string;
    passwordConfirm?: string;
}