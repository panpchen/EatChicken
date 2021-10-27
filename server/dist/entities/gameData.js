"use strict";
exports.__esModule = true;
exports.Obstacles = exports.OBSTACLE_TYPE = exports.GameChoice = void 0;
var GameChoice;
(function (GameChoice) {
    GameChoice[GameChoice["yes"] = 0] = "yes";
    GameChoice[GameChoice["no"] = 1] = "no";
})(GameChoice = exports.GameChoice || (exports.GameChoice = {}));
var OBSTACLE_TYPE;
(function (OBSTACLE_TYPE) {
    OBSTACLE_TYPE["HOLE"] = "\u65E0\u5E95\u6D1E";
    OBSTACLE_TYPE["MAMMOTH"] = "\u731B\u72B8";
})(OBSTACLE_TYPE = exports.OBSTACLE_TYPE || (exports.OBSTACLE_TYPE = {}));
exports.Obstacles = [
    {
        type: OBSTACLE_TYPE.HOLE,
        speed: 10,
        ran: 0.6
    },
    {
        type: OBSTACLE_TYPE.MAMMOTH,
        speed: 10,
        ran: 0.4
    },
];
