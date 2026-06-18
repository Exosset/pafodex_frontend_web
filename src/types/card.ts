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
    name: string;
    set: {
        name: string;
    };
    localId: string;
    image?: string;
}

export interface ScryfallCardDetail {
    id: string;
    name: string;
    printed_name?: string;
    printed_type_line?: string;
    printed_text?: string;
    oracle_text?: string;
    flavor_text?: string;
    type_line?: string;
    mana_cost?: string;
    cmc?: number;
    power?: string;
    toughness?: string;
    loyalty?: string;
    rarity?: string;
    set_name?: string;
    collector_number?: string;
    artist?: string;
    lang?: string;
    image_uris?: {
        large?: string;
        normal?: string;
        small?: string;
    };
    card_faces?: Array<{
        name?: string;
        printed_name?: string;
        type_line?: string;
        printed_type_line?: string;
        printed_text?: string;
        oracle_text?: string;
        mana_cost?: string;
        image_uris?: {
            large?: string;
            normal?: string;
            small?: string;
        };
    }>;
    prices?: {
        eur?: string | null;
        usd?: string | null;
    };
    legalities?: Record<string, string>;
}

export interface ScryfallSearchResponse {
    object: string;
    total_cards?: number;
    data?: ScryfallCard[];
    details?: string; // présent en cas d'erreur (ex: "no cards found")
}