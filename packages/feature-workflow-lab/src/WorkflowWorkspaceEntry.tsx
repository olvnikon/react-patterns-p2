import { useMachine, useSelector } from '@xstate/react';

import type {
  DemoOutcome,
  OrderSide,
} from './model/orderTicketTypes';
import type {
  OrderTicketActor,
  WorkflowWorkspaceLogic,
} from './model/createWorkflowWorkspaceMachine';
import type { ExternalContextSource } from './model/externalContextSource';

type WorkflowWorkspaceEntryProps = {
  logic: WorkflowWorkspaceLogic;
  externalContextSource: ExternalContextSource;
};

function getActorStatusTone(status: string): string {
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

function TicketTab({
  actor,
  ticketId,
  selected,
  onSelect,
  onClose,
}: {
  actor: OrderTicketActor;
  ticketId: string;
  selected: boolean;
  onSelect(): void;
  onClose(): void;
}) {
  const instrumentId = useSelector(
    actor,
    (snapshot) => snapshot.context.draft.instrumentId,
  );
  const status = useSelector(actor, (snapshot) => String(snapshot.value));

  return (
    <div className="actor-ticket-tab">
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
      >
        <strong>{instrumentId}</strong>
        <span>{ticketId}</span>
        <span>{status}</span>
      </button>
      <button
        type="button"
        aria-label={`Close ${ticketId}`}
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

function TicketActorPanel({ actor }: { actor: OrderTicketActor }) {
  const snapshot = useSelector(actor, (value) => value);
  const context = snapshot.context;
  const editing = snapshot.matches('editing');

  return (
    <article className="workspace-panel actor-ticket-panel">
      <div>
        <div>
          <p className="eyebrow">Selected child actor</p>
          <h2>{context.ticketId}</h2>
        </div>
        <span
          className={`status-chip status-chip--${getActorStatusTone(
            String(snapshot.value),
          )}`}
        >
          {String(snapshot.value)}
        </span>
      </div>

      <label className="form-field">
        <span>Instrument</span>
        <select
          disabled={!editing}
          value={context.draft.instrumentId}
          onChange={(event) =>
            actor.send({
              type: 'INSTRUMENT_CHANGED',
              value: event.target.value,
            })
          }
        >
          <option value="INST-ALPHA">INST-ALPHA</option>
          <option value="INST-BETA">INST-BETA</option>
          <option value="INST-GAMMA">INST-GAMMA</option>
        </select>
      </label>

      <label className="form-field">
        <span>Side</span>
        <select
          disabled={!editing}
          value={context.draft.side}
          onChange={(event) =>
            actor.send({
              type: 'SIDE_CHANGED',
              value: event.target.value as OrderSide,
            })
          }
        >
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </select>
      </label>

      <label className="form-field">
        <span>Demo outcome</span>
        <select
          disabled={!editing}
          value={context.outcome}
          onChange={(event) =>
            actor.send({
              type: 'OUTCOME_CHANGED',
              value: event.target.value as DemoOutcome,
            })
          }
        >
          <option value="accepted">Accepted</option>
          <option value="blocked">Blocked</option>
          <option value="definite-failure">Definite failure</option>
          <option value="timeout-reconciles">Timeout, reconciles</option>
          <option value="timeout-not-found">Timeout, not found</option>
        </select>
      </label>

      <div className="approval-actions">
        {editing ? (
          <button
            type="button"
            onClick={() => actor.send({ type: 'SUBMIT' })}
          >
            Review
          </button>
        ) : null}
        {snapshot.matches('confirming') ? (
          <button
            type="button"
            onClick={() => actor.send({ type: 'CONFIRM' })}
          >
            Confirm
          </button>
        ) : null}
        {snapshot.matches('confirming') || snapshot.matches('blocked') ? (
          <button
            type="button"
            onClick={() => actor.send({ type: 'EDIT' })}
          >
            Edit
          </button>
        ) : null}
        {snapshot.matches('outcomeUnknown') ? (
          <button
            type="button"
            onClick={() => actor.send({ type: 'RECONCILE' })}
          >
            Reconcile
          </button>
        ) : null}
        {snapshot.matches('failed') ? (
          <button
            type="button"
            onClick={() => actor.send({ type: 'RETRY' })}
          >
            Return to draft
          </button>
        ) : null}
        {snapshot.matches('accepted') ? (
          <button
            type="button"
            onClick={() => actor.send({ type: 'RESET' })}
          >
            Reset
          </button>
        ) : null}
      </div>

      {context.receipt ? (
        <p className="workflow-success">
          Child reported {context.receipt.orderId}
        </p>
      ) : null}
      {context.errorMessage ? (
        <p className="error-message">{context.errorMessage}</p>
      ) : null}
    </article>
  );
}

export function WorkflowWorkspaceEntry({
  logic,
  externalContextSource,
}: WorkflowWorkspaceEntryProps) {
  const [snapshot, send] = useMachine(logic);
  const tickets = snapshot.context.tickets;
  const selectedTicketId = snapshot.context.selectedTicketId;
  const selectedTicket = selectedTicketId
    ? tickets[selectedTicketId]
    : undefined;

  return (
    <section className="page-section">
      <div>
        <p className="eyebrow">Part 2 · Orchestration</p>
        <h1>Workflow Actor Workspace</h1>
      </div>

      <div className="pattern-tags">
        <span className="pattern-tag">Actor Model</span>
        <span className="pattern-tag">Parent-child lifecycle</span>
        <span className="pattern-tag">Targeted messages</span>
      </div>

      <p>
        One ticket statechart is instantiated several times. Each actor owns
        private state and a mailbox. The workspace owns which actors exist,
        which one is selected, and where external context is routed.
      </p>

      <div className="actor-tree" aria-label="Actor hierarchy">
        <strong>Workspace Actor</strong>
        <span>→ Ticket Actors ({Object.keys(tickets).length})</span>
        <span>→ Submission / reconciliation actors</span>
        <span>+ External Context Adapter Actor</span>
      </div>

      <div className="actor-workspace-actions">
        <button
          type="button"
          onClick={() => send({ type: 'ticket.open' })}
        >
          Spawn ticket
        </button>
        <button
          type="button"
          onClick={() =>
            send({
              type: 'workspace.side.change',
              side: 'BUY',
            })
          }
        >
          Send BUY to all
        </button>
        <button
          type="button"
          onClick={() =>
            send({
              type: 'workspace.side.change',
              side: 'SELL',
            })
          }
        >
          Send SELL to all
        </button>
        <button
          type="button"
          disabled={!selectedTicket}
          onClick={() =>
            externalContextSource.publishInstrument('INST-GAMMA')
          }
        >
          Publish external INST-GAMMA
        </button>
      </div>

      <div className="actor-ticket-tabs">
        {Object.entries(tickets).map(([ticketId, actor]) => (
          <TicketTab
            actor={actor}
            ticketId={ticketId}
            selected={ticketId === selectedTicketId}
            key={ticketId}
            onSelect={() =>
              send({
                type: 'ticket.select',
                ticketId,
              })
            }
            onClose={() =>
              send({
                type: 'ticket.close',
                ticketId,
              })
            }
          />
        ))}
      </div>

      <div className="actor-workspace-layout">
        {selectedTicket ? (
          <TicketActorPanel actor={selectedTicket} />
        ) : (
          <article className="workspace-panel">
            <p>No ticket actors are running. Spawn one to continue.</p>
          </article>
        )}

        <article className="workspace-panel actor-activity">
          <div>
            <p className="eyebrow">Workspace mailbox facts</p>
            <span className="status-chip status-chip--ready">
              Main thread
            </span>
          </div>
          <ul className="placeholder-list">
            {snapshot.context.activity.map((entry, index) => (
              <li key={`${entry}-${index}`}>
                <span>{entry}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="route-note">
        <div className="pattern-tags">
          <span className="pattern-tag">What to observe</span>
        </div>
        <p>
          Submitting one ticket does not block editing another. Workspace
          commands target known actor references. Child actors report facts
          back to the parent. Closing a tab stops that child. These actors model
          logical concurrency on the main thread; they are not Web Workers.
        </p>
      </div>
    </section>
  );
}
