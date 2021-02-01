// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { IObstacle, OBSTACLE_TYPE } from "./Constants";
import Obstacle from "./Obstacle";
import { Utils } from "./Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ObstacleManager extends cc.Component {
  @property(cc.Prefab) prefab: cc.Prefab = null;
  private _lastObstacle: cc.Node = null;

  createObstacle() {
    cc.error("创建障碍");
    if (!this._lastObstacle) {
      this._lastObstacle = cc.instantiate(this.prefab);
      this._lastObstacle.parent = this.node;
      this._lastObstacle.setPosition(cc.v2(200, -cc.winSize.height));
      let type = Utils.getRangeRandom(0, 1);
      let data: IObstacle = { type: OBSTACLE_TYPE.HOLE, speed: 0 };
      if (type < 0.4) {
        data.type = OBSTACLE_TYPE.HOLE;
        data.speed = 10;
      } else {
        type = OBSTACLE_TYPE.MAMMOTH;
        data.speed = 10;
      }
      this._lastObstacle.getComponent(Obstacle).init(data);
    }
  }
  clearObstacle() {
    if (this._lastObstacle) {
      this._lastObstacle.destroy();
      this._lastObstacle = null;
    }
  }
}
