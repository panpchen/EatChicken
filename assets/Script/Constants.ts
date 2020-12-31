// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

export enum SERVER_EVENT {
  JOIN = "JOIN",
  START = "START",
  LEAVE = "LEAVE",
  CORRECT = "CORRECT",
  WRONG = "WRONG",
  VALIDATE = "VALIDATE", // 提交答案验证
  RESULT = "RESULT",
  HELLO = "HELLO", //  hi-hello 握手
  HI = "HI",
  HEARTBEAT = "HEARTBEAT", // 心跳检测
}

export enum GAME_EVENT {
  GAME_MULTIPLAYER = "GAME_MULTIPLAYER",
  GAME_ENTERGAME = "GAME_ENTERGAME",
  GAME_START = "GAME_START",
  GAME_JOIN = "GAME_JOIN",
  GAME_LEAVE = "GAME_LEAVE",
  GAME_OVER = "GAME_OVER",
  GAME_READY = "GAME_READY",
  GAME_CORRECT = "GAME_CORRECT",
  GAME_WRONG = "GAME_WRONG",
  GAME_LOSTCONNECTION = "GAME_LOSTCONNECTION",
}

export enum ALLTIP {
  CONNECTING = "正在登录中，请稍等",
  DISCONNECT = "断开连接",
  LOGINSUCCESS = "登录成功",
  USERNAME_NULL = "请输入昵称",
  JOINING = "正在加入游戏...",
  JOINSUCCESS = "加入游戏成功",
  INGAME = "你已经在游戏中",
}

export const ServerURl: string = `ws://192.168.19.149:2334`;