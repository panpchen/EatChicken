// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

// 进度条效果
cc.Class({
  extends: cc.Component,
  properties: {
    _time: 0,
    _callback: null,
    _label: null,
    _isLerp: false,
  },

  updateProgress(ratio, callback) {
    this.bar = this.node.getComponent(cc.ProgressBar);
    this._label = this.node.getChildByName("label").getComponent(cc.Label);
    this.ratio = ratio;
    this._callback = callback;
    this._isLerp = true;
  },

  update(dt) {
    if (!this._isLerp) {
      return;
    }

    this._time += dt;

    this.bar.progress = cc.misc.lerp(
      this.bar.progress,
      this.ratio,
      this._time * 0.2
    );

    if (this.bar.progress >= 0.99) {
      this._isLerp = false;
      this.bar.progress = 1;
      this._callback && this._callback();
    }

    this._label.string = `${Math.floor(Number(this.bar.progress * 100))}%`;
  },
});
