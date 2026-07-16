import { WorkspaceStatusView } from './internal/WorkspaceStatusView';
import { useWorkspaceStatus } from './react/useWorkspaceStatus';

export function WorkspaceStatusEntry() {
  const { state, api } = useWorkspaceStatus();

  return (
    <WorkspaceStatusView
      state={state}
      onSetOpen={api.setOpen}
      onSetPaused={api.setPaused}
      onSetClosed={api.setClosed}
      onSimulateReconnect={api.simulateReconnect}
      onRefresh={api.refresh}
    />
  );
}
