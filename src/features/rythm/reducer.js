const initialState = {
  previewKeys: []
}

const rythmReducer = (state = initialState, action) => {
  switch(action.type) {
    case 'PREVIEW_KEY': {
      return { 
        ...state, 
        previewKeys: [
          ...state.previewKeys,
          { name: action.key, duration: action.duration }
         ]
        };
    }
    case 'CLEAN_PREVIEW': {
      return { ...state, previewKeys: [] };
    }
    default: 
      return state;
  }
}

export default rythmReducer;