import signal from "../enums/signal";
import { GameChoice } from "./gameData";
import Player from "./player";

const globalRoomList: Room[] = [];

// 设定开始游戏所需最大人数
const MAX_ROOT_MEMBER = 10;

// 等待加入时间
const ADD_ROBOT_AFTER = 1000000;

// 答题游戏时间
const GAME_TIME = 8000;

let nextRoomId = 0;

/** 表示一个房间 */
export class Room {
  public readonly id = `room${nextRoomId++}`;
  // 当前房间所有玩家
  private readonly _players: Player[] = [];

  private _isGaming: boolean = false;
  private _timeOut = null;

  private constructor() {
    this._players = [];
  }

  public isGaming() {
    return this._isGaming;
  }
  /** 添加编辑客户端到会话 */
  public addPlayer(player: Player) {
    const isRepeat = this._players.some((p) => {
      return p.user.uname === player.user.uname;
    });

    if (!isRepeat) {
      console.log(`玩家: ${player.user.uname} | 进入房间号: ${this.id}`);
      this._players.push(player);
    }

    const playerList = [];
    this._players.forEach((player) => {
      playerList.push(player.user);
    });

    this._players.forEach((player) => {
      player.send(signal.JOIN, { playerList, joinPlayer: player.user });
    });

    // 6秒后游戏开始，房间不能再加入玩家
    if (!this._timeOut) {
      console.log("加入房间,开始计时");
      this._timeOut = setTimeout(() => {
        this._playGame();
      }, ADD_ROBOT_AFTER);
    }

    // setTimeout(() => {
    //   if (this.players.length < MAX_ROOT_MEMBER) {
    //     // const Robot = require("./robot").Robot;
    //     // new Robot();
    //     console.log("等待1秒没人加入，自动加入机器人");
    //   }
    // }, ADD_ROBOT_AFTER);
  }

  /** 从会话删除指定编辑客户端 */
  public removePlayer(removePlayer: Player) {
    const clientIndex = this._players.indexOf(removePlayer);
    if (clientIndex != -1) {
      this._players.splice(clientIndex, 1);
    }

    // 玩家离开通知所有其他玩家
    const playerList = [];
    this._players.forEach((player) => {
      playerList.push(player.user);
    });
    this._players.forEach((player) => {
      console.log("离开的玩家", removePlayer.user.uname);
      player.send(signal.LEAVE, { playerList, player: removePlayer.user });
    });

    removePlayer = null;

    // 如果房间只剩一个人，此人离开则房间解散
    if (this._players.length === 0) {
      const roomIndex = globalRoomList.indexOf(this);
      if (roomIndex > -1) {
        let delRoom = globalRoomList.splice(roomIndex, 1);
        delRoom = null;
      }
    }
  }

  public isFull() {
    console.log(`当前房间人数: ${this._players.length}/${MAX_ROOT_MEMBER}`);
    return this._players.length == MAX_ROOT_MEMBER;
  }

  private _playGame() {
    console.log("游戏开始");
    this._isGaming = true;
    this._players.forEach((player) => {
      player.gameData.totalCoin = 0;
      player.gameData.totalScore = 0;
      player.gameData.gameChoice = GameChoice.yes;
    });

    this._players.forEach((player) => {
      player.send(signal.START, {
        gameTime: GAME_TIME,
      });
    });

    // setTimeout(() => this.finishGame(), GAME_TIME);
  }

  public finishGame() {
    console.log("游戏时间到，结束");
    return;
    // const clients = this.clients;
    // for (let i = 0; i < MAX_ROOT_MEMBER; i++) {
    //   let player1 = clients[i];
    //   if (!player1) break;
    //   for (let j = i + 1; j < MAX_ROOT_MEMBER; j++) {
    //     let player2 = clients[j];
    //     // 逃走的 2 号玩家
    //     const result = judge(player1.gameData.choice, player2.gameData.choice);
    //     if (result < 0) {
    //       player1.gameData.roundScore += 1;
    //       player2.gameData.roundScore -= 1;
    //     } else if (result > 0) {
    //       player1.gameData.roundScore -= 1;
    //       player2.gameData.roundScore += 1;
    //     }
    //   }
    // }
    // clients.forEach((client) => {
    //   const gameData = client.gameData;
    //   if (gameData.roundScore > 0) {
    //     gameData.winStreak++;
    //     gameData.roundScore *= gameData.winStreak;
    //   } else if (gameData.roundScore < 0) {
    //     gameData.roundScore = 0;
    //     gameData.winStreak = 0;
    //   }
    //   gameData.totalScore += gameData.roundScore;
    // });
    // const result = clients.map((client) => {
    //   const { uid } = client.user;
    //   const { roundScore, totalScore, winStreak, choice } = client.gameData;
    //   return { uid, roundScore, totalScore, winStreak, choice };
    // });
    // clients.forEach((client) => {
    //   client.emit("result", { result });
    // });
    // this._isGaming = false;
  }

  public static all() {
    return globalRoomList.slice();
  }

  // 可以加入当前房间条件：
  // 1.有空位 2.游戏未开始
  public static findRoomWithSeat() {
    return globalRoomList.find((room) => {
      return !room.isFull() && !room.isGaming();
    });
  }

  public static create() {
    const room = new Room();
    globalRoomList.push(room);
    return room;
  }
}
