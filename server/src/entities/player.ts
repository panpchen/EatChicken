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
  public room: Room = null;
  // 玩家是否在线
  private _isAlive: boolean = false;
  private _pingInterval = null;

  constructor(ws: ws) {
    this._ws = ws;
    this.user = null;
    this.gameData = {
      gameChoice: GameChoice.yes,
      totalScore: 0,
      totalCoin: 0,
    };
    this.room = null;
  }

  connect() {
    this._ws.on("message", (msg) => {
      const result = JSON.parse(
        decodeURIComponent(Buffer.from(msg, "base64").toString())
      );
      console.log(
        `收到客户端消息 事件名:${result.eventName} | 结构体:${result}`
      );

      switch (result.eventName) {
        case signal.HELLO:
          this.user = result.data.user as User;
          if (Server.$.recordLoginPlayerToList(this)) {
            this._onHeartBeat();
            this.send(signal.HI);
          } else {
            console.log(`${this.user.uname} 重复登录, 登出另一个`);
            this.send(signal.LOGIN_FAILED);
          }
          break;
        case signal.JOIN:
          setTimeout(() => {
            this._ansJoin(result);
          }, 1000);
          break;
        case signal.HEARTBEAT:
          this._ansHeartBeat();
          break;
      }
    });

    this._ws.on("error", (msg) => {
      console.log("已断开连接： onError");
    });

    this._ws.on("close", (code: number, reason: string) => {
      console.log(`已断开连接: ${this.user.uname}`);
      // 错误码: 4000:重复登录，登出
      if (code !== 4000) {
        Server.$.removePlayer(this);
      }
      this._isAlive = false;
      clearInterval(this._pingInterval);
      if (this.room) {
        this.room.removePlayer(this);
        this.room = null;
      }
    });
  }

  // 服务端心跳检测
  _onHeartBeat() {
    this._ws.on("pong", () => {
      console.log(`心跳检测中 ${this.user.uname}`);
      this._isAlive = true;
    });

    const pingIntervalTime: number = 15000; // 心跳检测间隔 15秒
    this._pingInterval = setInterval(() => {
      if (this._isAlive === false) {
        console.log(`停止心跳检测： 玩家: ${this.user.uname} 已断开连接`);
        return this._ws.terminate();
      }

      this._isAlive = false;
      this._ws.ping();
    }, pingIntervalTime);
  }

  _ansJoin(result) {
    this.room = Room.findRoomWithSeat() || Room.create();
    this.room.addPlayer(this);
    if (this.room.isFull()) {
      console.log("到达房间人数，准备开始游戏");
      // this.room.playGame();
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
        console.log(
          `发送数据到客户端：事件名:${eventName} | 结构体:${JSON.stringify(
            data
          )}`
        );
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

  closeSocket() {
    this._ws.close();
  }
}
