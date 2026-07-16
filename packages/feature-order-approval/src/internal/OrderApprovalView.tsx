import { useEffect } from 'react';

import { useOrderApproval } from '../react/useOrderApproval';
import { ApprovalActions } from './ApprovalActions';
import { ApprovalCommentBox } from './ApprovalCommentBox';
import { OrderSummaryPanel } from './OrderSummaryPanel';

type OrderApprovalViewProps = {
  orderId: string;
};

export function OrderApprovalView({ orderId }: OrderApprovalViewProps) {
  const { state, api } = useOrderApproval(orderId);

  useEffect(() => {
    api.load();
  }, [api, orderId]);

  return (
    <section className="page-section">
      <div>
        <p className="eyebrow">Approval</p>
        <h1>Order Approval</h1>
      </div>
      <div className="pattern-tags" aria-label="Approval patterns">
        <span className="pattern-tag">Feature Facade + React Adapter</span>
        <span className="pattern-tag">redux-observable dependencies</span>
        <span className="pattern-tag">Mock repository</span>
      </div>
      <OrderSummaryPanel state={state} />
      <article className="workspace-panel">
        <h2>Review Decision</h2>
        {state.status === 'loading' ? (
          <p>Loading approval details...</p>
        ) : (
          <>
            <ApprovalCommentBox
              comment={state.comment}
              onCommentChange={api.updateComment}
            />
            {state.errorMessage ? (
              <p className="error-message">{state.errorMessage}</p>
            ) : null}
            <ApprovalActions
              status={state.status}
              canApprove={state.canApprove}
              canReject={state.canReject}
              onApprove={api.approve}
              onReject={api.reject}
              onReset={api.reset}
            />
          </>
        )}
      </article>
    </section>
  );
}
