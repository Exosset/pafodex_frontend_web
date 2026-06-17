import type { CurrentUserCardSet, OutputCurrentUserCardSet } from "@/types/cardSet";

export function buildCardSet(payload: OutputCurrentUserCardSet): CurrentUserCardSet {
            console.log("récupérer carte: ",payload)
    return { 
        id: payload.id,
        userId: payload.userId,
        cards: payload.cards,
        sets: payload.sets,
        pagination: payload.pagination
    };
}