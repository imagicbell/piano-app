/* eslint-disable */

Array.prototype.findLast = function(predictFunc) {
  for (let i = this.length - 1; i >= 0; i--) {
    if (predictFunc(this[i], i, this)) {
      return this[i];
    }
  }
}

Number.prototype.secondsToTime = function(format: string) {
  let hours = Math.floor(this / 3600);
  let divisor = this % 3600;
  let minutes = Math.floor(divisor / 60);
  divisor = divisor % 60;
  let seconds = Math.ceil(divisor);

  if (hours   < 10) hours   = "0" + hours;
  if (minutes < 10) minutes = "0" + minutes;
  if (seconds < 10) seconds = "0" + seconds;

  if (format.toLowerCase() === "mm:ss") {
    return minutes + ':' + seconds;
  } 
  return hours + ':' + minutes + ':' + seconds;
}