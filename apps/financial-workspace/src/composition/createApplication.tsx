import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createPortfolioAnalytics,
} from '@demo/feature-analytics-lab';
import {
  createMockOrderTicketServices,
  createOrderTicketMachine,
} from '@demo/feature-workflow-lab';

import { App } from '../app/App';
import { createAppRouter } from '../app/routes';
import {
  configureAppStore,
} from '../app/store/configureAppStore';
import { createAppDependencies } from '../app/store/appDependencies';
import { createBootstrapRuntime } from '../bootstrap';
import type { RuntimeConfig } from '../runtime';
import type {
  ApplicationDiagnostics,
  ApplicationRuntime,
} from './applicationTypes';

export function createApplication(
  runtimeConfig: RuntimeConfig,
): ApplicationRuntime {
  const dependencies = createAppDependencies();
  const store = configureAppStore(dependencies);
  const bootstrap = createBootstrapRuntime(runtimeConfig.bootstrapProfile);
  const analytics = createPortfolioAnalytics(runtimeConfig.analyticsStrategy);
  const orderTicketServices = createMockOrderTicketServices();
  const orderTicketLogic = createOrderTicketMachine(orderTicketServices);

  const diagnostics: ApplicationDiagnostics = Object.freeze({
    runtimeConfig,
    bootstrap,
    wiring: Object.freeze([
      {
        capability: 'Order approval repository',
        implementation: 'MockOrderApprovalRepository',
        lifetime: 'application',
      },
      {
        capability: 'Logger',
        implementation: 'MockLogger',
        lifetime: 'application',
      },
      {
        capability: 'Clock',
        implementation: 'MockClock',
        lifetime: 'application',
      },
      {
        capability: 'State store',
        implementation: 'Redux Toolkit + redux-observable',
        lifetime: 'application',
      },
      {
        capability: 'Portfolio analytics',
        implementation:
          analytics.strategyName === 'worker'
            ? 'WorkerAnalyticsStrategy'
            : 'DirectAnalyticsStrategy',
        lifetime: 'application',
      },
      {
        capability: 'Order ticket workflow',
        implementation: 'XState orderTicket machine',
        lifetime: 'feature',
      },
      {
        capability: 'Reports reducer',
        implementation: 'Lazy injectReducer wiring',
        lifetime: 'route',
      },
    ]),
  });

  const router = createAppRouter({
    store,
    diagnostics,
    analytics,
    orderTicketLogic,
  });

  let reactRoot: ReactDOM.Root | undefined;

  return {
    diagnostics,
    async start() {
      bootstrap.start();
      await bootstrap.waitUntilMainViewReady();
    },
    mount(rootElement) {
      if (reactRoot) {
        return;
      }

      reactRoot = ReactDOM.createRoot(rootElement);
      reactRoot.render(
        <React.StrictMode>
          <App store={store} router={router} />
        </React.StrictMode>,
      );
    },
    stop() {
      reactRoot?.unmount();
      reactRoot = undefined;
      analytics.dispose();
      bootstrap.stop();
    },
  };
}
