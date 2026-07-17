import {
  combineReducers,
  type Reducer,
  type ReducersMapObject,
  type UnknownAction,
} from '@reduxjs/toolkit';
import {
  orderApprovalReducer,
  orderApprovalReducerKey,
  type OrderApprovalRootState,
} from '@demo/feature-order-approval';
import {
  bootstrapDataReducer,
  bootstrapDataReducerKey,
  type BootstrapDataState,
} from './bootstrapDataSlice';

const staticReducers = {
  [orderApprovalReducerKey]: orderApprovalReducer,
  [bootstrapDataReducerKey]: bootstrapDataReducer,
};

export type AppReducerState = OrderApprovalRootState & {
  [bootstrapDataReducerKey]: BootstrapDataState;
} & Record<string, unknown>;

export function createReducer(
  asyncReducers: ReducersMapObject = {},
): Reducer<AppReducerState, UnknownAction> {
  return combineReducers({
    ...staticReducers,
    ...asyncReducers,
  }) as unknown as Reducer<AppReducerState, UnknownAction>;
}
