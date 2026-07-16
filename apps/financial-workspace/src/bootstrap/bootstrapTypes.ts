import type { BootstrapProfile } from '../runtime';

export type BootstrapTaskId =
  | 'runtimeConfig'
  | 'infrastructure'
  | 'platformContext'
  | 'session'
  | 'referenceData'
  | 'workspaceState'
  | 'mainView'
  | 'marketData'
  | 'analyticsWarmup';

export type BootstrapTaskStatus =
  | 'idle'
  | 'running'
  | 'ready'
  | 'failed';

export type BootstrapTaskSnapshot = Readonly<{
  id: BootstrapTaskId;
  label: string;
  description: string;
  dependencies: readonly BootstrapTaskId[];
  critical: boolean;
  blocksMainView: boolean;
  status: BootstrapTaskStatus;
  attempts: number;
  errorMessage?: string;
}>;

export type BootstrapStatus =
  | 'idle'
  | 'running'
  | 'main-ready'
  | 'ready'
  | 'degraded'
  | 'failed';

export type BootstrapSnapshot = Readonly<{
  profile: BootstrapProfile;
  status: BootstrapStatus;
  mainViewReady: boolean;
  tasks: readonly BootstrapTaskSnapshot[];
}>;

export type BootstrapRuntime = {
  getSnapshot(): BootstrapSnapshot;
  subscribe(listener: () => void): () => void;
  start(): void;
  waitUntilMainViewReady(): Promise<void>;
  retry(taskId: BootstrapTaskId): void;
  replay(profile: BootstrapProfile): void;
  stop(): void;
};
