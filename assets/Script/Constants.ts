// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

export enum SERVER_EVENT {
  JOIN = "JOIN",
  JOIN_FAILED = "JOIN_FAILED",
  START = "START",
  LEAVE = "LEAVE",
  CORRECT = "CORRECT",
  WRONG = "WRONG",
  VALIDATE = "VALIDATE", // 提交答案验证
  RESULT = "RESULT",
  HELLO = "HELLO", //  hi-hello 握手
  HI = "HI",
  HEARTBEAT = "HEARTBEAT", // 心跳检测
  LOGIN_FAILED = "LOGIN_FAILED",
}

export enum GAME_EVENT {
  GAME_MULTIPLAYER = "GAME_MULTIPLAYER",
  GAME_LOGINGAME = "GAME_LOGINGAME",
  GAME_START = "GAME_START",
  GAME_JOIN = "GAME_JOIN",
  GAME_FAILED = "GAME_FAILED",
  GAME_LEAVE = "GAME_LEAVE",
  GAME_OVER = "GAME_OVER",
  GAME_READY = "GAME_READY",
  GAME_CORRECT = "GAME_CORRECT",
  GAME_WRONG = "GAME_WRONG",
  GAME_LOSTCONNECTION = "GAME_LOSTCONNECTION",
}

export enum ALLTIP {
  CONNECTING = "正在登录中，请等待",
  DISCONNECT = "断开连接",
  LOGIN_SUCCESS = "登录成功",
  LOGIN_FAILED = "登录失败，你已经登陆过了",
  USERNAME_NULL = "请输入昵称",
  JOINING = "正在加入游戏...",
  JOINSUCCESS = "加入游戏成功",
  INGAME = "你已经在游戏中",
}

// 服务器断线原因
export enum CLOSE_CODE {
  LOGIN_FAILED = 4000,
}

export const ServerURl: string = `ws://192.168.19.149:2334`;
