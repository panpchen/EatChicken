import BaseScene from "./BaseScene";
import { GAME_EVENT } from "./Constants";
import { PlayerData } from "./GameData";
import Server from "./Server";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends BaseScene {
  @property(cc.Label)
  topicLabel: cc.Label = null;
  @property(cc.Label)
  playerListLabel: cc.Label = null;
  @property(cc.Label)
  selfUUIDLabel: cc.Label = null;
  onLoad() {
    super.onLoad();
    cc.director.on(GAME_EVENT.GAME_JOIN, this._onJoin, this);
    this.selfUUIDLabel.string = `uuid: ${PlayerData.uid}`;
  }

  _onJoin(players) {
    this.playerListLabel.string = "";

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      if (!this.playerListLabel.string.includes("当前大厅玩家:")) {
        this.playerListLabel.string = `当前大厅玩家: ${this.playerListLabel.string}`;
      }
      this.playerListLabel.string += `${player.uname}，`;
    }
  }

  onClickEvent(evt, parm) {
    switch (parm) {
      case "yes":
        cc.log("选择对的");
        break;
      case "no":
        cc.log("选择错的");
        break;
      case "closeServer":
        Server.Instance.closeServer();
        cc.log("客户端主动断开连接");
        break;
    }
  }
}
