"use strict";
exports.__esModule = true;
var uuid_1 = require("uuid");
var Player = /** @class */ (function () {
    function Player(ws, uuid) {
        this.ws = null;
        this.uuid = null;
        this.match = null;
        this.ws = ws;
        this.uuid = uuid;
    }
    Player.getPlayer = function (ws) {
        var uuid = uuid_1.v1();
        if (uuid in Player.players === false) {
            var player = new Player(ws, uuid);
            player.ws = ws;
            Player.players[uuid] = player;
            return player;
        }
        return Player.players[uuid];
    };
    Player.prototype.send = function (signal, data) {
        var pack = { signal: signal, data: data };
        try {
            this.ws.send(Buffer.from(JSON.stringify(pack)).toString("base64"));
        }
        catch (ex) {
            // console.error(ex);
        }
    };
    Player.prototype.remove = function () {
        if (this.match) {
            this.match.leave(this);
            this.match = null;
        }
        delete Player.players[this.uuid];
    };
    Player.players = {};
    return Player;
}());
exports["default"] = Player;
