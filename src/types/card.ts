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
  image: string;
  gameTypeId: number;
}

export interface AddCardReturn {
  succces: boolean;
}