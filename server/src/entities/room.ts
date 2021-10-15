import signal from "../enums/signal";
import Player from "./player";

const globalRoomList: Room[] = [];

// 房间最大人数
const MAX_ROOT_MEMBER = 10;

// 匹配时间  ms
const ADD_ROBOT_AFTER = 10000;

// 答题游戏时间 ms
const GAME_TIME = 8000;

// 总题目数
const TOTAL_TITLE: number = 10;

let nextRoomId = 0;

/** 表示一个房间 */
export class Room {
  public readonly id = `room${nextRoomId++}`;
  // 当前房间所有玩家
  private readonly _players = null;

  //  座位号
  private _index: number = -1;
  private _curMatchTime: number = ADD_ROBOT_AFTER;
  private _curGameTime: number = GAME_TIME;
  private _isGaming: boolean = false;
  private _interval = null;
  private _timeOut = null;
  // 当前房间进行的题目数
  private _curTitleId: number = 0;

  private constructor() {
    this._players = {};
    for (let i = 0; i < 18; i++) {
      this._players[i] = null;
    }
  }

  public isGaming() {
    return this._isGaming;
  }
  public addPlayer(player: Player) {
    console.log(`玩家: ${player.user} | 进入房间号: ${this.id}`);
    // 对于已经加入的玩家不会再加入
    const isRepeat = Object.values<Player>(this._players).some((p) => {
      return p && p.user.uname === player.user.uname;
    });

    if (isRepeat) {
      console.log("玩家重复加入");
      return false;
    }

    if (this._index == -1) {
      this._index++;
      this._players[this._index] = player;
      player.user.uindex = this._index;
    } else {
      let haveEmpty = false;
      for (let key in this._players) {
        if (this._players[key] === null) {
          this._players[key] = player;
          player.user.uindex = Number(key);
          haveEmpty = true;
          break;
        }
      }

      if (!haveEmpty) {
        this._index++;
        this._players[this._index] = player;
        player.user.uindex = this._index;
      }
    }

    const allPlayers = Object.values<Player>(this._players).filter((p) => {
      return p !== null;
    });

    const list = [];
    allPlayers.forEach((p) => {
      list.push(p.user);
    });

    allPlayers.forEach((p) => {
      p.send(signal.JOIN_SUCCESS, {
        playerList: list,
        joinPlayer: p.user,
        matchTime: this._curMatchTime,
      });
    });

    this._startMatchCountdown(this._playGame.bind(this));

    return true;

    // setTimeout(() => {
    //   if (this.players.length < MAX_ROOT_MEMBER) {
    //     // const Robot = require("./robot").Robot;
    //     // new Robot();
    //     console.log("等待1秒没人加入，自动加入机器人");
    //   }
    // }, ADD_ROBOT_AFTER);
  }

  private _startMatchCountdown(callback?: Function) {
    if (!this._interval) {
      this._interval = setInterval(() => {
        this._curMatchTime -= 1000;
        if (this._curMatchTime <= 0) {
          clearInterval(this._interval);
          this._interval = null;
          const allPlayers = Object.values<Player>(this._players).filter(
            (p) => {
              return p !== null;
            }
          );
          if (allPlayers.length == 1) {
            this.removePlayer(allPlayers[0]);
            allPlayers[0].send(signal.JOIN_FAILED);
          } else {
            callback && callback();
          }
        }
      }, 1000);
    }
  }
  private _startGameCountdown(callback?: Function) {
    this._curGameTime = GAME_TIME;
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    this._interval = setInterval(() => {
      this._curGameTime -= 1000;
      if (this._curGameTime <= 0) {
        clearInterval(this._interval);
        this._interval = null;
        callback && callback();
      }
    }, 1000);
  }

