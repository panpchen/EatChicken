// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { GAME_EVENT } from "./Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {
  onLoad() {
    cc.game.addPersistRootNode(this.node);
    cc.director.on(GAME_EVENT.GAME_ENTERGAME, this._onEnterGame, this);
  }

  _onEnterGame() {
    cc.director.loadScene("Game");
    cc.error("已进入游戏");
  }
}
