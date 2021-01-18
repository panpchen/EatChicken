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

  init(data: IPlayer) {
    this._data = data;
    this.nameLabel.string = data.uname;
    this.selfArrow.active = data.uname === PlayerData.uname;
    cc.log("玩家属性: ", this._data);
  }

  getData() {
    return this._data;
  }
}
