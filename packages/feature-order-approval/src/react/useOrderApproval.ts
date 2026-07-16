import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  orderApprovalApproveRequested,
  orderApprovalCommentChanged,
  orderApprovalLoadRequested,
  orderApprovalRejectRequested,
  orderApprovalReset,
} from '../model/orderApprovalSlice';
import { selectOrderApprovalView } from '../model/orderApprovalSelectors';
import type {
  OrderApprovalRootState,
  OrderApprovalViewState,
} from '../model/orderApprovalTypes';

type UseOrderApprovalResult = {
  state: OrderApprovalViewState;
  api: {
    load: () => void;
    updateComment: (comment: string) => void;
    approve: () => void;
    reject: () => void;
    reset: () => void;
  };
};

export function useOrderApproval(orderId: string): UseOrderApprovalResult {
  const dispatch = useDispatch();
  const state = useSelector((rootState: OrderApprovalRootState) =>
    selectOrderApprovalView(rootState, orderId),
  );

  const load = useCallback(() => {
    dispatch(orderApprovalLoadRequested({ orderId }));
  }, [dispatch, orderId]);

  const updateComment = useCallback(
    (comment: string) => {
      dispatch(orderApprovalCommentChanged({ orderId, comment }));
    },
    [dispatch, orderId],
  );

  const approve = useCallback(() => {
    dispatch(orderApprovalApproveRequested({ orderId }));
  }, [dispatch, orderId]);

  const reject = useCallback(() => {
    dispatch(orderApprovalRejectRequested({ orderId }));
  }, [dispatch, orderId]);

  const reset = useCallback(() => {
    dispatch(orderApprovalReset({ orderId }));
  }, [dispatch, orderId]);

  const api = useMemo(
    () => ({
      load,
      updateComment,
      approve,
      reject,
      reset,
    }),
    [approve, load, reject, reset, updateComment],
  );

  return {
    state,
    api,
  };
}
