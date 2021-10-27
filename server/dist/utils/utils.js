"use strict";
exports.__esModule = true;
exports["default"] = {
    getRangeRandom: function (min, max) {
        return Math.random() * (max - min + 1) + min;
    },
    getRangeRandomInteger: function (min, max) {
        return Math.floor(this.getRangeRandom(min, max));
    }
};
