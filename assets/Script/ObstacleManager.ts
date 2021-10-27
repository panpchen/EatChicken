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
  private _lastObstacle: cc.Node = null;

  createObstacle(dir: string, obstacle: IObstacle) {
    if (!this._lastObstacle) {
      this._lastObstacle = cc.instantiate(this.prefab);
      this._lastObstacle.parent = this.node;
      const x = dir == "yes" ? -200 : 200;
      const scaleX = dir == "yes" ? -1 : 1;
      this._lastObstacle.setPosition(cc.v2(x, -cc.winSize.height));
      this._lastObstacle.scaleX = scaleX;
      this._lastObstacle.getComponent(Obstacle).init(obstacle);
    }
  }
  clearObstacle() {
    if (this._lastObstacle) {
      this._lastObstacle.destroy();
      this._lastObstacle = null;
    }
  }
}
