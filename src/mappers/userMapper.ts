import type { CurrentUserProfile, OutputCurrentUserProfile } from "@/types/user";

export function buildCurrentUser(payload: OutputCurrentUserProfile): CurrentUserProfile {
    const newPayload: CurrentUserProfile = {
        id: payload.id,
        pseudo: payload.pseudo,
        mail: payload.mail,
    };

    return newPayload;
}