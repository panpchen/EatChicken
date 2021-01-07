import BaseScene from "./BaseScene";
import { ALLTIP, GAME_EVENT } from "./Constants";
import { GameData, PlayerData } from "./GameData";
import TipManager from "./TipManager";
import TopicBar from "./TopicBar";
import { UIManager } from "./UI/UIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends BaseScene {
  @property(cc.Label)
  playerListLabel: cc.Label = null;
  @property(cc.Label)
  selfUUIDLabel: cc.Label = null;
  @property(cc.Node)
  footer: cc.Node = null;
  @property(TopicBar)
  topicBar: TopicBar = null;

  onLoad() {
    super.onLoad();
    cc.director.on(GAME_EVENT.GAME_JOIN, this._onJoin, this);
    cc.director.on(GAME_EVENT.GAME_LEAVE, this._onLeave, this);
    this.selfUUIDLabel.string = `uuid: ${PlayerData.uid}`;
    this.footer.active = false;
    this.topicBar.init();
  }

  _onJoin(players) {
    // 判断最后加入的玩家是否是自己
    const lastJoinPlayer = players[players.length - 1];
    if (PlayerData.isSelf(lastJoinPlayer.uid)) {
      cc.log("玩家加入成功, 游戏状态: ", GameData.playing);
      GameData.playing = true;
      TipManager.Instance.showTips(ALLTIP.JOINSUCCESS);
      UIManager.instance.hideAll();
    }

    this._refreshOnlinePlayerLabel(players);

    this._startMatchTime(this._startGame);
  }

  _startMatchTime(callback?: Function) {
    let matchTime: number = 6;
    this.schedule(
      () => {
        this.topicBar.updateTime(matchTime);
        if (matchTime <= 0) {
          cc.log("匹配时间到");
          callback && callback();
          this.unscheduleAllCallbacks();
        }
        matchTime--;
      },
      1,
      cc.macro.REPEAT_FOREVER,
      0.01
    );
  }

  _startGame() {
    cc.log("游戏正式开始");
  }

  _onLeave(players) {
    GameData.playing = false;
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
    }
  }
}
