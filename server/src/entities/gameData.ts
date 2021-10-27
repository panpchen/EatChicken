export enum GameChoice {
  yes = 0,
  no = 1,
}

export interface GameData {
  gameChoice: GameChoice;
  totalScore: number;
  totalCoin: number;
}

export enum OBSTACLE_TYPE {
  HOLE = "无底洞",
  MAMMOTH = "猛犸",
}
export interface IObstacle {
  type: OBSTACLE_TYPE;
  speed: number;
  ran: number;
}

export const Obstacles: IObstacle[] = [
  {
    type: OBSTACLE_TYPE.HOLE,
    speed: 10,
    ran: 0.6,
  },
  {
    type: OBSTACLE_TYPE.MAMMOTH,
    speed: 10,
    ran: 0.4,
  },
];
