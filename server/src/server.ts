import WebSocket, { Server as WebSocketServer } from "ws";
import Player from "./entities/player";
import Signal from "./enums/signal";
import * as whevent from "whevent";
import * as fs from "fs";
import signal from "./enums/signal";
import Match from "./entities/match";

export default class Server {
  static $: Server = null;
  wss: WebSocketServer = null;
  config: any = null;

  constructor() {
    Server.$ = this;
  }

  async init() {
    console.log("Loading config...");
    this.config = await this.loadConfig();
    console.log("Setting up ws server...");
    this.setupWebSocket();
    this.bindEvents();
  }

  bindEvents() {
    whevent.on(signal.MATCH, this.onRequestMatch, this);
    whevent.on(signal.VALIDATE, this.onValidate, this);
  }

  onRequestMatch({ player, data }) {
    let match = Match.getMatch();
    match.join(player);
  }

  onValidate({ player, data }) {
    let match: Match = player.match;
    if (match && match.running) {
      match.validate(player, data.data);
    }
  }

  setupWebSocket() {
    const port = "2333";
    this.wss = new WebSocketServer({ port: port });
    console.log(
      "\x1b[33m%s\x1b[0m",
      `Websocket server listening on port ${port}...`
    );
    this.wss.on("connection", (ws) => {
      console.log("已连接服务器");
      console.log("在线人数: ", this.wss.clients.size);
      // let player = Player.getPlayer(ws);
      // this.onConnection(player);
      ws.on("open", (event) => {
        console.log("open!");
      });
      ws.on("message", (message: string) => {
        console.log("收到客户端消息");
        // this.onMessage(player, message);
      });
      ws.on("close", (code: number, reason: string) => {
        console.log("服务器断开连接: ", code, reason);
        console.log("在线人数: ", this.wss.clients.size);
        // this.onClose(player);
      });
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

  onConnection(player: Player) {
    console.log(`Player ${player.uuid} has connected!`);
    player.send(Signal.UUID, player.uuid);
  }

  onClose(player: Player) {
    player.remove();
    console.log(`Player ${player.uuid} has disconnected!`);
  }

  onError(player: Player, err) {
    console.log(`Player ${player.uuid} has encountered an error!`, err);
  }

  onMessage(player: Player, message: string) {
    try {
      let data = JSON.parse(Buffer.from(message, "base64").toString());
      console.log(`Player ${player.uuid}: `, data);
      whevent.emit(data.signal, { player, data });
    } catch (ex) {
      console.error(ex);
      console.error(`Player ${player.uuid} unknown package: `, message);
    }
  }

  send(player: Player, signal: string, message: object) {
    player.send(signal, message);
  }
}
