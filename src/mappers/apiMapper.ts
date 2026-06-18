import type { AddCard, ScryfallCard, YgoprodeckCard, RiftcodexCard } from "@/types/card";

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

export function mapperAPIYugioh(payload: YgoprodeckCard, gameTypeId: number, libraryId: number): AddCard {
    const firstSet = payload.card_sets?.[0];
    const firstImage = payload.card_images?.[0];

    const newPayload: AddCard = {
        name: payload.name,
        extension: firstSet?.set_name ?? firstSet?.set_code ?? "",
        number: firstSet?.set_code ?? String(payload.id),
        image: firstImage?.image_url ?? "",
        gameTypeId,
        libraryId,
    };

    return newPayload;
}

export function mapperAPIRiftbound(payload: RiftcodexCard, gameTypeId: number, libraryId: number): AddCard {
    const newPayload: AddCard = {
        name: payload.name,
        extension: payload.set?.label ?? payload.set?.set_id ?? "",
        number: String(payload.collector_number ?? payload.riftbound_id ?? ""),
        image: payload.media?.image_url ?? "",
        gameTypeId,
        libraryId,
    };

    return newPayload;
}
