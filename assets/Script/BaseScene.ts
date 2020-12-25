// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { GAME_EVENT } from "./Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseScene extends cc.Component {
  onLoad() {
    cc.director.on(
      GAME_EVENT.GAME_LOSTCONNECTTION,
      this._onLostConnection,
      this
    );
  }

  onDestroy() {
    cc.director.off(
      GAME_EVENT.GAME_LOSTCONNECTTION,
      this._onLostConnection,
      this
    );
  }

  _onLostConnection() {
    cc.director.loadScene("Login");
  }
}
