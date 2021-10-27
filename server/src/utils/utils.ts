export default {
  getRangeRandom(min, max): number {
    return Math.random() * (max - min + 1) + min;
  },

  getRangeRandomInteger(min, max) {
    return Math.floor(this.getRangeRandom(min, max));
  },
};
