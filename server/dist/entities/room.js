"use strict";
exports.__esModule = true;
exports.Room = void 0;
var signal_1 = require("../enums/signal");
var gameData_1 = require("./gameData");
var globalRoomList = [];
// 房间最大人数
var MAX_ROOT_MEMBER = 10;
// 等待加入时间
var ADD_ROBOT_AFTER = 1000000;
// 答题游戏时间
var GAME_TIME = 8000;
var nextRoomId = 0;
/** 表示一个房间 */
var Room = /** @class */ (function () {
    function Room() {
        this.id = "room" + nextRoomId++;
        this._isGaming = false;
        this._timeOut = null;
        this._index = -1;
        this._players = new Map();
    }
    Room.prototype.isGaming = function () {
        return this._isGaming;
    };
    /** 添加编辑客户端到会话 */
    Room.prototype.addPlayer = function (player) {
        var _this = this;
        // 有重复加入的不执行, 对于已经加入的玩家不会再创建一次
        console.log("\u73A9\u5BB6: " + player.user.uname + " | \u8FDB\u5165\u623F\u95F4\u53F7: " + this.id);
        if (this._players.size === 0) {
            this._index++;
            this._players.set(this._index, player);
            player.user.uindex = this._index;
        }
        else {
            var haveEmpty_1 = false;
            this._players.forEach(function (p, key) {
                // 寻找空位
                if (!haveEmpty_1 && p === null) {
                    _this._players.set(key, player);
                    player.user.uindex = key;
                    haveEmpty_1 = true;
                }
            });
            if (!haveEmpty_1) {
                this._index++;
                this._players.set(this._index, player);
                player.user.uindex = this._index;
            }
        }
        var allPlayers = Array.from(this._players.values()).filter(function (p) {
            return p !== null;
        });
        var list = [];
        allPlayers.forEach(function (p) {
            list.push(p.user);
        });
        allPlayers.forEach(function (p) {
            p.send(signal_1["default"].JOIN, {
                playerList: list,
                joinPlayer: p.user
            });
        });
        // 6秒后游戏开始，房间不能再加入玩家
        if (!this._timeOut) {
            console.log("加入房间,开始计时");
            this._timeOut = setTimeout(function () {
                _this._playGame();
            }, ADD_ROBOT_AFTER);
        }
        // setTimeout(() => {
        //   if (this.players.length < MAX_ROOT_MEMBER) {
        //     // const Robot = require("./robot").Robot;
        //     // new Robot();
        //     console.log("等待1秒没人加入，自动加入机器人");
        //   }
        // }, ADD_ROBOT_AFTER);
    };
    /** 从会话删除指定编辑客户端 */
    Room.prototype.removePlayer = function (removePlayer) {
        var _this = this;
        console.log("离开的玩家", removePlayer.user.uname);
        // 不包含离开的玩家
        var allPlayers = Array.from(this._players.values()).filter(function (p) {
            return p !== null && p.user.uname !== removePlayer.user.uname;
        });
        var list = [];
        allPlayers.forEach(function (p) {
            list.push(p.user);
        });
        // 玩家离开通知所有其他玩家
        allPlayers.forEach(function (p) {
            p.send(signal_1["default"].LEAVE, {
                // 过滤为null的player
                playerList: list,
                player: removePlayer.user
            });
        });
        this._players.forEach(function (p, key) {
            if (p && removePlayer) {
                if (p.user.uname === removePlayer.user.uname) {
                    _this._players.set(key, null);
                    removePlayer = null;
                }
            }
        });
        // 如果房间只剩一个人，此人离开则房间解散
        var isAllNull = true;
        this._players.forEach(function (p) {
            if (p) {
                isAllNull = false;
            }
        });
        if (isAllNull) {
            var roomIndex = globalRoomList.indexOf(this);
            if (roomIndex > -1) {
                var delRoom = globalRoomList.splice(roomIndex, 1);
                delRoom = null;
            }
        }
    };
    Room.prototype.isFull = function () {
        console.log("\u5F53\u524D\u623F\u95F4\u4EBA\u6570: " + this._players.size + "/" + MAX_ROOT_MEMBER);
        return this._players.size == MAX_ROOT_MEMBER;
    };
    Room.prototype._playGame = function () {
        console.log("游戏开始");
        this._isGaming = true;
        this._players.forEach(function (player) {
            if (player) {
                player.gameData.totalCoin = 0;
                player.gameData.totalScore = 0;
                player.gameData.gameChoice = gameData_1.GameChoice.yes;
            }
            player.send(signal_1["default"].START, {
                gameTime: GAME_TIME
            });
        });
        // setTimeout(() => this.finishGame(), GAME_TIME);
    };
    Room.prototype.finishGame = function () {
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
        // this._index = 0 ;
    };
    Room.all = function () {
        return globalRoomList.slice();
    };
    // 可以加入当前房间条件：
    // 1.有空位 2.游戏未开始
    Room.findRoomWithSeat = function () {
        return globalRoomList.find(function (room) {
            return !room.isFull() && !room.isGaming();
        });
    };
    Room.create = function () {
        var room = new Room();
        globalRoomList.push(room);
        return room;
    };
    return Room;
}());
exports.Room = Room;
