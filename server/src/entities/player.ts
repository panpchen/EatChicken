import ws from "ws";
import { User } from "./user";
import { GameChoice, GameData } from "./gameData";
import { Room } from "./room";
import signal from "../enums/signal";
export default class Player {
  private _ws: ws = null;
  public user: User = null;
  public gameData: GameData = null;
  public room: Room = null;

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
      switch (result.eventName) {
        case signal.HELLO:
          this._ansHello(result);
          break;
        case signal.JOIN:
          this._ansJoin(result);
          break;
      }
      console.log(
        `收到客户端消息 事件名:${result.eventName} | 结构体:${result}`
      );
    });

    this._ws.on("close", (code: number, reason: string) => {
      if (this.room) {
        this.room.removePlayer(this);
        this.room = null;
      }
      console.log(`用户: ${this.user.uname} 已断开连接`);
      this.user = null;
      this.gameData = null;
      this._ws.close();
      this._ws = null;
    });
  }

  _ansHello(result) {
    this.user = result.data.user as User;
    this.send(signal.HI, result);
  }

  _ansJoin(result) {
    if (this.room) {
      this.room.removePlayer(this);
    }
    this.room = Room.findRoomWithSeat() || Room.create();
    this.room.addPlayer(this);
    if (this.room.isFull()) {
      console.log("到达房间人数，准备开始游戏");
      // this.room.playGame();
    }
  }
  send(eventName: string, data?: any) {
    try {
      console.log(
        `发送数据到客户端：事件名:${eventName} | 结构体:${JSON.stringify(data)}`
      );
      if (this._ws.readyState === this._ws.OPEN) {
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
}
