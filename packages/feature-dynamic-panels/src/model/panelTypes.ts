import type { ComponentType } from 'react';

export type PanelType =
  | 'portfolio-overview'
  | 'activity-summary'
  | 'scenario-summary';

export type PortfolioPanelConfig = {
  portfolioId: string;
};

export type ActivityPanelConfig = {
  userId: string;
  filter?: 'today' | 'week';
  mode: 'ready' | 'stale' | 'fail-first';
};

export type ScenarioPanelConfig = {
  portfolioId: string;
  mode: 'ready' | 'degraded' | 'render-failure';
};

export type PanelConfig =
  | PortfolioPanelConfig
  | ActivityPanelConfig
  | ScenarioPanelConfig;

export type DynamicPanelProps = {
  config: PanelConfig;
};

export type PanelModule = {
  default: ComponentType<DynamicPanelProps>;
};

export type PanelDefinition = {
  type: PanelType;
  title: string;
  summary: string;
  preloaderId: string;
  load(): Promise<PanelModule>;
  validate(config: PanelConfig): string | undefined;
};

export type PanelInstance = {
  id: string;
  type: PanelType;
  enabled: boolean;
  config: PanelConfig;
  revision: number;
};

export type PanelPreloadSnapshot = Readonly<{
  id: string;
  status: 'idle' | 'loading' | 'ready' | 'failed';
  attempts: number;
  durationMilliseconds?: number;
  errorMessage?: string;
}>;

export type PanelPreloadApi = {
  requestIntent(id: string): void;
  force(id: string): Promise<unknown>;
  getSnapshot(): readonly PanelPreloadSnapshot[];
  subscribe(listener: () => void): () => void;
};
