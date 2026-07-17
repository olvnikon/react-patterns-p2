import type { MockClock, MockLogger } from '@demo/shared-api';
import type { PortfolioAnalytics } from '@demo/feature-analytics-lab';

import {
  analyticsWarmed,
  bootstrapDataReset,
  bootstrapMainViewReady,
  bootstrapStarted,
  marketDataConnected,
  platformContextInitialized,
  referenceDataLoaded,
  sessionLoaded,
  workspaceRestored,
} from '../app/store/bootstrapDataSlice';
import { selectBootstrapData } from '../app/store/bootstrapDataSelectors';
import type { AppStore } from '../app/store/configureAppStore';
import type { RuntimeConfig } from '../runtime';
import type { BootstrapServices } from './bootstrapServices';
import type { BootstrapTaskId } from './bootstrapTypes';

export type BootstrapOperations = {
  run(taskId: BootstrapTaskId, signal: AbortSignal): Promise<void>;
  reset(): void;
};

type CreateBootstrapOperationsInput = {
  runtimeConfig: RuntimeConfig;
  store: AppStore;
  services: BootstrapServices;
  analytics: PortfolioAnalytics;
  logger: MockLogger;
  clock: MockClock;
};

function requireOutput<T>(value: T | undefined, label: string): T {
  if (value === undefined) {
    throw new Error(`${label} is not available.`);
  }

  return value;
}

export function createBootstrapOperations({
  runtimeConfig,
  store,
  services,
  analytics,
  logger,
  clock,
}: CreateBootstrapOperationsInput): BootstrapOperations {
  async function run(taskId: BootstrapTaskId, signal: AbortSignal) {
    switch (taskId) {
      case 'runtimeConfig':
        // Runtime Configuration was already loaded and validated in main.tsx.
        return;

      case 'infrastructure':
        logger.info('Initializing demo application infrastructure.');
        store.dispatch(
          bootstrapStarted({
            startedAt: clock.now(),
            runtimeConfig: {
              analyticsStrategy: runtimeConfig.analyticsStrategy,
              contextProvider: runtimeConfig.contextProvider,
            },
          }),
        );
        return;

      case 'platformContext': {
        const context = await services.initializePlatformContext(
          runtimeConfig.contextProvider,
          signal,
        );
        store.dispatch(platformContextInitialized(context));
        return;
      }

      case 'session': {
        const session = await services.loadSession(signal);
        store.dispatch(sessionLoaded(session));
        return;
      }

      case 'referenceData': {
        const session = requireOutput(
          selectBootstrapData(store.getState()).session,
          'Demo session',
        );
        const referenceData = await services.loadReferenceData(session, signal);
        store.dispatch(
          referenceDataLoaded({
            instruments: [...referenceData.instruments],
            portfolios: [...referenceData.portfolios],
          }),
        );
        return;
      }

      case 'workspaceState': {
        const session = requireOutput(
          selectBootstrapData(store.getState()).session,
          'Demo session',
        );
        const workspace = await services.restoreWorkspace(session, signal);
        store.dispatch(workspaceRestored(workspace));
        return;
      }

      case 'mainView': {
        const data = selectBootstrapData(store.getState());
        requireOutput(data.platformContext, 'Platform context');
        requireOutput(data.referenceData, 'Reference data');
        requireOutput(data.workspace, 'Workspace state');
        store.dispatch(bootstrapMainViewReady());
        return;
      }

      case 'marketData': {
        const connection = await services.connectMarketData(signal);
        store.dispatch(marketDataConnected(connection));
        return;
      }

      case 'analyticsWarmup':
        await analytics.calculateScenario(
          {
            positionCount: 250,
            iterations: 2,
            shockPercent: 1,
          },
          { signal },
        );
        store.dispatch(
          analyticsWarmed({
            strategy: analytics.strategyName,
            completedAt: clock.now(),
          }),
        );
    }
  }

  return {
    run,
    reset() {
      store.dispatch(bootstrapDataReset());
    },
  };
}
