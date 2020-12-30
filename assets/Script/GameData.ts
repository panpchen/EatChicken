export const PlayerData = {
  uid: "",
  uname: "",
};

export const GameData = {
  playing: false,
};

export function isSelf(uid: string) {
  return PlayerData.uid === uid;
}
