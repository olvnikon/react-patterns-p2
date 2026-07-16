import {
  OrderTicketEntry,
  WorkflowWorkspaceEntry,
  type ExternalContextSource,
  type OrderTicketLogic,
  type WorkflowWorkspaceLogic,
} from '@demo/feature-workflow-lab';
import { useState } from 'react';

type WorkflowsRouteProps = {
  orderTicketLogic: OrderTicketLogic;
  workflowWorkspaceLogic: WorkflowWorkspaceLogic;
  externalContextSource: ExternalContextSource;
};

export function WorkflowsRoute({
  orderTicketLogic,
  workflowWorkspaceLogic,
  externalContextSource,
}: WorkflowsRouteProps) {
  const [mode, setMode] = useState<'statechart' | 'actors'>('statechart');

  return (
    <div className="dashboard-stack">
      <div className="workflow-mode-switcher">
        <button
          type="button"
          aria-pressed={mode === 'statechart'}
          onClick={() => setMode('statechart')}
        >
          One Statechart
        </button>
        <button
          type="button"
          aria-pressed={mode === 'actors'}
          onClick={() => setMode('actors')}
        >
          Actor Workspace
        </button>
      </div>

      {mode === 'statechart' ? (
        <OrderTicketEntry
          logic={orderTicketLogic}
          ticketId="TICKET-DEMO-01"
        />
      ) : (
        <WorkflowWorkspaceEntry
          logic={workflowWorkspaceLogic}
          externalContextSource={externalContextSource}
        />
      )}
    </div>
  );
}
