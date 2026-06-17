import type { GameType } from "@/types/gameType";

export function buildGameType(payload: GameType): GameType {
    console.log("buildGameType: ", payload)
    return { 
        id: payload.id,
        name: payload.name
    };
}