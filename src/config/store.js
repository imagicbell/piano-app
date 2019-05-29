//@flow
import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

import keyboardReducer from 'features/keyboard/reducer';

const rootReducer = combineReducers({
  keyboard: keyboardReducer,
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  rootReducer, 
  /* preloadState, */
  composeEnhancers(
    applyMiddleware(
      thunk, 
      // createLogger({
      //   level: 'info',
      //   collapsed: true,
      // })
    ))
)

export default store;