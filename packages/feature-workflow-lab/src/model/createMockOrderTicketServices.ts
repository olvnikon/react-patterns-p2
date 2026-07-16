import type {
  OrderReceipt,
  OrderTicketServices,
} from './orderTicketTypes';

function wait(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(resolve, milliseconds);

    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeout);
        reject(new DOMException('Workflow operation cancelled.', 'AbortError'));
      },
      { once: true },
    );
  });
}

export function createMockOrderTicketServices(): OrderTicketServices {
  const committedOrders = new Map<string, OrderReceipt>();

  return {
    async checkOrder({ outcome, signal }) {
      await wait(450, signal);

      if (outcome === 'blocked') {
        return {
          status: 'blocked',
          message: 'Synthetic demo check blocked this order draft.',
        };
      }

      return {
        status: 'approved',
        message: 'Synthetic demo checks completed.',
      };
    },

    async submitOrder({
      outcome,
      idempotencyKey,
      signal,
    }) {
      if (outcome === 'definite-failure') {
        await wait(500, signal);
        throw new Error('Synthetic submission rejection.');
      }

      const receipt: OrderReceipt = {
        orderId: `ORD-${idempotencyKey.slice(0, 8).toUpperCase()}`,
        status: 'ACCEPTED',
      };

      if (outcome === 'timeout-reconciles') {
        committedOrders.set(idempotencyKey, receipt);
        await wait(1_500, signal);
        return receipt;
      }

      if (outcome === 'timeout-not-found') {
        await wait(1_500, signal);
        return receipt;
      }

      await wait(550, signal);
      committedOrders.set(idempotencyKey, receipt);
      return receipt;
    },

    async reconcileOrder({ idempotencyKey, signal }) {
      await wait(450, signal);
      return committedOrders.get(idempotencyKey) ?? null;
    },
  };
}
