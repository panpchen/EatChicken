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
  @property(cc.Node)
  footer: cc.Node = null;
  @property(TopicBar)
  topicBar: TopicBar = null;

  onLoad() {
    super.onLoad();
    cc.director.on(GAME_EVENT.GAME_JOIN, this._onJoin, this);
    cc.director.on(GAME_EVENT.GAME_FAILED, this._onJoinFailed, this);
    cc.director.on(GAME_EVENT.GAME_START, this._onGameStart, this);
    cc.director.on(GAME_EVENT.GAME_LEAVE, this._onLeave, this);
    this.footer.active = false;
    this.topicBar.init();
  }

  onDestroy() {
    cc.director.off(GAME_EVENT.GAME_JOIN, this._onJoin, this);
    cc.director.off(GAME_EVENT.GAME_START, this._onGameStart, this);
    cc.director.off(GAME_EVENT.GAME_FAILED, this._onJoinFailed, this);
    cc.director.off(GAME_EVENT.GAME_LEAVE, this._onLeave, this);
  }

  _onGameStart(data) {
    this.topicBar.onShowLabel(this.topicBar.staticLabel, false);
    this.topicBar.onShowLabel(this.topicBar.topicLabel.node, true);
    this.topicBar.updateTopicContent("这时第1题");
    this.topicBar.showTip(true, 1);
    this.footer.active = true;
    cc.error("游戏时间: ", data);
  }

  _onJoin(players) {
    // 判断最后加入的玩家是否是自己
    const lastJoinPlayer = players[players.length - 1];
    if (PlayerData.isSelf(lastJoinPlayer.uid)) {
      cc.log("玩家加入成功, 游戏状态isPlaying: ", GameData.playing);
      GameData.playing = true;
      TipManager.Instance.showTips(ALLTIP.JOINSUCCESS);
      UIManager.instance.hideAll();
    }

    this._refreshOnlinePlayerLabel(players);
    this._startMatchTime();
  }

  _onJoinFailed() {
    UIManager.instance.hideAll();
  }

  _startMatchTime() {
    let matchTime: number = 6;
    this.schedule(
      () => {
        this.topicBar.updateTime(matchTime);
        if (matchTime <= 0) {
          cc.log("匹配时间到");
          this.unscheduleAllCallbacks();
        }
        matchTime--;
      },
      1,
      cc.macro.REPEAT_FOREVER,
      0.01
    );
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
