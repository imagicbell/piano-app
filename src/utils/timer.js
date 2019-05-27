//@flow

/**
 * timer that can pause/resume
 */
export class Timer {
  callback: () => void;
  timerId: NodeJS.Timeout;
  start: number;
  remaining: number;

  constructor(callback: ()=>void, delay: number) {
    this.callback = callback;
    this.remaining = delay;
    this.resume();
  }

  pause = () => {
    clearTimeout(this.timerId);
    this.remaining -= Date.now() - this.start;
  }

  resume = () => {
    this.start = Date.now();
    clearTimeout(this.timerId);
    this.timerId = setTimeout(this.callback, this.remaining);
  }
}

/**
 * @param {number} ms 毫秒
 */
export function Sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
