import {
  configureStore,
  type Reducer,
  type ReducersMapObject,
  type UnknownAction,
} from '@reduxjs/toolkit';
import { createEpicMiddleware } from 'redux-observable';

import {
  createAppDependencies,
  type AppDependencies,
} from './appDependencies';
import { createReducer, type AppReducerState } from './createReducer';
import { rootEpic } from './rootEpic';

const epicMiddleware = createEpicMiddleware<
  UnknownAction,
  UnknownAction,
  AppReducerState,
  AppDependencies
>({
  dependencies: createAppDependencies(),
});

const store = configureStore({
  reducer: createReducer(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(epicMiddleware),
});

export type AppStore = typeof store & {
  asyncReducers: ReducersMapObject;
  injectReducer: (key: string, reducer: Reducer) => void;
};

export const appStore = store as AppStore;

appStore.asyncReducers = {};

appStore.injectReducer = (key, reducer) => {
  if (appStore.asyncReducers[key]) {
    return;
  }

  appStore.asyncReducers[key] = reducer;
  appStore.replaceReducer(createReducer(appStore.asyncReducers));
};

epicMiddleware.run(rootEpic);

export type RootState = ReturnType<typeof appStore.getState>;
export type AppDispatch = typeof appStore.dispatch;
