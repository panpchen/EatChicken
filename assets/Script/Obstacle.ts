// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { IObstacle, OBSTACLE_TYPE } from "./Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Obstacle extends cc.Component {
  @property(cc.Sprite)
  sp: cc.Sprite = null;
  @property(cc.SpriteAtlas)
  atals: cc.SpriteAtlas = null;
  private _data: IObstacle = null;

  init(data: IObstacle) {
    this._data = data;
    cc.error("障碍物类型：", data);
  }

  update(dt) {
    this.node.y += this._data.speed;
    if (this.node.y - this.node.height / 2 > cc.winSize.height) {
      cc.error("销毁障碍");
      this.node.destroy();
    }
  }
}
