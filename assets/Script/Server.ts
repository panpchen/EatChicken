// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { ALLTIP, GAME_EVENT, ServerURl, SERVER_EVENT } from "./Constants";
import TipManager from "./TipManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Server extends cc.Component {
  private _ws: WebSocket = null;
  public static Instance: Server = null;
  onLoad() {
    cc.game.addPersistRootNode(this.node);
    Server.Instance = this;
    cc.director.on(GAME_EVENT.GAME_MULTIPLAYER, this._connect, this);
  }

  _connect(...args: any[]) {
    TipManager.Instance.createTips(ALLTIP.CONNECTING);
    this._ws = new WebSocket(ServerURl);
    this._ws.addEventListener("open", this._onOpen.bind(this));
    this._ws.addEventListener("message", this._onMessage.bind(this));
    this._ws.addEventListener("error", this._onError.bind(this));
    this._ws.addEventListener("close", this._onClose.bind(this));
    this.scheduleOnce(() => {
      cc.director.emit(GAME_EVENT.GAME_ENTERGAME);
    }, 0.7);
  }

  _onOpen(event) {
    cc.log("Connected to the server!", event);

    // this.send(SERVER_EVENT.JOIN);
  }

  _onError(event) {
    cc.error("error", event);
  }

  _onMessage({ data }) {
    cc.log("receive message: ", data);
    const pack = JSON.parse(atob(data));
    switch (pack.eventName) {
      case SERVER_EVENT.JOIN:
        break;
      case SERVER_EVENT.RESULT:
        break;
    }
  }
  _onClose(event) {
    cc.log("Disconnected from the server!", event);
    TipManager.Instance.createTips(ALLTIP.DISCONNECT);
    this._ws.removeEventListener("open", this._onOpen.bind(this));
    this._ws.removeEventListener("message", this._onMessage.bind(this));
    this._ws.removeEventListener("close", this._onClose.bind(this));
  }
  send(eventName: string, data?: any) {
    cc.error(eventName, data);
    this._ws.send(JSON.stringify({ eventName, data }));
  }

  closeServer() {
    this._ws.close();
  }
}
