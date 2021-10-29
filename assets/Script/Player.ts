// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { IPlayer, PlayerData } from "./GameData";

const { ccclass, property } = cc._decorator;
@ccclass
export default class Player extends cc.Component {
  @property(cc.Label)
  nameLabel: cc.Label = null;
  @property(cc.Node)
  selfArrow: cc.Node = null;
  private _data: IPlayer = null;
  private _tween: cc.Tween = null;
  private _move: boolean = false;
  public remove: boolean = false;

  init(data: IPlayer) {
    this._data = data;
    this.nameLabel.string = data.uname;
    this.selfArrow.active = data.uname === PlayerData.uname;
    this.node.scale = 1;
    cc.log("玩家属性: ", this._data);
  }

  getData() {
    return this._data;
  }

  scaleToZero(callback?: Function) {
    if (this._tween) return;

    this._tween = cc
      .tween(this.node)
      .to(0.5, { scale: 0 }, { easing: "smooth" })
      .call(() => {
        callback && callback();
      })
      .start();
  }

  moveOutSide() {
    this._move = true;
  }

  update(dt) {
    if (!this._move) return;
    this.node.y -= 10;
    if (this.node.y < -cc.winSize.height / 2 - 50) {
      this.remove = true;
      this._move = true;
    }
  }
}
