export interface ValidationErrors {
    identifier?: string;
    password?: string;
    username?: string;
    confirmPassword?: string;
}

export function validateLogin(identifier: string, password: string): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!identifier.trim()) {
        errors.identifier = "Saisis ton pseudo ou ton e-mail";
    }

    if (password.length < 8) {
        errors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }

    return errors;
}

export function validateRegister(
    username: string,
    identifier: string,
    password: string,
    confirmPassword: string
): ValidationErrors {
    const errors: ValidationErrors = validateLogin(identifier, password);

    if (!username.trim()) {
        errors.username = "Choisis un pseudo";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (identifier.trim() && !emailRegex.test(identifier)) {
        errors.identifier = "Saisis une adresse e-mail valide";
    }

    if (password !== confirmPassword) {
        errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    return errors;
}