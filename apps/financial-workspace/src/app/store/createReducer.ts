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

const staticReducers = {
  [orderApprovalReducerKey]: orderApprovalReducer,
};

export type AppReducerState = OrderApprovalRootState & Record<string, unknown>;

export function createReducer(
  asyncReducers: ReducersMapObject = {},
): Reducer<AppReducerState, UnknownAction> {
  return combineReducers({
    ...staticReducers,
    ...asyncReducers,
  }) as unknown as Reducer<AppReducerState, UnknownAction>;
}
