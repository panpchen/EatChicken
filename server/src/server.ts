import { Server as WebSocketServer } from "ws";
import Player from "./entities/player";
import * as fs from "fs";

export default class Server {
  public static $: Server = null;
  public config: any = null;

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
}
