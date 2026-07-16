import type { Money } from '@demo/shared-types';

import { delay } from './delay';

export type OrderApprovalDetails = {
  orderId: string;
  portfolioId: string;
  amount: Money;
  status: 'pending';
};

export type OrderApprovalResult = {
  orderId: string;
  status: 'approved' | 'rejected';
  completedAt: string;
  comment?: string;
};

export type OrderApprovalRepository = {
  loadApprovalDetails(input: {
    orderId: string;
  }): Promise<OrderApprovalDetails>;
  approveOrder(input: {
    orderId: string;
    approvedAt: string;
  }): Promise<OrderApprovalResult>;
  rejectOrder(input: {
    orderId: string;
    rejectedAt: string;
    comment: string;
  }): Promise<OrderApprovalResult>;
};

export function createMockOrderApprovalRepository(): OrderApprovalRepository {
  return {
    async loadApprovalDetails({ orderId }) {
      await delay(250);

      return {
        orderId,
        portfolioId: 'PF-001',
        amount: {
          value: 1250000,
          currency: 'EUR',
        },
        status: 'pending',
      };
    },

    async approveOrder({ orderId, approvedAt }) {
      await delay(350);

      return {
        orderId,
        status: 'approved',
        completedAt: approvedAt,
      };
    },

    async rejectOrder({ orderId, rejectedAt, comment }) {
      await delay(350);

      return {
        orderId,
        status: 'rejected',
        completedAt: rejectedAt,
        comment,
      };
    },
  };
}
