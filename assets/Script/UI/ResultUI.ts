// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Game from "../Game";
import BaseUI from "./BaseUI";
import { UIManager, UIType } from "./UIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ResultUI extends BaseUI {
  @property(cc.Node)
  titleNode: cc.Node = null;

  init(data) {}

  clickBackGame() {
    this.hide();
    UIManager.instance.showUI(UIType.MainUI);
  }
}
