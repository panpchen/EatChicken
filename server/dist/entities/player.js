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
        this._ws.on("message", function (msg) {
            var result = JSON.parse(decodeURIComponent(Buffer.from(msg, "base64").toString()));
            switch (result.eventName) {
                case signal_1["default"].HELLO:
                    _this._ansHello(result);
                    break;
                case signal_1["default"].JOIN:
                    _this._ansJoin(result);
                    break;
            }
            console.log("\u6536\u5230\u5BA2\u6237\u7AEF\u6D88\u606F \u4E8B\u4EF6\u540D:" + result.eventName + " | \u7ED3\u6784\u4F53:" + result);
        });
        this._ws.on("close", function (code, reason) {
            if (_this.room) {
                _this.room.removePlayer(_this);
                _this.room = null;
            }
            console.log("\u7528\u6237: " + _this.user.uname + " \u5DF2\u65AD\u5F00\u8FDE\u63A5");
            _this.user = null;
            _this.gameData = null;
            _this._ws.close();
            _this._ws = null;
        });
    };
    Player.prototype._ansHello = function (result) {
        this.user = result.data.user;
        this.send(signal_1["default"].HI, result);
    };
    Player.prototype._ansJoin = function (result) {
        if (this.room) {
            this.room.removePlayer(this);
        }
        this.room = room_1.Room.findRoomWithSeat() || room_1.Room.create();
        this.room.addPlayer(this);
        if (this.room.isFull()) {
            console.log("到达房间人数，准备开始游戏");
            // this.room.playGame();
        }
    };
    Player.prototype.send = function (eventName, data) {
        try {
            console.log("\u53D1\u9001\u6570\u636E\u5230\u5BA2\u6237\u7AEF\uFF1A\u4E8B\u4EF6\u540D:" + eventName + " | \u7ED3\u6784\u4F53:" + JSON.stringify(data));
            if (this._ws.readyState === this._ws.OPEN) {
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
