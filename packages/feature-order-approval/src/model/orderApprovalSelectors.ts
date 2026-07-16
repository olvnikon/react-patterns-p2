import { formatMoney, formatStatus } from '@demo/shared-formatting';

import type {
  OrderApprovalRootState,
  OrderApprovalViewState,
} from './orderApprovalTypes';

export function selectOrderApprovalView(
  state: OrderApprovalRootState,
  orderId: string,
): OrderApprovalViewState {
  const approval = state.orderApproval.byId[orderId];

  if (!approval) {
    return {
      orderId,
      title: 'Order Approval',
      amountLabel: '',
      status: 'idle',
      comment: '',
      canApprove: false,
      canReject: false,
    };
  }

  const canSubmit =
    approval.status === 'ready' && approval.comment.trim().length > 0;

  return {
    orderId,
    title: `Order ${approval.orderId}`,
    amountLabel: formatMoney(approval.amount),
    status: approval.status,
    comment: approval.comment,
    errorMessage: approval.errorMessage,
    canApprove: canSubmit,
    canReject: canSubmit,
  };
}

export function selectOrderApprovalStatusLabel(
  state: OrderApprovalRootState,
  orderId: string,
) {
  return formatStatus(selectOrderApprovalView(state, orderId).status);
}
