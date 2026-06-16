export interface ValidationErrors {
    mail?: string;
    password?: string;
    username?: string;
    confirmPassword?: string;
}

export function validateLogin(mail: string, password: string): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!mail.trim()) {
        errors.mail = "Saisis ton pseudo ou ton e-mail";
    }

    if (password.length < 8) {
        errors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }

    return errors;
}

export function validateRegister(
    username: string,
    mail: string,
    password: string,
    confirmPassword: string
): ValidationErrors {
    const errors: ValidationErrors = validateLogin(mail, password);

    if (!username.trim()) {
        errors.username = "Choisis un pseudo";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (mail.trim() && !emailRegex.test(mail)) {
        errors.mail = "Saisis une adresse e-mail valide";
    }

    if (password !== confirmPassword) {
        errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    return errors;
}