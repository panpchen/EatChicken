import { Server as WebSocketServer } from "ws";
import Player from "./entities/player";
import * as fs from "fs";

export default class Server {
  public static $: Server = null;
  public config: any = null;
  private _loginPlayers: Player[] = []; // 记录登录过的玩家
  private _joinPlayer: Player[] = []; // 记录加入游戏的玩家

  constructor() {
    Server.$ = this;
  }

  async init() {
    console.log("Loading config...");
    this.config = await this.loadConfig();
    console.log("Setting up ws server...");
    this.setupWebSocket();
  }

  setupWebSocket() {
    const wss = new WebSocketServer({ port: this.config.port });
    console.log(
      "\x1b[33m%s\x1b[0m",
      `Websocket server listening on port ${this.config.port}...`
    );
    wss.on("connection", (ws, req) => {
      console.log("已连接服务器 在线人数：", wss.clients.size);
      const player = new Player(ws);
      player.connect();
    });
  }

  loadConfig(): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.readFile("./resources/config.json", (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data.toString()));
        }
      });
    });
  }

  recordLoginPlayerToList(player: Player): boolean {
    const haveLogin = this._loginPlayers.some((p) => {
      return p.user.uname === player.user.uname;
    });

    // 重复登录返回false
    if (!haveLogin) {
      this._loginPlayers.push(player);
      return true;
    }

    return false;
  }

  removeLoginPlayer(player: Player) {
    const delIndex = this._loginPlayers.findIndex((p) => {
      return p.user.uname === player.user.uname;
    });

    if (delIndex !== -1) {
      this._loginPlayers.splice(delIndex, 1);
    }
  }

  recordJoinPlayerToList(player: Player) {
    const haveJoin = this._joinPlayer.some((p) => {
      return p.user.uname === player.user.uname;
    });

    if (!haveJoin) {
      this._joinPlayer.push(player);
      return true;
    }

    return false;
  }

  removeJoinPlayer(player: Player) {
    const delIndex = this._joinPlayer.findIndex((p) => {
      return p.user.uname === player.user.uname;
    });

    if (delIndex !== -1) {
      this._joinPlayer.splice(delIndex, 1);
    }
  }
}