  /** 从会话删除指定编辑客户端 */
  public removePlayer(removePlayer: Player) {
    console.log("离开的玩家", removePlayer.user.uname);

    // 不包含离开的玩家
    const allPlayers = Object.values<Player>(this._players).filter((p) => {
      return p && p.user.uname !== removePlayer.user.uname;
    });

    const list = [];
    allPlayers.forEach((p) => {
      list.push(p.user);
    });

    // 玩家离开通知所有其他玩家
    allPlayers.forEach((p) => {
      p.send(signal.LEAVE, {
        // 过滤为null的player
        playerList: list,
        player: removePlayer.user,
      });
    });

    for (let key in this._players) {
      const p = this._players[key] as Player;
      if (p && p.user.uname === removePlayer.user.uname) {
        this._players[key] = null;
        removePlayer = null;
        break;
      }
    }

    // 如果房间只剩一个人，此人离开则房间解散
    let isAllNull = true;
    for (let key in this._players) {
      if (this._players[key]) {
        isAllNull = false;
        break;
      }
    }

    if (isAllNull) {
      console.log("房间已解散");
      clearInterval(this._interval);
      clearTimeout(this._timeOut);
      const roomIndex = globalRoomList.indexOf(this);
      if (roomIndex !== -1) {
        let room = globalRoomList.splice(roomIndex, 1);
        room = null;
      }
    }
  }

  public movePlayerToLeft(playerName: string) {
    let targetIndex = -1;
    for (let key in this._players) {
      let k = Number(key);
      if (!this._players[key] && k >= 0 && k < 9) {
        targetIndex = k;
        this._setPlayerIndex(playerName, targetIndex);
        console.log("左边的空位：", k, "信息：", playerName);
        break;
      }
    }

    this._sendAll(signal.MOVEMENT, { targetIndex, playerName });
  }

  public movePlayerToRight(playerName: string) {
    let targetIndex = -1;
    for (let key in this._players) {
      let k = Number(key);
      if (!this._players[key] && k >= 9) {
        targetIndex = k;
        this._setPlayerIndex(playerName, targetIndex);
        console.log("右边的空位：", k, " 信息：", playerName);
        break;
      }
    }

    this._sendAll(signal.MOVEMENT, { targetIndex, playerName });
  }

  _setPlayerIndex(playerName: string, tarIndex: number) {
    const p = this._getPlayerByName(playerName);
    if (p) {
      this._players[p.user.uindex] = null;
      p.user.uindex = tarIndex;
      this._players[tarIndex] = p;
    }
  }

  _getPlayerByName(name: string) {
    for (let key in this._players) {
      let p = this._players[key] as Player;
      if (p && p.user.uname === name) {
        return p;
      }
    }
    return null;
  }
  public isFull() {
    return Object.values(this._players).length == MAX_ROOT_MEMBER;
  }

  private _playGame() {
    console.log("游戏开始");
    this._isGaming = true;
    this._sendAll(signal.START, {
      curGameTime: this._curGameTime,
      curTitleId: this._curTitleId,
    });

    // 每题答题时间到了刷新题目
    this._startGameCountdown(this._updateNextTitle.bind(this));
  }

  private _sendAll(eventName: string, data?: object) {
    for (let key in this._players) {
      const p = this._players[key] as Player;
      if (p) {
        p.send(eventName, data);
      }
    }
  }

  private _updateNextTitle() {
    if (this._curTitleId === TOTAL_TITLE - 1) {
      this._finishGame();
    } else {
      this._curTitleId++;
      // 等待一段时间继续下一题
      this._timeOut = setTimeout(() => {
        console.log("显示题目： ", this._curTitleId + 1);
        this._curGameTime = GAME_TIME;
        this._sendAll(signal.NEXT, {
          curTitleId: this._curTitleId,
          curGameTime: this._curGameTime,
        });
        this._startGameCountdown(this._updateNextTitle.bind(this));
      }, 4000);
    }
  }

  private _finishGame() {
    console.log("游戏结束");
    this._isGaming = false;
    this._index = 0;
    this._curTitleId = 1;
    this._curMatchTime = ADD_ROBOT_AFTER;
    this._curGameTime = GAME_TIME;
    clearTimeout(this._timeOut);
    clearInterval(this._interval);

    this._sendAll(signal.OVER);
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
