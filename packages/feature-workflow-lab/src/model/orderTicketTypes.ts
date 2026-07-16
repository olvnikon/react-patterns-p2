export type OrderSide = 'BUY' | 'SELL';

export type DemoOutcome =
  | 'accepted'
  | 'blocked'
  | 'definite-failure'
  | 'timeout-reconciles'
  | 'timeout-not-found';

export type OrderDraft = Readonly<{
  instrumentId: string;
  side: OrderSide;
  quantity: number;
}>;

export type OrderReceipt = Readonly<{
  orderId: string;
  status: 'ACCEPTED';
}>;

export type CheckDecision =
  | {
      status: 'approved';
      message: string;
    }
  | {
      status: 'blocked';
      message: string;
    };

export type OrderTicketServices = {
  checkOrder(input: {
    draft: OrderDraft;
    outcome: DemoOutcome;
    signal: AbortSignal;
  }): Promise<CheckDecision>;
  submitOrder(input: {
    draft: OrderDraft;
    outcome: DemoOutcome;
    idempotencyKey: string;
    signal: AbortSignal;
  }): Promise<OrderReceipt>;
  reconcileOrder(input: {
    idempotencyKey: string;
    signal: AbortSignal;
  }): Promise<OrderReceipt | null>;
};

export type OrderTicketParentEvent =
  | {
      type: 'ticket.accepted';
      ticketId: string;
      orderId: string;
    }
  | {
      type: 'ticket.blocked';
      ticketId: string;
      message: string;
    }
  | {
      type: 'ticket.failed';
      ticketId: string;
      message: string;
    };

export type OrderTicketParentRef = {
  send(event: OrderTicketParentEvent): void;
};

export type OrderTicketInput = {
  ticketId: string;
  initialInstrumentId?: string;
  parent?: OrderTicketParentRef;
};
