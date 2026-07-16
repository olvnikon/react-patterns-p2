import type { Money } from '@demo/shared-types';

export type OrderApprovalStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'saving'
  | 'approved'
  | 'rejected'
  | 'failed';

export type OrderApprovalRecord = {
  orderId: string;
  portfolioId: string;
  amount: Money;
  status: OrderApprovalStatus;
  comment: string;
  completedAt?: string;
  errorMessage?: string;
};

export type OrderApprovalState = {
  byId: Record<string, OrderApprovalRecord>;
};

export type OrderApprovalViewState = {
  orderId: string;
  title: string;
  amountLabel: string;
  status: OrderApprovalStatus;
  comment: string;
  errorMessage?: string;
  canApprove: boolean;
  canReject: boolean;
};

export type OrderApprovalRootState = {
  orderApproval: OrderApprovalState;
};
