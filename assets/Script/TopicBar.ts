// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
export const enum FontColorType {
  green,
  orange,
}

@ccclass
export default class TopicBar extends cc.Component {
  @property(cc.Label)
  topicLabel: cc.Label = null;
  @property(cc.Node)
  staticLabel: cc.Node = null;
  @property(cc.Label)
  timeLabel: cc.Label = null;
  @property(cc.Label)
  bigCountDownTimeLabel: cc.Label = null;
  @property(cc.Node)
  tip: cc.Node = null;

  private _isMatching: boolean = false;
  private _countTime: number = 0;
  private _countDownFunc = null;

  init() {
    this.timeLabel.string = "0";
    this.showTopicTip(false);
    this.topicLabel.node.active = false;
    this.staticLabel.active = true;
    this._onShowBigCountDownNum(false);
  }

  update() {
    // 匹配成功才显示大数字倒计时
    if (this._isMatching && this._countTime > 0 && this._countTime < 4) {
      this._onShowBigCountDownNum(true);
      this.bigCountDownTimeLabel.string = `${this._countTime}`;
      this.bigCountDownTimeLabel.node.active = true;
    } else {
      this.bigCountDownTimeLabel.node.active = false;
    }
  }

  _onShowBigCountDownNum(isShow: boolean) {
    this.bigCountDownTimeLabel.node.active = isShow;
  }
  startMatchTime(time: number, callback?: Function) {
    this._isMatching = true;
    this._startCountDown(time, FontColorType.green, callback);
  }

  startGameTime(time: number, callback?: Function) {
    this._isMatching = false;
    this._onShowBigCountDownNum(false);
    this._startCountDown(time, FontColorType.orange, callback);
  }

  _startCountDown(
    countTime: number,
    color: FontColorType,
    callback?: Function
  ) {
    this._countTime = countTime / 1000;
    this.updateTime(this._countTime, color);
    this.unschedule(this._countDownFunc);
    this._countDownFunc = () => {
      this._countTime--;
      this.updateTime(this._countTime, color);
      if (this._countTime <= 0) {
        cc.log("时间到");
        callback && callback();
        this.unschedule(this._countDownFunc);
        return;
      }
    };
    this.schedule(this._countDownFunc, 1);
  }
  updateTime(time: number, colorType: FontColorType) {
    if (time <= 0) {
      this.timeLabel.node.active = false;
      return;
    } else {
      this.timeLabel.node.active = true;
      this.timeLabel.string = `${time}`;
      let color = "";
      switch (colorType) {
        case FontColorType.green:
          color = "#06DF00";
          break;
        case FontColorType.orange:
          color = "#F94D00";
          break;
      }
      this.timeLabel.node.color = cc.color().fromHEX(color);
    }
  }

  updateTopicContent(str: string) {
    if (str) {
      this.topicLabel.string = str;
    }
  }

  showTopicTip(isShow: boolean, num?: number) {
    this.tip.active = isShow;
    if (isShow) {
      this.tip
        .getChildByName("label")
        .getComponent(cc.Label).string = `第${num}题`;
      this.scheduleOnce(() => {
        this.tip.active = false;
      }, 1);
    }
  }
}
