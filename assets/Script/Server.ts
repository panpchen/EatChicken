// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import {
  ALLTIP,
  CLOSE_CODE,
  GAME_EVENT,
  ServerURl,
  SERVER_EVENT,
} from "./Constants";
import TipManager from "./TipManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Server extends cc.Component {
  private _ws: WebSocket = null;
  public static Instance: Server = null;
  private _pingInterval = null;
  private _isAlive: boolean = false;
  onLoad() {
    cc.game.addPersistRootNode(this.node);
    Server.Instance = this;
  }

  connect(...args: any[]) {
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
    cc.log("已连接服务器,开始登录游戏");
    TipManager.Instance.showTips(ALLTIP.LOGIN_SUCCESS);
    this._startHeartBeat();
    cc.director.emit(GAME_EVENT.GAME_LOGINGAME);
  }

  _onMessage({ data }) {
    const result = JSON.parse(decodeURIComponent(atob(data)));
    cc.log(`收到服务端消息 ${JSON.stringify(result)}`);
    switch (result.eventName) {
      case SERVER_EVENT.HI:
        cc.log("响应服务器HI消息");
        this.scheduleOnce(() => {
          cc.director.loadScene("Game");
        }, 0.7);
        break;
      case SERVER_EVENT.START:
        cc.director.emit(GAME_EVENT.GAME_START, result.data);
        break;
      case SERVER_EVENT.NEXT:
        cc.director.emit(GAME_EVENT.GAME_NEXT, result.data);
        break;
      case SERVER_EVENT.OVER:
        cc.log("响应服务器游戏结束");
        cc.director.emit(GAME_EVENT.GAME_OVER, result.data);
        break;
      case SERVER_EVENT.LEAVE:
        cc.director.emit(GAME_EVENT.GAME_LEAVE, result.data);
        cc.error("有玩家离开了, 剩余玩家", result.data);
        break;
      case SERVER_EVENT.HEARTBEAT:
        this._startHeartBeat();
        break;
      case SERVER_EVENT.JOIN_SUCCESS:
        cc.director.emit(GAME_EVENT.GAME_JOINSUCCESS, result.data);
        break;
      case SERVER_EVENT.JOIN_FAILED:
        cc.director.emit(GAME_EVENT.GAME_JOINFAILED);
        cc.error("加入游戏失败");
        break;
      case SERVER_EVENT.MATCH_FAILED:
        cc.director.emit(GAME_EVENT.GAME_MATCHFAILED);
        cc.error("匹配游戏失败");
        break;
      case SERVER_EVENT.LOGIN_FAILED:
        TipManager.Instance.showTips(ALLTIP.LOGIN_FAILED);
        this.scheduleOnce(() => {
          this._ws.close(CLOSE_CODE.LOGIN_FAILED);
        }, 1);
        break;
      case SERVER_EVENT.MOVEMENT:
        cc.director.emit(GAME_EVENT.GAME_MOVEMENT, result.data);
        break;
    }
  }

  _onError(event) {
    this._onClose(event);
  }

  _onClose(event) {
    cc.error("断开连接！结构体：", event);
    this._isAlive = false;
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
        this._ws.readyState === WebSocket.OPEN
        // this._ws.bufferedAmount === 0
      ) {
        this._ws.send(
          btoa(encodeURIComponent(JSON.stringify({ eventName, data })))
        );
      }
    } catch (err) {
      cc.error(`客户端发送错误: ${err}`);
    }
  }

  // 客户端心跳检测 5秒间隔
  _startHeartBeat() {
    this._clearHeartBeat();
    this._isAlive = true;
    this._pingInterval = setInterval(() => {
      cc.log(`客户端 心跳检测中...`);
      if (this._isAlive === false) {
        cc.log(`客户端停止心跳检测，因为已断线`);
        this._clearHeartBeat();
        cc.director.emit(GAME_EVENT.GAME_LOSTCONNECTION);
        return;
      }
      this._isAlive = false;
      this.send(SERVER_EVENT.HEARTBEAT);
    }, 5000);
  }

  _clearHeartBeat() {
    // cc.error("清空心跳检测");
    clearInterval(this._pingInterval);
  }
}
