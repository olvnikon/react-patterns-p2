import type { UnknownAction } from '@reduxjs/toolkit';
import { orderApprovalEpic } from '@demo/feature-order-approval';
import type { Epic } from 'redux-observable';

import type { AppDependencies } from './appDependencies';
import type { AppReducerState } from './createReducer';

export const rootEpic: Epic<
  UnknownAction,
  UnknownAction,
  AppReducerState,
  AppDependencies
> = (action$, state$, dependencies) =>
  orderApprovalEpic(action$, state$, dependencies);
