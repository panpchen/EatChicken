import ws from "ws";
import { User } from "./user";
import { GameChoice, GameData } from "./gameData";
import { Room } from "./room";
import signal from "../enums/signal";
import Server from "../server";
export default class Player {
  private _ws: ws = null;
  public user: User = null;
  public gameData: GameData = null;
  private _room: Room = null;
  // 玩家是否在线
  private _isAlive: boolean = false;
  private _pingInterval = null;

  constructor(ws: ws) {
    this._ws = ws;
    this.user = null;
    this.gameData = {
      gameChoice: GameChoice.correct,
      totalScore: 0,
      totalCoin: 0,
    };
    this._room = null;
  }

  connect() {
    this._ws.on("message", (msg) => {
      const result = JSON.parse(
        decodeURIComponent(Buffer.from(msg, "base64").toString())
      );
      if (result.eventName !== signal.HEARTBEAT) {
        console.log(
          `收到客户端消息 事件名:${result.eventName} | 结构体:${result}`
        );
      }

      switch (result.eventName) {
        case signal.HELLO:
          this.user = result.data.user as User;
          if (Server.$.recordLoginPlayerToList(this)) {
            this._startHeartBeat();
            this.send(signal.HI);
          } else {
            console.log(`${this.user.uname} 重复登录, 登出另一个`);
            this.send(signal.LOGIN_FAILED);
          }
          break;
        case signal.JOIN:
          this._ansJoin(result);
          break;
        case signal.HEARTBEAT:
          this._ansHeartBeat();
          break;
        case signal.CORRECT:
          this._room && this._room.movePlayerToRight();
          console.log("玩家选择对的");
          break;
        case signal.WRONG:
          this._room && this._room.movePlayerToLeft();
          console.log("玩家选择错的");
          break;
      }
    });

    this._ws.on("error", (msg) => {
      console.log("已断开连接： onError");
    });

    this._ws.on("close", (code: number, reason: string) => {
      console.log(`已断开连接: ${this.user.uname}`);
      // 错误码: 4000:重复登录，登出
      // 如何不是重复登录，不用删除
      if (code !== 4000) {
        Server.$.removeLoginPlayer(this);
      }
      Server.$.removeJoinPlayer(this);
      clearInterval(this._pingInterval);
      this._isAlive = false;
      if (this._room) {
        this._room.removePlayer(this);
        this._room = null;
      }
    });
  }

  // 服务端心跳检测
  _startHeartBeat() {
    this._ws.on("pong", () => {
      // console.log(`心跳检测中 ${this.user.uname}`);
      this._isAlive = true;
    });

    this._ws.ping();
    this._pingInterval = setInterval(() => {
      if (this._isAlive === false) {
        // console.log(`停止心跳检测： 玩家: ${this.user.uname} 已断开连接`);
        return this._ws.terminate();
      }

      this._isAlive = false;
      this._ws.ping();
    }, 10000); // 心跳检测间隔 15秒
  }

  _ansJoin(result) {
    if (Server.$.recordJoinPlayerToList(this)) {
      this._room = Room.findRoomWithSeat() || Room.create();
      this._room.addPlayer(this);
    } else {
      this.send(signal.JOIN_FAILED);
    }
  }

  _ansHeartBeat() {
    this.send(signal.HEARTBEAT);
  }

  send(eventName: string, data?: any) {
    try {
      if (
        this._ws.readyState === this._ws.OPEN &&
        this._ws.bufferedAmount === 0
      ) {
        if (eventName !== signal.HEARTBEAT) {
          console.log(
            `发送数据到客户端：事件名:${eventName} | 结构体:${JSON.stringify(
              data
            )}`
          );
        }
        this._ws.send(
          Buffer.from(
            encodeURIComponent(JSON.stringify({ eventName, data }))
          ).toString("base64")
        );
      }
    } catch (err) {
      console.error("服务端发送错误: ", err);
    }
  }

  reset() {
    this.gameData.totalCoin = 0;
    this.gameData.totalScore = 0;
    this.gameData.gameChoice = GameChoice.correct;
  }

  closeSocket() {
    this._ws.close();
  }
}
