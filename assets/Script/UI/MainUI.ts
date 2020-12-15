// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import BaseUI from "./BaseUI";
import { UIManager, UIType } from "./UIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainUI extends BaseUI {
  @property(cc.Node)
  btnGroup: cc.Node = null;

  start() {
    this.btnGroup.pauseSystemEvents(true);
    const duration = this.ani.getAnimationState("menuUI").duration;
    this.scheduleOnce(() => {
      this._tweenBtn();
      this.btnGroup.resumeSystemEvents(true);
    }, duration);
  }

  _tweenBtn() {
    cc.tween(this.btnGroup)
      .repeatForever(cc.tween().to(0.2, { scale: 1.1 }).to(0.2, { scale: 1 }))
      .start();
  }

  clickGameStart() {
    // UIManager.instance.showUI(UIType.SelectUI, () => {
    //   this.hide();
    // });
  }
}
