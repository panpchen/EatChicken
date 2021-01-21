export interface IPlayer {
  uid: string;
  uname: string;
  uindex: number;
}

// 玩家自己信息
export const PlayerData: IPlayer = {
  uid: "",
  uname: "",
  uindex: -1,
};

export function isSelfByName(uname: string) {
  return PlayerData.uname === uname;
}

export enum GameChoice {
  correct = 0,
  wrong = 1,
}

export const GameData = {
  playing: false,
  gameChoice: GameChoice.correct,
  totalScore: 0,
  totalCoin: 0,
};
