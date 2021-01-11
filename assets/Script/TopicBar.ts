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
    this.showTip(false);
    this.onShowLabel(this.topicLabel.node, false);
    this.onShowLabel(this.staticLabel, true);
  }

  updateTime(time: number) {
    this.timeLabel.string = `${time}`;
  }

  updateTopicContent(str: string) {
    this.topicLabel.string = str;
  }

  onShowLabel(node: cc.Node, isShow: boolean) {
    node.active = isShow;
  }

  showTip(isShow: boolean, topicNum?: number) {
    this.tip.active = isShow;
    if (this.tip.active) {
      this.tip
        .getChildByName("label")
        .getComponent(cc.Label).string = `第${topicNum}题`;

      this.scheduleOnce(() => {
        this.tip.active = false;
      }, 1);
    }
  }
}
