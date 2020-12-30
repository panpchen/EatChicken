import BaseScene from "./BaseScene";
import { ALLTIP, GAME_EVENT } from "./Constants";
import { isSelf, PlayerData } from "./GameData";
import Server from "./Server";
import TipManager from "./TipManager";
import { UIManager } from "./UI/UIManager";

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
    cc.director.on(GAME_EVENT.GAME_LEAVE, this._onLeave, this);
    this.selfUUIDLabel.string = `uuid: ${PlayerData.uid}`;
  }

  _onJoin(players) {
    if (players.length === 0) {
      return;
    }

    // 判断最后加入的玩家是否是自己
    const lastJoinPlayer = players[players.length - 1];
    if (isSelf(lastJoinPlayer.uid)) {
      cc.log("玩家加入成功");
      TipManager.Instance.showTips(ALLTIP.JOINSUCCESS);
      UIManager.instance.hideAll();
    }

    this._refreshOnlinePlayerLabel(players);
  }

  _onLeave(players) {
    this._refreshOnlinePlayerLabel(players);
  }

  _refreshOnlinePlayerLabel(players) {
    this.playerListLabel.string = "";

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const prefix = "当前大厅玩家: ";
      if (!this.playerListLabel.string.includes(prefix)) {
        this.playerListLabel.string = `${prefix}${this.playerListLabel.string}`;
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
