import type { CurrentUserCardSet, OutputCurrentUserCardSet } from "@/types/library";
import type { OutputSearchLibrary, SearchLibraryResponse } from "@/types/library";

export function buildCardSet(payload: OutputCurrentUserCardSet): CurrentUserCardSet {
    return { 
        id: payload.id,
        userId: payload.userId,
        cards: payload.cards,
        sets: payload.sets,
        pagination: payload.pagination
    };
}

export function buildSearchLibrary(payload: OutputSearchLibrary): SearchLibraryResponse {
    return {
        query: payload.query,
        sets: payload.sets,
        cards: payload.cards,
    };
}