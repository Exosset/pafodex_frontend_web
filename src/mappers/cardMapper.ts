import type { AddCard } from "../types/card";

export function buildCardAdd(input: AddCard): AddCard {
    return {
        name: input.name,
        extension: input.extension,
        number: input.number,
        image: input.image,
        gameTypeId: input.gameTypeId,
        libraryId: input.libraryId,
        hasSelectedExternalCard: input.hasSelectedExternalCard
    };
}
