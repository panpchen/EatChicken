"use strict";
exports.__esModule = true;
exports.Room = void 0;
var signal_1 = require("../enums/signal");
var globalRoomList = [];
// 房间最大人数
var MAX_ROOT_MEMBER = 10;
// 等待加入时间  ms
var ADD_ROBOT_AFTER = 6000;
// 答题游戏时间 ms
var GAME_TIME = 10000;
var nextRoomId = 0;
/** 表示一个房间 */
var Room = /** @class */ (function () {
    function Room() {
        this.id = "room" + nextRoomId++;
        // 当前房间所有玩家
        this._players = null;
        //  座位号
        this._index = -1;
        this._matchTime = ADD_ROBOT_AFTER;
        this._gameTime = GAME_TIME;
        this._isGaming = false;
        this._interval = null;
        this._players = {};
        for (var i = 0; i < 18; i++) {
            this._players[i] = null;
        }
    }
    Room.prototype.isGaming = function () {
        return this._isGaming;
    };
    /** 添加编辑客户端到会话 */
    Room.prototype.addPlayer = function (player) {
        var _this = this;
        // 有重复加入的不执行, 对于已经加入的玩家不会再创建一次
        console.log("\u73A9\u5BB6: " + player.user.uname + " | \u8FDB\u5165\u623F\u95F4\u53F7: " + this.id);
        if (this._index == -1) {
            this._index++;
            this._players[this._index] = player;
            player.user.uindex = this._index;
        }
        else {
            var haveEmpty = false;
            for (var key in this._players) {
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
        var allPlayers = Object.values(this._players).filter(function (p) {
            return p !== null;
        });
        var list = [];
        allPlayers.forEach(function (p) {
            list.push(p.user);
        });
        allPlayers.forEach(function (p) {
            p.send(signal_1["default"].JOIN_SUCCESS, {
                playerList: list,
                joinPlayer: p.user,
                matchTime: _this._matchTime
            });
        });
        this._startCountDown(this._matchTime, this._playGame.bind(this));
        // setTimeout(() => {
        //   if (this.players.length < MAX_ROOT_MEMBER) {
        //     // const Robot = require("./robot").Robot;
        //     // new Robot();
        //     console.log("等待1秒没人加入，自动加入机器人");
        //   }
        // }, ADD_ROBOT_AFTER);
    };
    Room.prototype._startCountDown = function (time, callback) {
        var _this = this;
        // 游戏开始，房间不能再加入玩家
        // console.log("匹配时间: ", time / 1000);
        if (!this._interval) {
            this._interval = setInterval(function () {
                time -= 1000;
                // console.log("匹配时间: ", time / 1000);
                if (time <= 0) {
                    time = 0;
                    clearInterval(_this._interval);
                    _this._interval = null;
                    callback && callback();
                }
            }, 1000);
        }
    };
    /** 从会话删除指定编辑客户端 */
    Room.prototype.removePlayer = function (removePlayer) {
        console.log("离开的玩家", removePlayer.user.uname);
        // 不包含离开的玩家
        var allPlayers = Object.values(this._players).filter(function (p) {
            return p && p.user.uname !== removePlayer.user.uname;
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
        for (var key in this._players) {
            var p = this._players[key];
            if (p && p.user.uname === removePlayer.user.uname) {
                this._players[key] = null;
                removePlayer = null;
                break;
            }
        }
        // 如果房间只剩一个人，此人离开则房间解散
        var isAllNull = true;
        for (var key in this._players) {
            if (this._players[key]) {
                isAllNull = false;
                break;
            }
        }
        if (isAllNull) {
            var roomIndex = globalRoomList.indexOf(this);
            if (roomIndex > -1) {
                var room = globalRoomList.splice(roomIndex, 1);
                room = null;
            }
        }
    };
    Room.prototype.movePlayerToLeft = function (data) {
        for (var key in this._players) {
            if (!this._players[key] && Number(key) >= 0 && Number(key) < 9) {
                console.log("左边的空位：", key, "信息：", data);
                break;
            }
        }
    };
    Room.prototype.movePlayerToRight = function (data) {
        for (var key in this._players) {
            if (!this._players[key] && Number(key) >= 9) {
                console.log("右边的空位：", key, "信息：", data);
                break;
            }
        }
    };
    Room.prototype.isFull = function () {
        console.log("\u5F53\u524D\u623F\u95F4\u4EBA\u6570: " + Object.values(this._players).length + "/" + MAX_ROOT_MEMBER);
        return Object.values(this._players).length == MAX_ROOT_MEMBER;
    };
    Room.prototype._playGame = function () {
        console.log("游戏开始");
        this._isGaming = true;
        for (var key in this._players) {
            var p = this._players[key];
            if (p) {
                p.reset();
                p.send(signal_1["default"].START, {
                    gameTime: this._gameTime
                });
            }
        }
        this._startCountDown(this._gameTime, this._finishGame.bind(this));
    };
    Room.prototype._finishGame = function () {
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
