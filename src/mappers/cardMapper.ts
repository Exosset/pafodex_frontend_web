import type { AddCard } from "../types/card";

export function buildCardAdd(name: string, extension: string, number: string, image: string, gameTypeId: number): AddCard {
    return { name, extension, number, image, gameTypeId };
}