export interface SetValidationErrors {
    name?: string;
    color?: string;
    gameTypeId?: string;
}

const HEX_COLOR_REGEX = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;

export function validateSet(name: string, color: string, gameTypeId: string): SetValidationErrors {
    const errors: SetValidationErrors = {};

    if (!name.trim()) {
        errors.name = "Le nom de la collection est obligatoire";
    }

    if (!color.trim()) {
        errors.color = "Choisis une couleur";
    } else if (!HEX_COLOR_REGEX.test(color.trim())) {
        errors.color = "La couleur doit être un code hexadécimal valide (ex: #6265ED)";
    }

    if (!gameTypeId) {
        errors.gameTypeId = "Sélectionne un jeu";
    }

    return errors;
}