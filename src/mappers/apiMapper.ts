import type { AddCard, ScryfallCard, TcgdexCard } from "@/types/card";

export function mapperAPIScryfall(payload: ScryfallCard, gameTypeId: number, libraryId: number): AddCard {
    const newPayload: AddCard = {
        name: payload.name,
        extension: payload.set,
        number: formatCollectorNumber(payload.collector_number),
        image: payload.image_uris?.normal ?? "",
        gameTypeId,
        libraryId,
        hasSelectedExternalCard: true
    };

    return newPayload;
}

function formatCollectorNumber(collectorNumber: string): string {
    return collectorNumber.padStart(3, "0");
}

export function mapperAPITCGdex(payload : TcgdexCard, gameTypeId: number, libraryId: number): AddCard {
    const newPayload: AddCard = {
        name: payload.name,
        extension: payload.set.name,
        number: formatCollectorNumber(payload.localId),
        image: payload.image ?? "",
        gameTypeId,
        libraryId,
        hasSelectedExternalCard: true
    };

    return newPayload;
}