// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class TopicBar extends cc.Component {
  @property(cc.Label)
  topicLabel: cc.Label = null;
  @property(cc.Node)
  staticLabel: cc.Node = null;
  @property(cc.Label)
  timeLabel: cc.Label = null;
  @property(cc.Node)
  tip: cc.Node = null;

  init() {
    this.timeLabel.string = "0";
    this.tip.active = false;
    this.topicLabel.node.active = false;
    this.staticLabel.active = true;
  }

  updateTime(time: number) {
    this.timeLabel.string = `${time}`;
  }
}
