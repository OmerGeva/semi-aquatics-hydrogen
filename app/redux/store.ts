import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';

import rootReducer from './root-reducer';

const middlewares = [];

if (import.meta.env.DEV) {
  middlewares.push(logger);
}

// @ts-ignore
export const store = createStore(rootReducer, applyMiddleware(...middlewares));
