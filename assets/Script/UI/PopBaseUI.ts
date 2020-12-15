// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import BaseUI from "./BaseUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopBaseUI extends BaseUI {
  @property(cc.Node)
  mask: cc.Node = null;
  @property(cc.Node)
  panel: cc.Node = null;

  show(data: any = null) {
    this.init(data);
    this.playAni();
    this.node.active = true;
    this.mask && (this.mask.opacity = 0);
    cc.tween(this.mask)
      .to(0.2, { opacity: 200 })
      .start();

    this.panel.scale = 0;
    cc.tween(this.panel)
      .to(0.2, { scale: 1.15 }, { easing: 'sineOut' })
      .to(0.2, { scale: 1 })
      .start();
  }

  hide() {
    this.mask && (this.mask.opacity = 0);
    this.node.active = false;
  }
}
