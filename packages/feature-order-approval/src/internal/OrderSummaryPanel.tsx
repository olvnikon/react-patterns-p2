import type { OrderApprovalViewState } from '../model/orderApprovalTypes';

type OrderSummaryPanelProps = {
  state: OrderApprovalViewState;
};

export function OrderSummaryPanel({ state }: OrderSummaryPanelProps) {
  return (
    <article className="workspace-panel">
      <h2>{state.title}</h2>
      <dl>
        <div>
          <dt>Order</dt>
          <dd>{state.orderId}</dd>
        </div>
        <div>
          <dt>Amount</dt>
          <dd>{state.amountLabel || 'Not loaded'}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{state.status}</dd>
        </div>
      </dl>
    </article>
  );
}
