"use strict";
exports.__esModule = true;
exports.Room = void 0;
var utils_1 = require("../utils/utils");
var signal_1 = require("../enums/signal");
var gameData_1 = require("./gameData");
var globalRoomList = [];
// 房间最大人数
var MAX_ROOT_MEMBER = 10;
// 匹配时间  ms
var ADD_ROBOT_AFTER = 10000;
// 答题游戏时间 ms
var GAME_TIME = 8000;
// 总题目数
var TOTAL_TITLE = 10;
var nextRoomId = 0;
/** 表示一个房间 */
var Room = /** @class */ (function () {
    function Room() {
        this.id = "room" + nextRoomId++;
        // 当前房间所有玩家
        this._players = null;
        //  座位号
        this._index = -1;
        this._curMatchTime = ADD_ROBOT_AFTER;
        this._curGameTime = GAME_TIME;
        this._isGaming = false;
        this._interval = null;
        this._timeOut = null;
        // 当前房间进行的题目数
        this._curTitleId = 0;
        this._players = {};
        for (var i = 0; i < 18; i++) {
            this._players[i] = null;
        }
    }
    Room.prototype.isGaming = function () {
        return this._isGaming;
    };
    Room.prototype.addPlayer = function (joinPlayer) {
        var _this = this;
        console.log("\u73A9\u5BB6: " + joinPlayer.user + " | \u8FDB\u5165\u623F\u95F4\u53F7: " + this.id);
        // 不能重复加入
        var isRepeat = Object.values(this._players).some(function (p) {
            return p && p.user.uname === joinPlayer.user.uname;
        });
        if (isRepeat) {
            console.log("玩家已加入房间");
            return false;
        }
        if (this._index == -1) {
            this._index++;
            this._players[this._index] = joinPlayer;
            joinPlayer.user.uIndex = this._index;
        }
        else {
            var haveEmpty = false;
            for (var key in this._players) {
                if (this._players[key] === null) {
                    this._players[key] = joinPlayer;
                    joinPlayer.user.uIndex = Number(key);
                    haveEmpty = true;
                    break;
                }
            }
            if (!haveEmpty) {
                this._index++;
                this._players[this._index] = joinPlayer;
                joinPlayer.user.uIndex = this._index;
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
                joinPlayer: joinPlayer.user,
                matchTime: _this._curMatchTime
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
    };
    Room.prototype._startMatchCountdown = function (callback) {
        var _this = this;
        if (!this._interval) {
            this._interval = setInterval(function () {
                _this._curMatchTime -= 1000;
                if (_this._curMatchTime <= 0) {
                    clearInterval(_this._interval);
                    _this._interval = null;
                    var allPlayers = Object.values(_this._players).filter(function (p) {
                        return p !== null;
                    });
                    if (allPlayers.length == 1) {
                        _this.removePlayer(allPlayers[0]);
                        allPlayers[0].send(signal_1["default"].MATCH_FAILED);
                    }
                    else {
                        callback && callback();
                    }
                }
            }, 1000);
        }
    };
    Room.prototype._startGameCountdown = function (callback) {
        var _this = this;
        this._curGameTime = GAME_TIME;
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
        this._interval = setInterval(function () {
            _this._curGameTime -= 1000;
            if (_this._curGameTime <= 0) {
                clearInterval(_this._interval);
                _this._interval = null;
                callback && callback();
            }
        }, 1000);
    };
    Room.prototype.removePlayer = function (removePlayer) {
        console.log("离开的玩家", removePlayer.user.uname);
        // 不包含离开的玩家
        var allPlayers = Object.values(this._players).filter(function (p) {
            return p && p.user.uname != removePlayer.user.uname;
        });
        var list = [];
        allPlayers.forEach(function (p) {
            list.push(p.user);
        });
        // 玩家离开通知所有其他玩家
        allPlayers.forEach(function (p) {
            p.send(signal_1["default"].LEAVE, {
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
        var len = Object.values(this._players).filter(function (p) {
            return p !== null;
        }).length;
        console.log("移除玩家后剩余玩家数： ", len);
        // 如果房间只剩一个人，此人离开则房间解散
        var isAllNull = true;
        for (var key in this._players) {
            if (this._players[key]) {
                isAllNull = false;
                break;
            }
        }
        if (isAllNull) {
            console.log("房间已解散");
            clearInterval(this._interval);
            clearTimeout(this._timeOut);
            var roomIndex = globalRoomList.indexOf(this);
            if (roomIndex !== -1) {
                var room = globalRoomList.splice(roomIndex, 1);
                room = null;
            }
        }
    };
    Room.prototype.movePlayerToLeft = function (playerName) {
        var targetIndex = -1;
        for (var key in this._players) {
            var k = Number(key);
            if (!this._players[key] && k >= 0 && k < 9) {
                targetIndex = k;
                this._setPlayerIndex(playerName, targetIndex);
                console.log("左边的空位：", k, "信息：", playerName);
                break;
            }
        }
        this._sendAll(signal_1["default"].MOVEMENT, { targetIndex: targetIndex, playerName: playerName });
    };
    Room.prototype.movePlayerToRight = function (playerName) {
        var targetIndex = -1;
        for (var key in this._players) {
            var k = Number(key);
            if (!this._players[key] && k >= 9) {
                targetIndex = k;
                this._setPlayerIndex(playerName, targetIndex);
                console.log("右边的空位：", k, " 信息：", playerName);
                break;
            }
        }
        this._sendAll(signal_1["default"].MOVEMENT, { targetIndex: targetIndex, playerName: playerName });
    };
    Room.prototype._setPlayerIndex = function (playerName, tarIndex) {
        var p = this._getPlayerByName(playerName);
        if (p) {
            this._players[p.user.uIndex] = null;
            p.user.uIndex = tarIndex;
            this._players[tarIndex] = p;
        }
    };
    Room.prototype._getPlayerByName = function (name) {
        for (var key in this._players) {
            var p = this._players[key];
            if (p && p.user.uname === name) {
                return p;
            }
        }
        return null;
    };
    Room.prototype.isFull = function () {
        return Object.values(this._players).length == MAX_ROOT_MEMBER;
    };
    Room.prototype._playGame = function () {
        this._isGaming = true;
        var tarObstacle = null;
        var tarRan = utils_1["default"].getRangeRandom(0, 1);
        var listRan = [];
        for (var i = 0; i < gameData_1.Obstacles.length; i++) {
            listRan.push(gameData_1.Obstacles[i].ran);
        }
        var tarRanNum = Number(tarRan.toFixed(1));
        console.error("障碍物随机数： ", tarRanNum);
        listRan.push(tarRanNum);
        listRan.sort();
        var index = listRan.indexOf(tarRanNum);
        tarObstacle = gameData_1.Obstacles[Math.min(index, gameData_1.Obstacles.length - 1)];
        if (!tarObstacle) {
            console.error("障碍物为空");
            return;
        }
        console.log("障碍物信息: ", tarObstacle);
        this._sendAll(signal_1["default"].NEXT, {
            curGameTime: GAME_TIME,
            curTitleId: this._curTitleId,
            curObstacle: tarObstacle
        });
        // 每题答题时间到了刷新题目
        this._startGameCountdown(this._updateNextTitle.bind(this));
    };
    Room.prototype._sendAll = function (eventName, data) {
        for (var key in this._players) {
            var p = this._players[key];
            if (p) {
                p.send(eventName, data);
            }
        }
    };
    Room.prototype._updateNextTitle = function () {
        var _this = this;
        if (this._curTitleId === TOTAL_TITLE - 1) {
            this._finishGame();
        }
        else {
            this._curTitleId++;
            // 等待一段时间继续下一题
            this._timeOut = setTimeout(function () {
                console.log("显示题目: ", _this._curTitleId + 1);
                _this._curGameTime = GAME_TIME;
                _this._playGame();
            }, 6000);
        }
    };
    Room.prototype._finishGame = function () {
        console.log("全部游戏结束");
        this._isGaming = false;
        this._index = 0;
        this._curTitleId = 1;
        this._curMatchTime = ADD_ROBOT_AFTER;
        this._curGameTime = GAME_TIME;
        clearTimeout(this._timeOut);
        clearInterval(this._interval);
        // this._sendAll(signal.OVER);
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
    Room.prototype.ansGameOver = function (player, playerNames) {
        for (var i = 0; i < playerNames.length; i++) {
            console.log("\u73A9\u5BB6" + playerNames[i] + " \u6E38\u620F\u7ED3\u675F");
            this._sendAll(signal_1["default"].OVER, { playerName: playerNames[i] });
            // 服务端删除已结束的玩家
            this.removePlayer(player);
        }
    };
    return Room;
}());
exports.Room = Room;
