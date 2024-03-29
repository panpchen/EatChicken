// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

export enum SERVER_EVENT {
  JOIN = "JOIN",
  JOIN_SUCCESS = "JOIN_SUCCESS",
  JOIN_FAILED = "JOIN_FAILED",
  MATCH_FAILED = "MATCH_FAILED",
  START = "START",
  NEXT = "NEXT",
  OVER = "OVER",
  LEAVE = "LEAVE",
  CHOICE = "CHOICE",
  MOVEMENT = "MOVEMENT",
  HELLO = "HELLO", //  hi-hello 握手
  HI = "HI",
  HEARTBEAT = "HEARTBEAT", // 心跳检测
  LOGIN_FAILED = "LOGIN_FAILED",
}

export enum GAME_EVENT {
  GAME_LOGINGAME = "GAME_LOGINGAME",
  GAME_START = "GAME_START",
  GAME_OVER = "GAME_OVER",
  GAME_NEXT = "GAME_NEXT",
  GAME_JOINSUCCESS = "GAME_JOINSUCCESS",
  GAME_JOINFAILED = "GAME_JOINFAILED",
  GAME_MATCHFAILED = "GAME_MATCHFAILED",
  GAME_LEAVE = "GAME_LEAVE",
  GAME_MOVEMENT = "GAME_MOVEMENT",
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
  MATCH__NOTENOUGHPEOPLE = "匹配人数不足",
}

export interface ITitle {
  title: string;
  answer: string;
}
export const TITLES: ITitle[] = [
  {
    title: "西瓜的肉是红色吗?",
    answer: "yes",
  },
  { title: "苹果的肉是紫色吗?", answer: "no" },
  { title: "1+1=2?", answer: "yes" },
  { title: "2x4=9?", answer: "no" },
];

export enum OBSTACLE_TYPE {
  HOLE = "无底洞",
  MAMMOTH = "猛犸",
}
export interface IObstacle {
  type: OBSTACLE_TYPE;
  speed: number;
  ran: number;
}

// 服务器断线原因
export enum CLOSE_CODE {
  LOGIN_FAILED = 4000,
}

export const ServerURl: string = `ws://192.168.19.240:2334`;
// export const ServerURl: string = `ws://localhost:2334`;
