import { ALLTIP, GAME_EVENT, SERVER_EVENT } from "./Constants";
import Server from "./Server";
import { v1 as uuidv1 } from "uuid";
import TipManager from "./TipManager";
import { PlayerData } from "./GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Login extends cc.Component {
  @property(cc.EditBox)
  editBox: cc.EditBox = null;
  @property(cc.Node)
  loginBtn: cc.Node = null;

  onLoad() {
    cc.director.on(GAME_EVENT.GAME_LOGINGAME, this._onLoginGame, this);
    this.loginBtn.on("click", this._onClickLogin, this);
    cc.director.preloadScene("Game");
  }

  onDestroy() {
    cc.director.off(GAME_EVENT.GAME_LOGINGAME, this._onLoginGame, this);
  }

  _onLoginGame() {
    Server.Instance.send(SERVER_EVENT.HELLO, {
      user: {
        uid: PlayerData.uid,
        uname: PlayerData.uname,
      },
    });
    // this.editBox.string = "";
  }

  _onClickLogin() {
    if (this.editBox.string.length === 0) {
      TipManager.Instance.showTips(ALLTIP.USERNAME_NULL);
      return;
    }

    PlayerData.uid = uuidv1();
    PlayerData.uname = this.editBox.string.trim();

    Server.Instance.connect();
  }
}
