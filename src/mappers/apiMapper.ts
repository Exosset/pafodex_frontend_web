import type { AddCard, ScryfallCard } from "@/types/card";

export function mapperAPIScryfall(payload: ScryfallCard, gameTypeId: number, libraryId: number): AddCard {
    const newPayload: AddCard = {
        name: payload.name,
        extension: payload.set,
        number: formatCollectorNumber(payload.collector_number),
        image: payload.image_uris?.normal ?? "",
        gameTypeId,
        libraryId,
    };
 
    return newPayload;
}
 
function formatCollectorNumber(collectorNumber: string): string {
    return collectorNumber.padStart(3, "0");
}
 
