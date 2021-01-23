// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ObstacleManager extends cc.Component {
  @property(cc.Prefab) prefab: cc.Prefab = null;

  createObstacle() {
    const obstacle = cc.instantiate(this.prefab);
    obstacle.parent = this.node;
    obstacle.setPosition(cc.v2(200, 0));
  }
}
