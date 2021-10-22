import BaseScene from "./BaseScene";
import { ALLTIP, GAME_EVENT, SERVER_EVENT, TITLES } from "./Constants";
import { GameChoice, isSelfByName, PlayerData } from "./GameData";
import ObstacleManager from "./ObstacleManager";
import PlayerManager from "./PlayerManager";
import ScrollingBg from "./ScrollingBg";
import Server from "./Server";
import TipManager from "./TipManager";
import TopicBar from "./TopicBar";
import { UIManager, UIType } from "./UI/UIManager";

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
  @property(ScrollingBg)
  scrollingBg: ScrollingBg = null;
  @property(ObstacleManager)
  obstacleManager: ObstacleManager = null;
  @property(cc.Node)
  selectPic: cc.Node = null;

  private _canChoose: boolean = true;
  public static instance: Game = null;

  onLoad() {
    super.onLoad();
    Game.instance = this;
    cc.director.on(GAME_EVENT.GAME_JOINSUCCESS, this._onJoinSuccess, this);
    cc.director.on(GAME_EVENT.GAME_JOINFAILED, this._onJoinFailed, this);
    cc.director.on(GAME_EVENT.GAME_MATCHFAILED, this._onMatchFailed, this);
    cc.director.on(GAME_EVENT.GAME_START, this._onGameStart, this);
    cc.director.on(GAME_EVENT.GAME_OVER, this._onGameOver, this);
    cc.director.on(GAME_EVENT.GAME_NEXT, this._onGameNext, this);
    cc.director.on(GAME_EVENT.GAME_LEAVE, this._onLeave, this);
    cc.director.on(GAME_EVENT.GAME_MOVEMENT, this._onMovement, this);
    this.footer.active = false;
    this.selectPic.opacity = 0;
    this.topicBar.init();
  }

  onDestroy() {
    super.onDestroy();
    cc.director.off(GAME_EVENT.GAME_JOINSUCCESS, this._onJoinSuccess, this);
    cc.director.off(GAME_EVENT.GAME_JOINFAILED, this._onJoinFailed, this);
    cc.director.off(GAME_EVENT.GAME_MATCHFAILED, this._onMatchFailed, this);
    cc.director.off(GAME_EVENT.GAME_START, this._onGameStart, this);
    cc.director.off(GAME_EVENT.GAME_OVER, this._onGameOver, this);
    cc.director.off(GAME_EVENT.GAME_NEXT, this._onGameNext, this);
    cc.director.off(GAME_EVENT.GAME_LEAVE, this._onLeave, this);
    cc.director.off(GAME_EVENT.GAME_MOVEMENT, this._onMovement, this);
  }

  _onGameStart(data) {
    this.unscheduleAllCallbacks();
    this._changeSelectBtnStatus("correct");
    this._updateContent(data);
  }

  _onGameOver(data) {
    if (PlayerData.uname != data.playerName) {
      TipManager.Instance.showTips(`${data.playerName}玩家游戏结束`);
    }
  }

  _onGameNext(data) {
    cc.error("更新下一题: ", data);
    this._updateContent(data);
  }

  _updateContent(data) {
    this.footer.active = true;
    this.obstacleManager.clearObstacle();
    this.topicBar.staticLabel.active = false;
    this.topicBar.topicLabel.node.active = true;
    this.topicBar.node.active = true;
    this.topicBar.showTopicTip(true, data.curTitleId + 1);
    this.topicBar.updateTopicContent(
      data.curTitleId >= TITLES.length
        ? TITLES[TITLES.length - 1]
        : TITLES[data.curTitleId]
    );
    this.topicBar.startGameTime(data.curGameTime, () => {
      this.topicBar.node.active = false;
      this.footer.active = false;
      this.obstacleManager.createObstacle();
    });
  }

  _onJoinSuccess(data) {
    if (isSelfByName(data.joinPlayer.uname)) {
      cc.log(`玩家: ${data.joinPlayer.uname}加入成功`);
      this.scrollingBg.startScroll();
      TipManager.Instance.showTips(ALLTIP.JOINSUCCESS);
      UIManager.instance.hideAll();
      this.topicBar.startMatchTime(data.matchTime, () => {});
    }

    this._refreshOnlinePlayerLabel(data.playerList);
    this.playerManager.createPlayer(data.playerList);
  }

  _onJoinFailed() {
    this._reset();
  }

  _onMatchFailed() {
    UIManager.instance.showUI(UIType.MainUI);
    TipManager.Instance.showTips(ALLTIP.MATCH__NOTENOUGHPEOPLE);
    this.playerManager.removeAllPlayer();
    this._reset();
  }

  _onMovement(data) {
    this.playerManager.movePlayerToPosByIndex(data, () => {
      this._canChoose = true;
    });
  }
  _onLeave(data) {
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
    if (!this._canChoose) {
      return;
    }
    this._canChoose = false;

    switch (parm) {
      case "correct":
        this._changeSelectBtnStatus(parm);
        Server.Instance.send(SERVER_EVENT.CHOICE, {
          choice: GameChoice.correct,
          playerName: PlayerData.uname,
        });
        break;
      case "wrong":
        this._changeSelectBtnStatus(parm);
        Server.Instance.send(SERVER_EVENT.CHOICE, {
          choice: GameChoice.wrong,
          playerName: PlayerData.uname,
        });
        break;
    }
  }

  _showSelectPic(posX: number) {
    this.selectPic.x = posX;

    const widget = this.selectPic.getComponent(cc.Widget);
    widget.isAlignLeft = false;
    widget.isAlignLeft = true;
    widget.isAlignRight = false;
    widget.isAlignRight = true;

    this.selectPic.opacity = 0;
    cc.tween(this.selectPic)
      .to(0.1, { opacity: 255 })
      .delay(0.05)
      .to(0.1, { opacity: 0 })
      .start();
  }
  _changeSelectBtnStatus(parm: string) {
    this._showSelectPic(parm === "correct" ? -190 : 200);

    const correctBtn = this.footer
      .getChildByName("correctBtn")
      .getComponent(cc.Button);
    correctBtn.interactable = parm !== "correct";

    const wrongBtn = this.footer
      .getChildByName("wrongBtn")
      .getComponent(cc.Button);
    wrongBtn.interactable = parm !== "wrong";
  }
  protected onLostConnection() {
    this._reset();
    super.onLostConnection();
  }

  _reset() {
    cc.error("游戏断线 清空数据");
    this._canChoose = true;
  }
}
