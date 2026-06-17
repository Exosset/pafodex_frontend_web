import type { Card } from "./card";
import type { Pagination } from "./pagination";
import type { Set } from "./set";

export interface OutputCurrentUserCardSet {
    id: number;
    userId: number;
    cards: Card[];
    sets: Set[];
    pagination: Pagination
}

export interface CurrentUserCardSet {
    id: number;
    userId: number;
    cards: Card[];
    sets: Set[];
    pagination: Pagination
}