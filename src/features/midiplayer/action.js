//@flow

export function pause() {
  return {
    type: 'PAUSE'
  }
}

export function resume() {
  return {
    type: 'RESUME'
  }
}

export function stop() {
  return {
    type: 'STOP'
  }
}

export function changeSpeed(speed) {
  return {
    type: 'SPEED',
    speed
  }
}