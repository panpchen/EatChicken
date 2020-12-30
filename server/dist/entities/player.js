"use strict";
exports.__esModule = true;
var gameData_1 = require("./gameData");
var room_1 = require("./room");
var signal_1 = require("../enums/signal");
var Player = /** @class */ (function () {
    function Player(ws) {
        this._ws = null;
        this.user = null;
        this.gameData = null;
        this.room = null;
        // 玩家是否在线
        this._isAlive = false;
        this._ws = ws;
        this.user = null;
        this.gameData = {
            gameChoice: gameData_1.GameChoice.yes,
            totalScore: 0,
            totalCoin: 0
        };
        this.room = null;
    }
    Player.prototype.connect = function () {
        var _this = this;
        this._isAlive = true;
        this._ws.on("pong", function () {
            _this._isAlive = true;
            console.log("心跳检测中...");
        });
        var pingIntervalTime = 15000; // 心跳检测间隔
        var pingInterval = setInterval(function () {
            if (_this._isAlive === false) {
                console.log("\u4E0D\u518D\u5FC3\u8DF3\u68C0\u6D4B\uFF1A \u73A9\u5BB6: " + _this.user.uname + " \u5DF2\u65AD\u5F00\u8FDE\u63A5");
                clearInterval(pingInterval);
                if (_this.room) {
                    _this.room.removePlayer(_this);
                    _this.room = null;
                }
                return _this._ws.terminate();
            }
            _this._isAlive = false;
            console.log("ping: ", _this.user.uname);
            _this._ws.ping();
        }, pingIntervalTime);
        this._ws.on("message", function (msg) {
            var result = JSON.parse(decodeURIComponent(Buffer.from(msg, "base64").toString()));
            console.log("\u6536\u5230\u5BA2\u6237\u7AEF\u6D88\u606F \u4E8B\u4EF6\u540D:" + result.eventName + " | \u7ED3\u6784\u4F53:" + result);
            switch (result.eventName) {
                case signal_1["default"].HELLO:
                    _this._ansHello(result);
                    break;
                case signal_1["default"].JOIN:
                    setTimeout(function () {
                        _this._ansJoin(result);
                    }, 1000);
                    break;
            }
        });
        this._ws.on("error", function (msg) {
            console.log("已断开连接： onError");
            clearInterval(pingInterval);
        });
        this._ws.on("close", function (code, reason) {
            console.log("\u5DF2\u65AD\u5F00\u8FDE\u63A5: " + _this.user.uname);
            clearInterval(pingInterval);
            if (_this.room) {
                _this.room.removePlayer(_this);
                _this.room = null;
            }
        });
    };
    Player.prototype._ansHello = function (result) {
        this.user = result.data.user;
        this.send(signal_1["default"].HI);
    };
    Player.prototype._ansJoin = function (result) {
        this.room = room_1.Room.findRoomWithSeat() || room_1.Room.create();
        this.room.addPlayer(this);
        if (this.room.isFull()) {
            console.log("到达房间人数，准备开始游戏");
            // this.room.playGame();
        }
    };
    Player.prototype.send = function (eventName, data) {
        try {
            if (this._ws.readyState === this._ws.OPEN &&
                this._ws.bufferedAmount === 0) {
                console.log("\u53D1\u9001\u6570\u636E\u5230\u5BA2\u6237\u7AEF\uFF1A\u4E8B\u4EF6\u540D:" + eventName + " | \u7ED3\u6784\u4F53:" + JSON.stringify(data));
                this._ws.send(Buffer.from(encodeURIComponent(JSON.stringify({ eventName: eventName, data: data }))).toString("base64"));
            }
        }
        catch (err) {
            console.error("服务端发送错误: ", err);
        }
    };
    return Player;
}());
exports["default"] = Player;
