// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class Loading extends cc.Component {
  @property(cc.ProgressBar)
  progressBar: cc.ProgressBar = null;
  @property(cc.Label)
  barNum: cc.Label = null;

  onLoad() {
    this.preloadLoginScene();
  }

  preloadLoginScene() {
    cc.director.preloadScene(
      "Login",
      (completeCount, totalCount, item) => {
        let v = completeCount / totalCount;
        this.progressBar.node
          .getComponent("ProgressBarMoveEffect")
          .updateProgress(v, () => {
            cc.director.loadScene("Login");
            cc.log("login scene preloaded");
          });
      },
      () => {}
    );
  }
}
