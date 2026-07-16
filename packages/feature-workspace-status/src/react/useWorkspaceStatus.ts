import { useMemo, useSyncExternalStore } from 'react';

import { createWorkspaceStatusStore } from '../core/createWorkspaceStatusStore';

const workspaceStatusStore = createWorkspaceStatusStore();

// This is the React Adapter for the plain TypeScript workspace-status store.
// useSyncExternalStore is the correct React API for subscribing to an external
// non-React store. Components consume state + api from this hook, not the store
// internals.
export function useWorkspaceStatus() {
  const state = useSyncExternalStore(
    workspaceStatusStore.subscribe,
    workspaceStatusStore.getSnapshot,
    workspaceStatusStore.getSnapshot,
  );

  const api = useMemo(
    () => ({
      setOpen: () => workspaceStatusStore.setSessionStatus('Open'),
      setPaused: () => workspaceStatusStore.setSessionStatus('Paused'),
      setClosed: () => workspaceStatusStore.setSessionStatus('Closed'),
      simulateReconnect: () =>
        workspaceStatusStore.setConnectionStatus('Reconnecting'),
      refresh: () => workspaceStatusStore.refresh(),
    }),
    [],
  );

  return {
    state,
    api,
  };
}
