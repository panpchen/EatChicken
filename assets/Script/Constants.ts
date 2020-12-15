// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

export enum SERVER_EVENT {
  JOIN = "JOIN",
  LEAVE = "LEAVE",
  MATCH = "MATCH",
  CORRECT = "CORRECT",
  WRONG = "WRONG",
  RESULT = "RESULT",
  VALIDATE = "VALIDATE", // 提交答案验证
}

export enum GAME_EVENT {
  GAME_MULTIPLAYER = "GAME_MULTIPLAYER",
  GAME_ENTERGAME = "GAME_ENTERGAME",
  GAME_START = "GAME_START",
  GAME_OVER = "GAME_OVER",
  GAME_READY = "GAME_READY",
  GAME_CORRECT = "GAME_CORRECT",
  GAME_WRONG = "GAME_WRONG",
  GAME_LOSTCONNECTTION = "GAME_LOSTCONNECTTION",
}

export enum ALLTIP {
  CONNECTING = "正在连接...",
  DISCONNECT = "断开连接",
}

export const ServerURl: string = "ws://192.168.19.147:2333";
