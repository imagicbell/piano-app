const initialState = {
  activeKeys: []
}

const keyboardReducer = (state = initialState, action) => {
  switch(action.type) {
    case 'ACTIVE_KEY': {
      if (state.activeKeys.findIndex(key => key === action.key) >= 0)
        return state;
      const activeKeys = [...state.activeKeys, action.key];
      return { ...state, activeKeys };
    }
    case 'DEACTIVE_KEY': {
      const index = state.activeKeys.findIndex(key => key === action.key);
      if (index < 0) 
        return state;
      const activeKeys = [...state.activeKeys.slice(0, index), ...state.activeKeys.slice(index + 1)];
      return { ...state, activeKeys };
    }
    default: 
      return state;
  }
}

export default keyboardReducer;