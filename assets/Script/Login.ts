import { GAME_EVENT } from "./Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Login extends cc.Component {
  @property(cc.EditBox)
  editBox: cc.EditBox = null;
  onLoad() {
    this.editBox.string = "";
    cc.director.preloadScene("Game");
  }

  onClickLogin() {
    cc.director.emit(GAME_EVENT.GAME_MULTIPLAYER, this.editBox.string);
    this.editBox.string = "";
  }
}
