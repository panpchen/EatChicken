// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScrollingBg extends cc.Component {
  @property([cc.Node])
  bgs: cc.Node[] = [];
  private _isScrolling: boolean = true;
  startScroll() {
    cc.error("开始卷动");
    this._isScrolling = true;
  }
  stopScroll() {
    cc.error("停止滚动");
    this._isScrolling = false;
  }
  update(dt) {
    if (!this._isScrolling) {
      return;
    }

    this.bgs.forEach((bg) => {
      bg.y += 10;
      // 速度越快会出现缝隙问题, 加上offset偏移量解决
      if (bg.y - bg.height / 2 >= cc.winSize.height / 2) {
        let offset = bg.y - bg.height / 2 - cc.winSize.height / 2;
        bg.y =
          cc.winSize.height / 2 - cc.winSize.height - bg.height / 2 + offset;
      }
    });
  }
}
