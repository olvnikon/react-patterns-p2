type WorkspaceStatusViewState = {
  sessionStatus: 'Open' | 'Paused' | 'Closed';
  connectionStatus: 'Online' | 'Reconnecting' | 'Offline';
  lastUpdatedAt: string;
  message: string;
};

type WorkspaceStatusViewProps = {
  state: WorkspaceStatusViewState;
  onSetOpen: () => void;
  onSetPaused: () => void;
  onSetClosed: () => void;
  onSimulateReconnect: () => void;
  onRefresh: () => void;
};

export function WorkspaceStatusView({
  state,
  onSetOpen,
  onSetPaused,
  onSetClosed,
  onSimulateReconnect,
  onRefresh,
}: WorkspaceStatusViewProps) {
  return (
    <article className="workspace-panel">
      <div>
        <h2>Workspace Status</h2>
        <span className="pattern-tag">Pure external-store adapter</span>
      </div>
      <p>{state.message}</p>
      <dl>
        <div>
          <dt>Session</dt>
          <dd>{state.sessionStatus}</dd>
        </div>
        <div>
          <dt>Connection</dt>
          <dd>{state.connectionStatus}</dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd>{state.lastUpdatedAt}</dd>
        </div>
      </dl>
      <div className="approval-actions">
        <button type="button" onClick={onSetOpen}>
          Set Open
        </button>
        <button type="button" onClick={onSetPaused}>
          Set Paused
        </button>
        <button type="button" onClick={onSetClosed}>
          Set Closed
        </button>
        <button type="button" onClick={onSimulateReconnect}>
          Simulate Reconnect
        </button>
        <button type="button" onClick={onRefresh}>
          Refresh Timestamp
        </button>
      </div>
    </article>
  );
}
