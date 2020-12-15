import WebSocket from "ws";
import Match from "./match";
import { v1 as uuidv1 } from "uuid";
export default class Player {
  static players = {};
  static getPlayer(ws: WebSocket) {
    let uuid = uuidv1();

    if (uuid in Player.players === false) {
      const player = new Player(ws, uuid);
      player.ws = ws;
      Player.players[uuid] = player;
      return player;
    }

    return Player.players[uuid];
  }

  ws: WebSocket = null;
  uuid: number = null;
  match: Match = null;

  constructor(ws: WebSocket, uuid: number) {
    this.ws = ws;
    this.uuid = uuid;
  }

  send(signal: string, data: any) {
    let pack = { signal, data };
    try {
      this.ws.send(Buffer.from(JSON.stringify(pack)).toString("base64"));
    } catch (ex) {
      // console.error(ex);
    }
  }

  remove() {
    if (this.match) {
      this.match.leave(this);
      this.match = null;
    }
    delete Player.players[this.uuid];
  }
}
