export interface IPlayer {
  uid: string;
  uname: string;
  uindex: number;
}

export const PlayerData: IPlayer = {
  uid: "",
  uname: "",
  uindex: -1,
};

export function isSelfByName(uname: string) {
  return PlayerData.uname === uname;
}

export const GameData = {
  playing: false,
};
