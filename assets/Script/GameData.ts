export interface IPlayer {
  uid: string;
  uname: string;
  uIndex: number;
}

// 玩家自己信息
export const PlayerData: IPlayer = {
  uid: "",
  uname: "",
  uIndex: -1,
};

export function isSelf(uname: string) {
  return PlayerData.uname == uname;
}

export enum GameChoice {
  yes = 0,
  no = 1,
}

export const GameData = {
  playing: false,
  gameChoice: GameChoice.yes,
  totalScore: 0,
  totalCoin: 0,
};
