"use strict";
exports.__esModule = true;
exports.Room = void 0;
var signal_1 = require("../enums/signal");
var globalRoomList = [];
// 每个房间最多两人
var MAX_ROOT_MEMBER = 4;
//
var ADD_ROBOT_AFTER = 3000;
// 游戏时间 10秒
var GAME_TIME = 10;
var nextRoomId = 0;
/** 表示一个房间 */
var Room = /** @class */ (function () {
    function Room() {
        this.id = "room" + nextRoomId++;
        this.players = [];
        this.players = [];
    }
    /** 添加编辑客户端到会话 */
    Room.prototype.addPlayer = function (player) {
        console.log("\u73A9\u5BB6: " + player.user.uname + " | \u8FDB\u5165\u623F\u95F4\u53F7: " + this.id);
        this.players.push(player);
        var playerList = [];
        this.players.forEach(function (player) {
            playerList.push(player.user);
        });
        this.players.forEach(function (player) {
            player.send(signal_1["default"].JOIN, playerList);
        });
        // setTimeout(() => {
        //   if (this.players.length < MAX_ROOT_MEMBER) {
        //     // const Robot = require("./robot").Robot;
        //     // new Robot();
        //     console.log("等待1秒没人加入，自动加入机器人");
        //   }
        // }, ADD_ROBOT_AFTER);
    };
    /** 从会话删除指定编辑客户端 */
    Room.prototype.removePlayer = function (player) {
        var clientIndex = this.players.indexOf(player);
        if (clientIndex != -1) {
            this.players.splice(clientIndex, 1);
        }
        // 如果房间只剩一个人，此人离开则房间解散
        if (this.players.length === 0) {
            var roomIndex = globalRoomList.indexOf(this);
            if (roomIndex > -1) {
                globalRoomList.splice(roomIndex, 1);
            }
        }
    };
    Room.prototype.isFull = function () {
        console.log("\u5F53\u524D\u623F\u95F4\u4EBA\u6570: " + this.players.length + "/" + MAX_ROOT_MEMBER);
        return this.players.length == MAX_ROOT_MEMBER;
    };
    Room.prototype.playGame = function () {
        console.log("游戏准备开始");
        this.players.forEach(function (player) {
            player.gameData.totalCoin = 0;
            player.gameData.totalScore = 0;
        });
        var roomUsers = this.players.map(function (player) {
            return Object.assign({}, player.user, player.gameData);
        });
        this.players.forEach(function (player) {
            player.send(signal_1["default"].START, {
                gameTime: GAME_TIME,
                roomUsers: roomUsers
            });
        });
        // setTimeout(() => this.finishGame(), GAME_TIME * 1000);
    };
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
    Room.all = function () {
        return globalRoomList.slice();
    };
    // 是否有空位的房间
    Room.findRoomWithSeat = function () {
        return globalRoomList.find(function (x) { return !x.isFull(); });
    };
    Room.create = function () {
        var room = new Room();
        globalRoomList.unshift(room);
        return room;
    };
    return Room;
}());
exports.Room = Room;
