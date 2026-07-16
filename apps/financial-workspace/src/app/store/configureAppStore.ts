import {
  configureStore,
  type Reducer,
  type ReducersMapObject,
  type UnknownAction,
} from '@reduxjs/toolkit';
import { createEpicMiddleware } from 'redux-observable';

import {
  type AppDependencies,
} from './appDependencies';
import { createReducer, type AppReducerState } from './createReducer';
import { rootEpic } from './rootEpic';

type ConfiguredStore = ReturnType<typeof createConfiguredStore>;

export type AppStore = ConfiguredStore & {
  asyncReducers: ReducersMapObject;
  injectReducer: (key: string, reducer: Reducer) => void;
};

function createConfiguredStore(
  epicMiddleware: ReturnType<
    typeof createEpicMiddleware<
      UnknownAction,
      UnknownAction,
      AppReducerState,
      AppDependencies
    >
  >,
) {
  return configureStore({
    reducer: createReducer(),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(epicMiddleware),
  });
}

export function configureAppStore(
  dependencies: AppDependencies,
): AppStore {
  const epicMiddleware = createEpicMiddleware<
    UnknownAction,
    UnknownAction,
    AppReducerState,
    AppDependencies
  >({
    dependencies,
  });

  const appStore = createConfiguredStore(epicMiddleware) as AppStore;

  appStore.asyncReducers = {};

  appStore.injectReducer = (key, reducer) => {
    if (appStore.asyncReducers[key]) {
      return;
    }

    appStore.asyncReducers[key] = reducer;
    appStore.replaceReducer(createReducer(appStore.asyncReducers));
  };

  epicMiddleware.run(rootEpic);

  return appStore;
}

export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
