export enum GameChoice {
  correct = 0,
  wrong = 1,
}

export interface GameData {
  gameChoice: GameChoice;
  totalScore: number;
  totalCoin: number;
}

export enum OBSTACLE_TYPE {
  HOLE,
  MAMMOTH,
}
