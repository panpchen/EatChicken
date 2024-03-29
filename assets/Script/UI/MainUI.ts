// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { ALLTIP, SERVER_EVENT } from "../Constants";
import { PlayerData } from "../GameData";
import Server from "../Server";
import TipManager from "../TipManager";
import BaseUI from "./BaseUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainUI extends BaseUI {
  @property(cc.Node)
  btnGroup: cc.Node = null;
  @property(cc.Label)
  nameLabel: cc.Label = null;

  start() {
    // this.btnGroup.pauseSystemEvents(true);
    // const duration = this.ani.getAnimationState("mainUI").duration;
    // this.scheduleOnce(() => {
    //   this._tweenBtn();
    //   this.btnGroup.resumeSystemEvents(true);
    // }, duration);
    this.nameLabel.string = `${PlayerData.uname}`;
  }

  // _tweenBtn() {
  //   cc.tween(this.btnGroup)
  //     .repeatForever(cc.tween().to(0.2, { scale: 1.1 }).to(0.2, { scale: 1 }))
  //     .start();
  // }

  clickGo() {
    TipManager.Instance.showTips(ALLTIP.JOINING);
    Server.Instance.send(SERVER_EVENT.JOIN);
  }
}
