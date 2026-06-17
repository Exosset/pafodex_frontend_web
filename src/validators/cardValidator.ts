export interface CardValidationErrors {
    name?: string;
    gameTypeId?: string;
}

export function validateCard(name: string, gameTypeId: string): CardValidationErrors {
    const errors: CardValidationErrors = {};

    if (!name.trim()) {
        errors.name = "Le nom de la carte est obligatoire";
    }

    if (!gameTypeId) {
        errors.gameTypeId = "Sélectionne un jeu";
    }

    return errors;
}