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
    description: 'Initialize fake application-side services.',
    dependencies: ['runtimeConfig'],
    critical: true,
    blocksMainView: true,
  },
  platformContext: {
    id: 'platformContext',
    label: 'Platform context',
    description: 'Initialize the configured local context adapter.',
    dependencies: ['runtimeConfig'],
    critical: true,
    blocksMainView: true,
  },
  session: {
    id: 'session',
    label: 'Demo session',
    description: 'Restore generic local session context.',
    dependencies: ['infrastructure'],
    critical: true,
    blocksMainView: true,
  },
  referenceData: {
    id: 'referenceData',
    label: 'Reference data',
    description: 'Load fake instruments and portfolio labels.',
    dependencies: ['session'],
    critical: true,
    blocksMainView: true,
  },
  workspaceState: {
    id: 'workspaceState',
    label: 'Workspace state',
    description: 'Restore a fake local workspace preference.',
    dependencies: ['session'],
    critical: true,
    blocksMainView: true,
  },
  mainView: {
    id: 'mainView',
    label: 'Main view',
    description: 'Reach the milestone that allows React to mount.',
    dependencies: ['platformContext', 'referenceData', 'workspaceState'],
    critical: true,
    blocksMainView: true,
  },
  marketData: {
    id: 'marketData',
    label: 'Market data',
    description: 'Warm a fake optional live-data capability.',
    dependencies: ['mainView'],
    critical: false,
    blocksMainView: false,
  },
  analyticsWarmup: {
    id: 'analyticsWarmup',
    label: 'Analytics warmup',
    description: 'Warm the configured synthetic analytics capability.',
    dependencies: ['mainView'],
    critical: false,
    blocksMainView: false,
  },
};
