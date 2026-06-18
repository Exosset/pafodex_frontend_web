import type { AddCard } from "@/types/card";

const FALLBACK_EXTENSION = "—";
const FALLBACK_NUMBER = "—";
const FALLBACK_IMAGE = "";

export interface CardFormInput {
    name: string;
    extension: string;
    number: string;
    image: string;
    gameTypeId: number;
    libraryId: number;
    hasSelectedExternalCard: boolean;
}

export function buildCardAdd(input: CardFormInput): AddCard {
    return {
        name: input.name,
        extension: input.hasSelectedExternalCard ? input.extension : FALLBACK_EXTENSION,
        number: input.hasSelectedExternalCard ? input.number : FALLBACK_NUMBER,
        image: input.hasSelectedExternalCard ? input.image : FALLBACK_IMAGE,
        gameTypeId: input.gameTypeId,
        libraryId: input.libraryId,
    };
}