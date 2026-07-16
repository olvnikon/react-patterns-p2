import type {
  DemoOutcome,
  OrderSide,
} from './model/orderTicketTypes';
import type { OrderTicketLogic } from './model/createOrderTicketMachine';
import { useOrderTicket } from './react/useOrderTicket';

type OrderTicketEntryProps = {
  logic: OrderTicketLogic;
  ticketId: string;
};

const workflowStates = [
  'editing',
  'checking',
  'blocked',
  'confirming',
  'submitting',
  'outcomeUnknown',
  'reconciling',
  'accepted',
  'failed',
];

function getStatusTone(status: string): string {
  if (status === 'accepted') {
    return 'ready';
  }

  if (status === 'failed' || status === 'blocked') {
    return 'failed';
  }

  if (status === 'editing') {
    return 'idle';
  }

  return 'running';
}

export function OrderTicketEntry({
  logic,
  ticketId,
}: OrderTicketEntryProps) {
  const { state, api } = useOrderTicket(logic, ticketId);

  return (
    <section className="page-section">
      <div>
        <p className="eyebrow">Part 2 · Workflow</p>
        <h1>Order Ticket Statechart</h1>
      </div>

      <div className="pattern-tags">
        <span className="pattern-tag">State Machines</span>
        <span className="pattern-tag">Statecharts</span>
        <span className="pattern-tag">XState v5</span>
      </div>

      <p>
        One explicit state controls which events are legal. Async checks,
        submission timeout, and reconciliation belong to the workflow rather
        than to React effects.
      </p>

      <div className="workflow-state-strip" aria-label="Workflow states">
        {workflowStates.map((workflowState) => (
          <span
            className={
              state.status === workflowState
                ? 'workflow-state workflow-state--active'
                : 'workflow-state'
            }
            key={workflowState}
          >
            {workflowState}
          </span>
        ))}
      </div>

      <div className="workflow-layout">
        <article className="workspace-panel">
          <div>
            <p className="eyebrow">Order draft</p>
            <span
              className={`status-chip status-chip--${getStatusTone(
                state.status,
              )}`}
            >
              {state.status}
            </span>
          </div>

          <label className="form-field">
            <span>Instrument</span>
            <select
              value={state.instrumentId}
              disabled={!state.canEdit}
              onChange={(event) => api.changeInstrument(event.target.value)}
            >
              <option value="INST-ALPHA">INST-ALPHA</option>
              <option value="INST-BETA">INST-BETA</option>
              <option value="INST-GAMMA">INST-GAMMA</option>
            </select>
          </label>

          <label className="form-field">
            <span>Side</span>
            <select
              value={state.side}
              disabled={!state.canEdit}
              onChange={(event) =>
                api.changeSide(event.target.value as OrderSide)
              }
            >
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </label>

          <label className="form-field">
            <span>Quantity</span>
            <input
              type="number"
              min="1"
              value={state.quantity}
              disabled={!state.canEdit}
              onChange={(event) =>
                api.changeQuantity(Number(event.target.value))
              }
            />
          </label>

          <label className="form-field">
            <span>Demo outcome</span>
            <select
              value={state.outcome}
              disabled={!state.canEdit}
              onChange={(event) =>
                api.changeOutcome(event.target.value as DemoOutcome)
              }
            >
              <option value="accepted">Accepted</option>
              <option value="blocked">Blocked by demo check</option>
              <option value="definite-failure">Definite failure</option>
              <option value="timeout-reconciles">
                Timeout, then reconciles
              </option>
              <option value="timeout-not-found">
                Timeout, result not found
              </option>
            </select>
          </label>

          <div className="approval-actions">
            {state.canEdit ? (
              <button
                type="button"
                disabled={!state.canSubmit}
                onClick={api.submit}
              >
                Review order
              </button>
            ) : null}
            {state.canConfirm ? (
              <>
                <button type="button" onClick={api.confirm}>
                  Confirm
                </button>
                <button type="button" onClick={api.edit}>
                  Edit
                </button>
              </>
            ) : null}
            {state.status === 'blocked' ? (
              <button type="button" onClick={api.edit}>
                Edit draft
              </button>
            ) : null}
            {state.canReconcile ? (
              <button type="button" onClick={api.reconcile}>
                Reconcile outcome
              </button>
            ) : null}
            {state.canRetry ? (
              <button type="button" onClick={api.retry}>
                Return to draft
              </button>
            ) : null}
            {state.canReset ? (
              <button type="button" onClick={api.reset}>
                Create another order
              </button>
            ) : null}
          </div>
        </article>

        <article className="workspace-panel workflow-diagnostics">
          <div>
            <p className="eyebrow">State projection</p>
            <span className="pattern-tag">state + api</span>
          </div>

          <dl>
            <div>
              <dt>Current state</dt>
              <dd>{state.status}</dd>
            </div>
            <div>
              <dt>Last event</dt>
              <dd>{state.lastEvent}</dd>
            </div>
            <div>
              <dt>Ticket</dt>
              <dd>{state.ticketId}</dd>
            </div>
            <div>
              <dt>Idempotency key</dt>
              <dd>{state.idempotencyKey.slice(0, 13)}…</dd>
            </div>
          </dl>

          {state.status === 'checking' ? (
            <p>Running a synthetic asynchronous check…</p>
          ) : null}
          {state.status === 'confirming' ? (
            <p>{state.decisionMessage}</p>
          ) : null}
          {state.status === 'submitting' ? (
            <p>Submitting with one stable idempotency key…</p>
          ) : null}
          {state.status === 'outcomeUnknown' ? (
            <p className="workflow-warning">
              The browser timed out. This does not prove rejection. Reconcile
              before deciding whether a retry is safe.
            </p>
          ) : null}
          {state.status === 'reconciling' ? (
            <p>Looking up the synthetic result by idempotency key…</p>
          ) : null}
          {state.status === 'blocked' ? (
            <p className="workflow-warning">{state.decisionMessage}</p>
          ) : null}
          {state.orderId ? (
            <p className="workflow-success">
              Accepted as {state.orderId}
            </p>
          ) : null}
          {state.errorMessage ? (
            <p className="error-message">{state.errorMessage}</p>
          ) : null}
        </article>
      </div>

      <div className="route-note">
        <div className="pattern-tags">
          <span className="pattern-tag">What to observe</span>
        </div>
        <p>
          React renders a view-ready projection and sends business events. It
          does not coordinate checks, timeouts, submission, or reconciliation.
          All data and decisions in this demo are fake and local.
        </p>
      </div>
    </section>
  );
}
