// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseUI extends cc.Component {
  protected ani: cc.Animation = null;

  onLoad() {
    this.ani = this.node.getComponent(cc.Animation);
  }

  init(args: any[]) {
  }

  show(args: any[]) {
    this.node.active = true;
    this.init(args);
    this.playAni();
  }

  protected playAni() {
    if (this.ani) {
      this.ani.play();
    }
  }

  hide() {
    this.node.active = false;
  }
}
