"use strict";
exports.__esModule = true;
var gameData_1 = require("./gameData");
var room_1 = require("./room");
var signal_1 = require("../enums/signal");
var server_1 = require("../server");
var Player = /** @class */ (function () {
    function Player(ws) {
        this._ws = null;
        this.user = null;
        this.gameData = null;
        this._room = null;
        // 玩家是否在线
        this._isAlive = false;
        this._pingInterval = null;
        this._ws = ws;
        this.user = null;
        this.gameData = {
            gameChoice: gameData_1.GameChoice.yes,
            totalScore: 0,
            totalCoin: 0
        };
        this._room = null;
    }
    Player.prototype.connect = function () {
        var _this = this;
        this._ws.on("message", function (msg) {
            var result = JSON.parse(decodeURIComponent(Buffer.from(msg, "base64").toString()));
            if (result.eventName !== signal_1["default"].HEARTBEAT) {
                console.log("\u6536\u5230\u5BA2\u6237\u7AEF\u6D88\u606F \u4E8B\u4EF6\u540D:" + result.eventName + " | \u7ED3\u6784\u4F53:" + result);
            }
            switch (result.eventName) {
                case signal_1["default"].HELLO:
                    _this.user = result.data.user;
                    if (server_1["default"].$.isRepeatLogin(_this)) {
                        console.log(_this.user.uname + " \u91CD\u590D\u767B\u5F55, \u767B\u51FA\u53E6\u4E00\u4E2A");
                        _this.send(signal_1["default"].LOGIN_FAILED);
                    }
                    else {
                        _this._startHeartBeat();
                        _this.send(signal_1["default"].HI);
                    }
                    break;
                case signal_1["default"].JOIN:
                    _this._ansJoin(result);
                    break;
                case signal_1["default"].HEARTBEAT:
                    _this._ansHeartBeat();
                    break;
                case signal_1["default"].CHOICE:
                    switch (result.data.choice) {
                        case gameData_1.GameChoice.yes:
                            _this._room && _this._room.movePlayerToLeft(result.data.playerName);
                            console.log("玩家选择对的");
                            break;
                        case gameData_1.GameChoice.no:
                            _this._room &&
                                _this._room.movePlayerToRight(result.data.playerName);
                            console.log("玩家选择错的");
                            break;
                    }
                    break;
                case signal_1["default"].OVER:
                    _this._room.ansGameOver(_this, result.data.players);
                    break;
            }
        });
        this._ws.on("error", function (msg) {
            console.log("已断开连接：onError");
        });
        this._ws.on("close", function (code, reason) {
            console.log("\u5DF2\u65AD\u5F00\u8FDE\u63A5: " + _this.user.uname);
            clearInterval(_this._pingInterval);
            _this._isAlive = false;
            server_1["default"].$.removeClient(_this);
            if (_this._room) {
                _this._room.removePlayer(_this);
                _this._room = null;
            }
        });
    };
    // 服务端心跳检测
    Player.prototype._startHeartBeat = function () {
        var _this = this;
        this._ws.on("pong", function () {
            // console.log(`心跳检测中 ${this.user.uname}`);
            _this._isAlive = true;
        });
        this._ws.ping();
        this._pingInterval = setInterval(function () {
            if (_this._isAlive === false) {
                // console.log(`停止心跳检测： 玩家: ${this.user.uname} 已断开连接`);
                return _this._ws.terminate();
            }
            _this._isAlive = false;
            _this._ws.ping();
        }, 10000); // 心跳检测间隔
    };
    Player.prototype._ansJoin = function (result) {
        this._room = room_1.Room.findRoomWithSeat() || room_1.Room.create();
        if (!this._room.addPlayer(this)) {
            this.send(signal_1["default"].JOIN_FAILED);
        }
    };
    Player.prototype._ansHeartBeat = function () {
        this.send(signal_1["default"].HEARTBEAT);
    };
    Player.prototype.send = function (eventName, data) {
        try {
            if (this._ws.readyState === this._ws.OPEN
            // this._ws.bufferedAmount === 0
            ) {
                if (eventName !== signal_1["default"].HEARTBEAT) {
                    console.log("\u53D1\u9001\u6570\u636E\u5230\u5BA2\u6237\u7AEF\uFF1A\u4E8B\u4EF6\u540D:" + eventName + " | \u7ED3\u6784\u4F53:" + JSON.stringify(data));
                }
                this._ws.send(Buffer.from(encodeURIComponent(JSON.stringify({ eventName: eventName, data: data }))).toString("base64"));
            }
        }
        catch (err) {
            console.error("服务端发送错误: ", err);
        }
    };
    Player.prototype.closeSocket = function () {
        this._ws.close();
    };
    return Player;
}());
exports["default"] = Player;
