// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class Tip extends cc.Component {

  @property(cc.Label)
  content: cc.Label = null;

  setContent(str: string) {
    this.content.string = str;
    this.node.opacity = 255;
    this._onHideSelf();
  }

  _onHideSelf() {
    cc.Tween.stopAll();
    cc.tween(this.node)
      .delay(0.3)
      .to(0.5, { opacity: 0 })
      .start()
  }
}
