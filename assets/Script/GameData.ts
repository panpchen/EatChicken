export const PlayerData = {
  uid: "",
  uname: "",
  isSelf: function (uid: string) {
    return PlayerData.uid === uid;
  },
};

export const GameData = {
  playing: false,
};
