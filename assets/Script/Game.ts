import Server from "./Server";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends cc.Component {
  @property(cc.Label)
  topicLabel: cc.Label = null;
  onLoad() {}

  onClickEvent(evt, parm) {
    switch (parm) {
      case "yes":
        cc.error("选择对的");
        break;
      case "no":
        cc.error("选择错的");
        break;
      case "closeServer":
        Server.Instance.closeServer();
        cc.error("主动关闭websocket");
        break;
    }
  }
}
