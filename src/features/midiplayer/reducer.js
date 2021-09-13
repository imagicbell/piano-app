const initialState = {
  playState: 'stopped',
  speed: 1,
}

const playerReducer = (state = initialState, action) => {
  switch(action.type) {
    case 'PAUSE': {
      return { 
        ...state, playState: 'paused'
      }
    }
    case 'RESUME': {
      return { 
        ...state, playState: 'started'
      }
    }
    case 'STOP': {
      return { 
        ...state, playState: 'stopped'
      }
    }
    case 'SPEED': {
      return {
        ...state, speed: action.speed
      }
    }
    default: 
      return state;
  }
}

export default playerReducer;