import type { CreateSetPayload } from "@/types/set";

export function buildSetAdd(name: string, color: string, gameTypeId: number): CreateSetPayload {

    console.log("buildSetAdd: ",gameTypeId)

    const payload = { 
        name: name,
        color: color,
        gameTypeId: gameTypeId
    }
        return payload
}
