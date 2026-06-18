export interface Card {
    id: number;
    name: string;
    extension: string;
    number: number;
    isFavorite?: boolean;
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

export interface OwnedLibraryCard {
    id: number;
    numberCard?: number;
    isFavorite?: boolean;
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

export interface YgoprodeckCard {
    id: number;
    name: string;
    type: string;
    frameType: string;
    desc: string;
    atk?: number;
    def?: number;
    level?: number;
    race?: string;
    attribute?: string;
    card_sets?: Array<{
        set_name: string;
        set_code: string;
        set_rarity: string;
    }>;
    card_images?: Array<{
        image_url: string;
        image_url_small?: string;
    }>;
}

export interface YgoprodeckCardInfoResponse {
    data: YgoprodeckCard[];
}

export interface RiftcodexCard {
    id: string;
    name: string;
    riftbound_id?: string;
    collector_number?: number | string;
    classification?: {
        type?: string;
        rarity?: string;
        domain?: string[];
    };
    set?: {
        set_id?: string;
        label?: string;
    };
    media?: {
        image_url?: string;
        artist?: string;
        accessibility_text?: string;
    };
    text?: {
        rich?: string;
        plain?: string;
        flavour?: string;
    };
}

export interface RiftcodexSearchResponse {
    items?: RiftcodexCard[];
    total?: number;
    page?: number;
    size?: number;
    pages?: number;
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