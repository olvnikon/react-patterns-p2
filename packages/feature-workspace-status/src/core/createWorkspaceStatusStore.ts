export type WorkspaceSessionStatus = 'Open' | 'Paused' | 'Closed';

export type WorkspaceConnectionStatus =
  | 'Online'
  | 'Reconnecting'
  | 'Offline';

export type WorkspaceStatusSnapshot = {
  sessionStatus: WorkspaceSessionStatus;
  connectionStatus: WorkspaceConnectionStatus;
  lastUpdatedAt: string;
  message: string;
};

type Listener = () => void;

const demoTimestamp = '2026-01-01T09:00:00.000Z';

function createMessage(
  sessionStatus: WorkspaceSessionStatus,
  connectionStatus: WorkspaceConnectionStatus,
) {
  return `Demo workspace is ${sessionStatus.toLowerCase()} and ${connectionStatus.toLowerCase()}.`;
}

function createSnapshot(
  sessionStatus: WorkspaceSessionStatus,
  connectionStatus: WorkspaceConnectionStatus,
): WorkspaceStatusSnapshot {
  return {
    sessionStatus,
    connectionStatus,
    lastUpdatedAt: demoTimestamp,
    message: createMessage(sessionStatus, connectionStatus),
  };
}

// This store exists only to demonstrate the pure external-store variant of
// Feature Facade + React Adapter. Use this style in production only when there
// is real external state outside React, such as a platform service, browser API,
// WebSocket status, RxJS-like source, or vanilla store.
//
// Redux-backed features do not need React's external-store subscription hook
// directly because React-Redux handles subscriptions internally.
export function createWorkspaceStatusStore() {
  let snapshot = createSnapshot('Open', 'Online');
  const listeners = new Set<Listener>();

  function emit(nextSnapshot: WorkspaceStatusSnapshot) {
    snapshot = nextSnapshot;
    listeners.forEach((listener) => listener());
  }

  function update(
    nextValues: Partial<
      Pick<WorkspaceStatusSnapshot, 'sessionStatus' | 'connectionStatus'>
    >,
  ) {
    const sessionStatus = nextValues.sessionStatus ?? snapshot.sessionStatus;
    const connectionStatus =
      nextValues.connectionStatus ?? snapshot.connectionStatus;

    emit({
      sessionStatus,
      connectionStatus,
      lastUpdatedAt: new Date().toISOString(),
      message: createMessage(sessionStatus, connectionStatus),
    });
  }

  return {
    getSnapshot() {
      return snapshot;
    },

    subscribe(listener: Listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },

    setSessionStatus(sessionStatus: WorkspaceSessionStatus) {
      update({ sessionStatus });
    },

    setConnectionStatus(connectionStatus: WorkspaceConnectionStatus) {
      update({ connectionStatus });
    },

    refresh() {
      update({});
    },
  };
}

export type WorkspaceStatusStore = ReturnType<
  typeof createWorkspaceStatusStore
>;
