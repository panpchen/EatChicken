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
      gameChoice: GameChoice.yes,
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
          if (Server.$.isRepeatLogin(this)) {
            console.log(`${this.user.uname} 重复登录, 登出另一个`);
            this.send(signal.LOGIN_FAILED);
          } else {
            this._startHeartBeat();
            this.send(signal.HI);
          }
          break;
        case signal.JOIN:
          this._ansJoin(result);
          break;
        case signal.HEARTBEAT:
          this._ansHeartBeat();
          break;
        case signal.CHOICE:
          switch (result.data.choice) {
            case GameChoice.yes:
              this._room && this._room.movePlayerToLeft(result.data.playerName);
              console.log("玩家选择对的");
              break;
            case GameChoice.no:
              this._room &&
                this._room.movePlayerToRight(result.data.playerName);
              console.log("玩家选择错的");
              break;
          }
          break;
        case signal.OVER:
          this._room.ansGameOver(this, result.data.players);
          break;
      }
    });

    this._ws.on("error", (msg) => {
      console.log("已断开连接：onError");
      this._ws.terminate();
    });

    this._ws.on("close", (code: number, reason: string) => {
      console.log(`已断开连接: ${this.user.uname}`);
      clearInterval(this._pingInterval);
      this._isAlive = false;
      Server.$.removeClient(this);
      if (this._room) {
        this._room.removePlayer(this);
        this._room = null;
      }
    });
  }

  // 服务端心跳检测 5秒间隔
  _startHeartBeat() {
    this._ws.on("pong", () => {
      // console.log(`心跳检测中 ${this.user.uname}`);
      this._isAlive = true;
    });

    this._ws.ping();
    this._pingInterval = setInterval(() => {
      if (this._isAlive === false) {
        // console.log(`停止心跳检测：玩家: ${this.user.uname}  已断开连接`);
        Server.$.removeClient(this);
        return;
      }

      this._isAlive = false;
      this._ws.ping();
    }, 5000);
  }

  _ansJoin(result) {
    this._room = Room.findRoomWithSeat() || Room.create();
    if (!this._room.addPlayer(this)) {
      this.send(signal.JOIN_FAILED);
    }
  }

  _ansHeartBeat() {
    this.send(signal.HEARTBEAT);
  }

  send(eventName: string, data?: any) {
    try {
      if (
        this._ws.readyState === this._ws.OPEN
        // this._ws.bufferedAmount === 0
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

  _closeSocket() {
    this._ws.close();
  }
}
