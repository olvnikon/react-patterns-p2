import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Money } from '@demo/shared-types';

import type { OrderApprovalRecord, OrderApprovalState } from './orderApprovalTypes';

export const orderApprovalReducerKey = 'orderApproval';

const initialState: OrderApprovalState = {
  byId: {},
};

function createMockApproval(orderId: string, comment = ''): OrderApprovalRecord {
  return {
    orderId,
    portfolioId: 'PF-001',
    amount: {
      value: 1250000,
      currency: 'EUR',
    },
    status: 'ready',
    comment,
  };
}

const orderApprovalSlice = createSlice({
  name: orderApprovalReducerKey,
  initialState,
  reducers: {
    orderApprovalLoadRequested(
      state,
      action: PayloadAction<{ orderId: string }>,
    ) {
      const current = state.byId[action.payload.orderId];

      state.byId[action.payload.orderId] = {
        ...(current ?? createMockApproval(action.payload.orderId)),
        status: 'loading',
        errorMessage: undefined,
      };
    },

    orderApprovalLoadSucceeded(
      state,
      action: PayloadAction<{
        orderId: string;
        portfolioId: string;
        amount: Money;
      }>,
    ) {
      const current = state.byId[action.payload.orderId];

      state.byId[action.payload.orderId] = {
        orderId: action.payload.orderId,
        portfolioId: action.payload.portfolioId,
        amount: action.payload.amount,
        status: 'ready',
        comment: current?.comment ?? '',
        completedAt: undefined,
        errorMessage: undefined,
      };
    },

    orderApprovalLoadFailed(
      state,
      action: PayloadAction<{ orderId: string; errorMessage: string }>,
    ) {
      const current = state.byId[action.payload.orderId];

      state.byId[action.payload.orderId] = {
        ...(current ?? createMockApproval(action.payload.orderId)),
        status: 'failed',
        errorMessage: action.payload.errorMessage,
      };
    },

    orderApprovalCommentChanged(
      state,
      action: PayloadAction<{ orderId: string; comment: string }>,
    ) {
      const current =
        state.byId[action.payload.orderId] ??
        createMockApproval(action.payload.orderId);

      state.byId[action.payload.orderId] = {
        ...current,
        comment: action.payload.comment,
        errorMessage: undefined,
      };
    },

    orderApprovalApproveRequested(
      state,
      action: PayloadAction<{ orderId: string }>,
    ) {
      const current = state.byId[action.payload.orderId];

      if (!current) {
        state.byId[action.payload.orderId] = {
          ...createMockApproval(action.payload.orderId),
          status: 'failed',
          errorMessage: 'Approval details must be loaded before approval.',
        };
        return;
      }

      if (!current.comment.trim()) {
        current.errorMessage = 'Add a comment before approving this order.';
        return;
      }

      current.status = 'saving';
      current.completedAt = undefined;
      current.errorMessage = undefined;
    },

    orderApprovalApproveSucceeded(
      state,
      action: PayloadAction<{ orderId: string; completedAt: string }>,
    ) {
      const current = state.byId[action.payload.orderId];

      if (!current) {
        return;
      }

      current.status = 'approved';
      current.completedAt = action.payload.completedAt;
      current.errorMessage = undefined;
    },

    orderApprovalApproveFailed(
      state,
      action: PayloadAction<{ orderId: string; errorMessage: string }>,
    ) {
      const current = state.byId[action.payload.orderId];

      if (!current) {
        return;
      }

      current.status = 'failed';
      current.errorMessage = action.payload.errorMessage;
    },

    orderApprovalRejectRequested(
      state,
      action: PayloadAction<{ orderId: string }>,
    ) {
      const current = state.byId[action.payload.orderId];

      if (!current) {
        state.byId[action.payload.orderId] = {
          ...createMockApproval(action.payload.orderId),
          status: 'failed',
          errorMessage: 'Approval details must be loaded before rejection.',
        };
        return;
      }

      if (!current.comment.trim()) {
        current.errorMessage = 'Add a comment before rejecting this order.';
        return;
      }

      current.status = 'saving';
      current.completedAt = undefined;
      current.errorMessage = undefined;
    },

    orderApprovalRejectSucceeded(
      state,
      action: PayloadAction<{
        orderId: string;
        completedAt: string;
        comment?: string;
      }>,
    ) {
      const current = state.byId[action.payload.orderId];

      if (!current) {
        return;
      }

      current.status = 'rejected';
      current.completedAt = action.payload.completedAt;
      current.comment = action.payload.comment ?? current.comment;
      current.errorMessage = undefined;
    },

    orderApprovalRejectFailed(
      state,
      action: PayloadAction<{ orderId: string; errorMessage: string }>,
    ) {
      const current = state.byId[action.payload.orderId];

      if (!current) {
        return;
      }

      current.status = 'failed';
      current.errorMessage = action.payload.errorMessage;
    },

    orderApprovalReset(state, action: PayloadAction<{ orderId: string }>) {
      delete state.byId[action.payload.orderId];
    },
  },
});

export const orderApprovalReducer = orderApprovalSlice.reducer;

export const {
  orderApprovalApproveFailed,
  orderApprovalApproveRequested,
  orderApprovalApproveSucceeded,
  orderApprovalCommentChanged,
  orderApprovalLoadFailed,
  orderApprovalLoadRequested,
  orderApprovalLoadSucceeded,
  orderApprovalRejectFailed,
  orderApprovalRejectRequested,
  orderApprovalRejectSucceeded,
  orderApprovalReset,
} = orderApprovalSlice.actions;
