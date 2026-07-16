import type { UnknownAction } from '@reduxjs/toolkit';
import type {
  MockClock,
  MockLogger,
  OrderApprovalRepository,
} from '@demo/shared-api';
import { combineEpics, type Epic } from 'redux-observable';
import { catchError, filter, from, map, mergeMap, of } from 'rxjs';

import {
  orderApprovalApproveFailed,
  orderApprovalApproveRequested,
  orderApprovalApproveSucceeded,
  orderApprovalLoadFailed,
  orderApprovalLoadRequested,
  orderApprovalLoadSucceeded,
  orderApprovalRejectFailed,
  orderApprovalRejectRequested,
  orderApprovalRejectSucceeded,
} from './orderApprovalSlice';
import type { OrderApprovalRootState } from './orderApprovalTypes';

export type OrderApprovalEpicDependencies = {
  orderApprovalRepository: OrderApprovalRepository;
  logger: MockLogger;
  clock: MockClock;
};

type OrderApprovalEpic = Epic<
  UnknownAction,
  UnknownAction,
  OrderApprovalRootState,
  OrderApprovalEpicDependencies
>;

function isSaving(state: OrderApprovalRootState, orderId: string) {
  return state.orderApproval.byId[orderId]?.status === 'saving';
}

function getErrorContext(error: unknown) {
  return error instanceof Error
    ? { message: error.message }
    : { message: 'Unknown mocked workflow error' };
}

const loadApprovalEpic: OrderApprovalEpic = (
  action$,
  _state$,
  { orderApprovalRepository, logger },
) =>
  action$.pipe(
    filter(orderApprovalLoadRequested.match),
    mergeMap((action) =>
      from(
        orderApprovalRepository.loadApprovalDetails({
          orderId: action.payload.orderId,
        }),
      ).pipe(
        map((details) =>
          orderApprovalLoadSucceeded({
            orderId: details.orderId,
            portfolioId: details.portfolioId,
            amount: details.amount,
          }),
        ),
        catchError((error: unknown) => {
          logger.error('Failed to load approval details', {
            orderId: action.payload.orderId,
            ...getErrorContext(error),
          });

          return of(
            orderApprovalLoadFailed({
              orderId: action.payload.orderId,
              errorMessage: 'Approval details could not be loaded.',
            }),
          );
        }),
      ),
    ),
  );

const approveOrderEpic: OrderApprovalEpic = (
  action$,
  state$,
  { orderApprovalRepository, logger, clock },
) =>
  action$.pipe(
    filter(orderApprovalApproveRequested.match),
    filter((action) => isSaving(state$.value, action.payload.orderId)),
    mergeMap((action) =>
      from(
        orderApprovalRepository.approveOrder({
          orderId: action.payload.orderId,
          approvedAt: clock.now(),
        }),
      ).pipe(
        map((result) =>
          orderApprovalApproveSucceeded({
            orderId: result.orderId,
            completedAt: result.completedAt,
          }),
        ),
        catchError((error: unknown) => {
          logger.error('Failed to approve order', {
            orderId: action.payload.orderId,
            ...getErrorContext(error),
          });

          return of(
            orderApprovalApproveFailed({
              orderId: action.payload.orderId,
              errorMessage: 'Approval failed. Try again.',
            }),
          );
        }),
      ),
    ),
  );

const rejectOrderEpic: OrderApprovalEpic = (
  action$,
  state$,
  { orderApprovalRepository, logger, clock },
) =>
  action$.pipe(
    filter(orderApprovalRejectRequested.match),
    filter((action) => isSaving(state$.value, action.payload.orderId)),
    mergeMap((action) => {
      const current = state$.value.orderApproval.byId[action.payload.orderId];

      return from(
        orderApprovalRepository.rejectOrder({
          orderId: action.payload.orderId,
          rejectedAt: clock.now(),
          comment: current?.comment ?? '',
        }),
      ).pipe(
        map((result) =>
          orderApprovalRejectSucceeded({
            orderId: result.orderId,
            completedAt: result.completedAt,
            comment: result.comment,
          }),
        ),
        catchError((error: unknown) => {
          logger.error('Failed to reject order', {
            orderId: action.payload.orderId,
            ...getErrorContext(error),
          });

          return of(
            orderApprovalRejectFailed({
              orderId: action.payload.orderId,
              errorMessage: 'Rejection failed. Try again.',
            }),
          );
        }),
      );
    }),
  );

export const orderApprovalEpic = combineEpics<
  UnknownAction,
  UnknownAction,
  OrderApprovalRootState,
  OrderApprovalEpicDependencies
>(loadApprovalEpic, approveOrderEpic, rejectOrderEpic);
