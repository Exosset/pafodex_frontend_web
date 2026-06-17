export interface Card {
    id: number;
    name: string;
    extension: string;
    number: number;
    image: string;
    gameType: {
        id: number;
        nom: string;
    }
}

export interface AddCard {
    name: string;
    extension: string;
    number: string;
    image: string
    gameTypeId: number;
    libraryId: number;
    hasSelectedExternalCard: boolean;
}

export interface ScryfallCard {
    id: string;
    name: string;
    set: string;
    collector_number: string;
    image_uris?: {
        normal: string;
    };
}

export interface TcgdexCard {
    id: string;
    name: string;
    set: {
        name: string;
    }
    localId: string;
    image: string;
}

export interface ScryfallSearchResponse {
    object: string;
    total_cards?: number;
    data?: ScryfallCard[];
    details?: string; // présent en cas d'erreur (ex: "no cards found")
}