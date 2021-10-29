// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { IObstacle } from "./Constants";
import Obstacle from "./Obstacle";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ObstacleManager extends cc.Component {
  @property(cc.Prefab) prefab: cc.Prefab = null;
  private _obstacle: cc.Node = null;

  createObstacle(dir: string, obstacle: IObstacle) {
    if (!this._obstacle) {
      this._obstacle = cc.instantiate(this.prefab);
      this._obstacle.parent = this.node;
      const x = dir == "yes" ? 200 : -200;
      const scaleX = x < 0 ? -1 : 1;
      this._obstacle.setPosition(cc.v2(x, -cc.winSize.height));
      this._obstacle.scaleX = scaleX;
      this._obstacle.getComponent(Obstacle).init(obstacle);
    }
  }

  clearObstacle() {
    if (this._obstacle) {
      this._obstacle.destroy();
      this._obstacle = null;
    }
  }
}
