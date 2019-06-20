import { type ActiveKey, type KeyboardState } from './type';


const initialState: KeyboardState = {
  activeKeys: []
}

const keyboardReducer = (state: KeyboardState = initialState, action): KeyboardState => {
  switch(action.type) {
    case 'ACTIVE_KEY': {
      let newActiveKeys: ActiveKey[];

      let index = state.activeKeys.findIndex(key => key.name === action.key);
      if (index >= 0) {
        const activeKey = state.activeKeys[index];
        newActiveKeys = [
          ...state.activeKeys.slice(0, index),
          {name: activeKey.name, refCount: activeKey.refCount + 1},
          ...state.activeKeys.slice(index + 1)
        ];
      } else {
        newActiveKeys = [
          ...state.activeKeys,
          {name: action.key, refCount: 1}
        ]
      }
      return { ...state, activeKeys: newActiveKeys };
    }
    case 'DEACTIVE_KEY': {
      const index = state.activeKeys.findIndex(key => key.name === action.key);
      if (index < 0) 
        return state;

      let newActiveKeys: ActiveKey[];

      const activeKey = state.activeKeys[index];
      if (activeKey.refCount - 1 === 0) {
        newActiveKeys = [
          ...state.activeKeys.slice(0, index),
          ...state.activeKeys.slice(index + 1)
        ];
      } else {
        newActiveKeys = [
          ...state.activeKeys.slice(0, index),
          {name: activeKey.name, refCount: activeKey.refCount - 1},
          ...state.activeKeys.slice(index + 1)
        ]
      }
      return { ...state, activeKeys: newActiveKeys };
    }
    default: 
      return state;
  }
}

export default keyboardReducer;