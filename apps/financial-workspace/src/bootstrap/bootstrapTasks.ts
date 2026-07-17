import type {
  BootstrapTaskId,
  BootstrapTaskSnapshot,
} from './bootstrapTypes';

type TaskDefinition = Omit<
  BootstrapTaskSnapshot,
  'status' | 'attempts' | 'errorMessage'
>;

// Dependencies define order; flags describe failure and readiness impact.
export const bootstrapTaskDefinitions: Readonly<
  Record<BootstrapTaskId, TaskDefinition>
> = {
  runtimeConfig: {
    id: 'runtimeConfig',
    label: 'Runtime config',
    description: 'Validated resources.json customData.',
    dependencies: [],
    critical: true,
    blocksMainView: true,
  },
  infrastructure: {
    id: 'infrastructure',
    label: 'Infrastructure',
    description: 'Record startup and initialize the Redux bootstrap model.',
    dependencies: ['runtimeConfig'],
    critical: true,
    blocksMainView: true,
  },
  platformContext: {
    id: 'platformContext',
    label: 'Platform context',
    description: 'Initialize the configured mock context adapter.',
    dependencies: ['runtimeConfig'],
    critical: true,
    blocksMainView: true,
  },
  session: {
    id: 'session',
    label: 'Demo session',
    description: 'Load a generic session from a mocked repository.',
    dependencies: ['infrastructure'],
    critical: true,
    blocksMainView: true,
  },
  referenceData: {
    id: 'referenceData',
    label: 'Reference data',
    description: 'Load fake instruments and portfolios into Redux.',
    dependencies: ['session'],
    critical: true,
    blocksMainView: true,
  },
  workspaceState: {
    id: 'workspaceState',
    label: 'Workspace state',
    description: 'Restore a versioned preference from localStorage.',
    dependencies: ['session'],
    critical: true,
    blocksMainView: true,
  },
  mainView: {
    id: 'mainView',
    label: 'Main view',
    description: 'Verify required outputs and open the React mount gate.',
    dependencies: ['platformContext', 'referenceData', 'workspaceState'],
    critical: true,
    blocksMainView: true,
  },
  marketData: {
    id: 'marketData',
    label: 'Market data',
    description: 'Complete a mocked market-data connection handshake.',
    dependencies: ['mainView'],
    critical: false,
    blocksMainView: false,
  },
  analyticsWarmup: {
    id: 'analyticsWarmup',
    label: 'Analytics warmup',
    description: 'Run a tiny calculation through the configured Strategy.',
    dependencies: ['mainView'],
    critical: false,
    blocksMainView: false,
  },
};
