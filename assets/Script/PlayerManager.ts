// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerManager extends cc.Component {
  @property(cc.Prefab)
  prefab: cc.Prefab = null;

  createPlayer() {
    const player = cc.instantiate(this.prefab);
    player.parent = this.node;
    player.setSiblingIndex(0);
    // player.setPosition(cc.v2(-400, 640));
    player.setPosition(cc.v2(-320, -270));
    // cc.tween(player)
    //   .to(0.5, { position: cc.v3(-320, -270, 0) })
    //   .start();
  }
}
