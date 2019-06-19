/* eslint-disable */

Array.prototype.findLast = function(predictFunc) {
  for (let i = this.length - 1; i >= 0; i--) {
    if (predictFunc(this[i], i, this)) {
      return this[i];
    }
  }
}