
export interface Set {
      id: number;
      name: string;
      color: string;
      gameType: {
        id: number;
        name: string;
      };
}

export interface CreateSetPayload {
    name: string;
    color: string;
    gameTypeId: number;
}