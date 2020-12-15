// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Tip from "./Tip";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TipManager extends cc.Component {
  @property(cc.Prefab)
  tipPrefab: cc.Prefab = null;
  private _tip: cc.Node = null;
  public static Instance: TipManager = null;

  onLoad() {
    cc.game.addPersistRootNode(this.node);
    TipManager.Instance = this;
  }

  createTips(content) {
    if (!this._tip || !cc.isValid(this._tip)) {
      this._tip = cc.instantiate(this.tipPrefab);
    }
    this._tip.parent = cc.director.getScene();
    this._tip.getComponent(Tip).setContent(content);
  }
}
