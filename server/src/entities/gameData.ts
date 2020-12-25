export enum GameChoice {
  yes,
  no,
}

export interface GameData {
  gameChoice: GameChoice;
  totalScore: number;
  totalCoin: number;
}
