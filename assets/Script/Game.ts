import BaseScene from "./BaseScene";
import { ALLTIP, GAME_EVENT, SERVER_EVENT } from "./Constants";
import { GameChoice, GameData, isSelfByName, PlayerData } from "./GameData";
import PlayerManager from "./PlayerManager";
import Server from "./Server";
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
  @property(PlayerManager)
  playerManager: PlayerManager = null;

  onLoad() {
    super.onLoad();
    cc.director.on(GAME_EVENT.GAME_JOINSUCCESS, this._onJoin, this);
    cc.director.on(GAME_EVENT.GAME_JOINFAILED, this._onJoinFailed, this);
    cc.director.on(GAME_EVENT.GAME_START, this._onGameStart, this);
    cc.director.on(GAME_EVENT.GAME_LEAVE, this._onLeave, this);
    this.footer.active = false;
    this.topicBar.init();
  }

  onDestroy() {
    cc.director.off(GAME_EVENT.GAME_JOINSUCCESS, this._onJoin, this);
    cc.director.off(GAME_EVENT.GAME_START, this._onGameStart, this);
    cc.director.off(GAME_EVENT.GAME_JOINFAILED, this._onJoinFailed, this);
    cc.director.off(GAME_EVENT.GAME_LEAVE, this._onLeave, this);
  }

  _onGameStart(data) {
    this.unscheduleAllCallbacks();
    this.topicBar.staticLabel.active = false;
    this.topicBar.topicLabel.node.active = true;
    this.topicBar.startGameTime(data.gameTime);
    this.topicBar.updateTopicContent("这是第1题");
    this.topicBar.showTopicTip(true, 1);
    this.footer.active = true;
  }

  _onJoin(data) {
    if (!GameData.playing) {
      if (isSelfByName(data.joinPlayer.uname)) {
        cc.log(`玩家: ${data.joinPlayer.uname}加入成功}`);
        GameData.playing = true;
        TipManager.Instance.showTips(ALLTIP.JOINSUCCESS);
        UIManager.instance.hideAll();
        this.topicBar.startMatchTime(data.matchTime);
      }
    }

    this._refreshOnlinePlayerLabel(data.playerList);
    this.playerManager.createPlayer(data.playerList);
  }

  _onJoinFailed() {
    UIManager.instance.hideAll();
  }

  _onLeave(data) {
    GameData.playing = false;
    this._refreshOnlinePlayerLabel(data.playerList);
    this.playerManager.removePlayer(data.player);
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
      case "correct":
        Server.Instance.send(SERVER_EVENT.CHOICE, {
          choice: GameChoice.correct,
          uname: PlayerData.uname,
        });
        cc.log("选择对的");
        break;
      case "wrong":
        Server.Instance.send(SERVER_EVENT.CHOICE, {
          choice: GameChoice.wrong,
          uname: PlayerData.uname,
        });
        cc.log("选择错的");
        break;
    }
  }
}
