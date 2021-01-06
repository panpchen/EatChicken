import signal from "../enums/signal";
import Player from "./player";

const globalRoomList: Room[] = [];

// 设定开始游戏所需最小人数
const MAX_ROOT_MEMBER = 2;

// 等待机器人加入时间
const ADD_ROBOT_AFTER = 3000;

// 游戏时间 10秒
const GAME_TIME = 10;

let nextRoomId = 0;

/** 表示一个房间 */
export class Room {
  public readonly id = `room${nextRoomId++}`;
  // 当前房间所有玩家
  public readonly players: Player[] = [];

  private constructor() {
    this.players = [];
  }

  /** 添加编辑客户端到会话 */
  public addPlayer(player: Player) {
    // 判断是否有重复登录的玩家
    const isRepeatLogin = this.players.some((p) => {
      p.user.uname === player.user.uname;
    });

    if (isRepeatLogin) {
      console.log(`已经有玩家: ${player.user.uname} | 进入房间号: ${this.id}`);
      player.send(signal.JOIN);
      return false;
    }

    console.log(`玩家: ${player.user.uname} | 进入房间号: ${this.id}`);
    this.players.push(player);

    const playerList = [];
    this.players.forEach((player) => {
      playerList.push(player.user);
    });

    this.players.forEach((player) => {
      player.send(signal.JOIN, playerList);
    });

    // setTimeout(() => {
    //   if (this.players.length < MAX_ROOT_MEMBER) {
    //     // const Robot = require("./robot").Robot;
    //     // new Robot();
    //     console.log("等待1秒没人加入，自动加入机器人");
    //   }
    // }, ADD_ROBOT_AFTER);
  }

  /** 从会话删除指定编辑客户端 */
  public removePlayer(player: Player) {
    const clientIndex = this.players.indexOf(player);
    if (clientIndex != -1) {
      this.players.splice(clientIndex, 1);
      player = null;
    }

    const playerList = [];
    this.players.forEach((player) => {
      playerList.push(player.user);
    });
    this.players.forEach((player) => {
      console.log("当前大厅玩家：", playerList);
      player.send(signal.LEAVE, playerList);
    });

    // 如果房间只剩一个人，此人离开则房间解散
    if (this.players.length === 0) {
      const roomIndex = globalRoomList.indexOf(this);
      if (roomIndex > -1) {
        globalRoomList.splice(roomIndex, 1);
      }
    }
  }

  public isFull() {
    console.log(`当前房间人数: ${this.players.length}/${MAX_ROOT_MEMBER}`);
    return this.players.length == MAX_ROOT_MEMBER;
  }

  public playGame() {
    console.log("游戏准备开始");
    this.players.forEach((player) => {
      player.gameData.totalCoin = 0;
      player.gameData.totalScore = 0;
    });
    const roomUsers = this.players.map((player) =>
      Object.assign({}, player.user, player.gameData)
    );
    this.players.forEach((player) => {
      player.send(signal.START, {
        gameTime: GAME_TIME,
        roomUsers,
      });
    });
    // setTimeout(() => this.finishGame(), GAME_TIME * 1000);
  }

  // public finishGame() {
  //   const clients = this.clients;
  //   for (let i = 0; i < MAX_ROOT_MEMBER; i++) {
  //     let player1 = clients[i];
  //     if (!player1) break;
  //     for (let j = i + 1; j < MAX_ROOT_MEMBER; j++) {
  //       let player2 = clients[j];
  //       // 逃走的 2 号玩家
  //       const result = judge(player1.gameData.choice, player2.gameData.choice);
  //       if (result < 0) {
  //         player1.gameData.roundScore += 1;
  //         player2.gameData.roundScore -= 1;
  //       } else if (result > 0) {
  //         player1.gameData.roundScore -= 1;
  //         player2.gameData.roundScore += 1;
  //       }
  //     }
  //   }
  //   clients.forEach((client) => {
  //     const gameData = client.gameData;
  //     if (gameData.roundScore > 0) {
  //       gameData.winStreak++;
  //       gameData.roundScore *= gameData.winStreak;
  //     } else if (gameData.roundScore < 0) {
  //       gameData.roundScore = 0;
  //       gameData.winStreak = 0;
  //     }
  //     gameData.totalScore += gameData.roundScore;
  //   });
  //   const result = clients.map((client) => {
  //     const { uid } = client.user;
  //     const { roundScore, totalScore, winStreak, choice } = client.gameData;
  //     return { uid, roundScore, totalScore, winStreak, choice };
  //   });
  //   clients.forEach((client) => {
  //     client.emit("result", { result });
  //   });
  // }

  static all() {
    return globalRoomList.slice();
  }

  // 是否有空位的房间
  static findRoomWithSeat() {
    return globalRoomList.find((x) => !x.isFull());
  }

  static create() {
    const room = new Room();
    globalRoomList.unshift(room);
    return room;
  }
}
