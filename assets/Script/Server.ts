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
    if (this._ws) {
      if (this._ws.readyState === WebSocket.CONNECTING) {
        TipManager.Instance.showTips(ALLTIP.CONNECTING);
        return;
      }
    }
    TipManager.Instance.showTips(ALLTIP.CONNECTING);
    this._ws = new WebSocket(ServerURl);
    this._ws.addEventListener("open", this._onOpen.bind(this));
    this._ws.addEventListener("message", this._onMessage.bind(this));
    this._ws.addEventListener("error", this._onError.bind(this));
    this._ws.addEventListener("close", this._onClose.bind(this));
  }

  _onOpen(event) {
    TipManager.Instance.showTips(ALLTIP.LOGINSUCCESS);
    cc.director.emit(GAME_EVENT.GAME_ENTERGAME);
    cc.log("已连接服务器");
  }

  _onError(event) {
    this._onClose(event);
  }

  _onMessage({ data }) {
    const result = JSON.parse(decodeURIComponent(atob(data)));
    cc.log(`收到服务端消息 ${JSON.stringify(result)}`);
    switch (result.eventName) {
      case SERVER_EVENT.RESULT:
        cc.log("响应服务器游戏结果消息");
        break;
      case SERVER_EVENT.HI:
        cc.log("响应服务器HI消息");
        break;
      case SERVER_EVENT.JOIN:
        cc.director.emit(GAME_EVENT.GAME_JOIN, result.data);
        break;
      case SERVER_EVENT.LEAVE:
        cc.director.emit(GAME_EVENT.GAME_LEAVE, result.data);
        cc.error("有玩家离开了, 剩余玩家", result.data);
        break;
    }
  }

  _onClose(event) {
    cc.error("服务器断开连接！请重试", event);
    TipManager.Instance.showTips(ALLTIP.DISCONNECT);
    this._ws.removeEventListener("open", this._onOpen.bind(this));
    this._ws.removeEventListener("message", this._onMessage.bind(this));
    this._ws.removeEventListener("error", this._onError.bind(this));
    this._ws.removeEventListener("close", this._onClose.bind(this));
    cc.director.emit(GAME_EVENT.GAME_LOSTCONNECTION);
  }

  send(eventName: string, data?: any) {
    try {
      cc.log(
        `发送数据到服务器：事件名:${eventName} 结构体:${JSON.stringify(data)}`
      );
      if (
        this._ws.readyState === WebSocket.OPEN &&
        this._ws.bufferedAmount === 0
      ) {
        this._ws.send(
          btoa(encodeURIComponent(JSON.stringify({ eventName, data })))
        );
      }
    } catch (err) {
      cc.error(`客户端发送错误: ${err}`);
    }
  }

  // TODO... Test
  closeServer() {
    this._ws.close();
  }
}
