import type { MockClock } from '@demo/shared-api';

import type {
  BootstrapServices,
  RestoredWorkspace,
} from './bootstrapServices';

type WorkspaceStorage = Pick<Storage, 'getItem' | 'setItem'>;

const workspaceStorageKey = 'financial-workspace-demo:v1:workspace';
const defaultWorkspace: RestoredWorkspace = {
  selectedPortfolioId: 'PF-001',
  layout: 'standard',
};

function wait(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, milliseconds);

    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout);
        reject(new DOMException('Bootstrap operation cancelled.', 'AbortError'));
      },
      { once: true },
    );
  });
}

function readWorkspace(storage?: WorkspaceStorage): RestoredWorkspace {
  const storedValue = storage?.getItem(workspaceStorageKey);

  if (storedValue) {
    try {
      const parsed = JSON.parse(storedValue) as {
        version?: unknown;
        selectedPortfolioId?: unknown;
        layout?: unknown;
      };

      if (
        parsed.version === 1 &&
        typeof parsed.selectedPortfolioId === 'string' &&
        typeof parsed.layout === 'string'
      ) {
        return {
          selectedPortfolioId: parsed.selectedPortfolioId,
          layout: parsed.layout,
        };
      }
    } catch {
      // Invalid local demo data falls back to a safe workspace.
    }
  }

  storage?.setItem(
    workspaceStorageKey,
    JSON.stringify({
      version: 1,
      ...defaultWorkspace,
    }),
  );

  return defaultWorkspace;
}

export function createMockBootstrapServices(
  clock: MockClock,
  storage?: WorkspaceStorage,
): BootstrapServices {
  return {
    async initializePlatformContext(provider, signal) {
      await wait(120, signal);
      return {
        provider,
        instrumentId: 'INST-ALPHA',
      };
    },
    async loadSession(signal) {
      await wait(140, signal);
      return {
        userId: 'USR-DEMO',
        deskId: 'DESK-GLOBAL',
      };
    },
    async loadReferenceData(_session, signal) {
      await wait(180, signal);
      return {
        instruments: ['INST-ALPHA', 'INST-BETA', 'INST-GAMMA'],
        portfolios: ['PF-001', 'PF-002'],
      };
    },
    async restoreWorkspace(_session, signal) {
      await wait(100, signal);
      return readWorkspace(storage);
    },
    async connectMarketData(signal) {
      await wait(220, signal);
      return {
        status: 'connected',
        connectedAt: clock.now(),
      };
    },
  };
}
