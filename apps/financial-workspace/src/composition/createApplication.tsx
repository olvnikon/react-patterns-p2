import React from 'react';
import ReactDOM from 'react-dom/client';
import { createPortfolioAnalytics } from '@demo/feature-analytics-lab';
import { panelDefinitions } from '@demo/feature-dynamic-panels';
import {
  createMockOrderTicketServices,
  createMockExternalContextSource,
  createOrderTicketMachine,
  createWorkflowWorkspaceMachine,
} from '@demo/feature-workflow-lab';

import { App } from '../app/App';
import { createAppRouter } from '../app/routes';
import { configureAppStore } from '../app/store/configureAppStore';
import { createAppDependencies } from '../app/store/appDependencies';
import { createBootstrapRuntime } from '../bootstrap';
import { createPreloadRegistry } from '../prefetch';
import type { RuntimeConfig } from '../runtime';
import {
  loadAnalyticsRoute,
  loadPanelsRoute,
  loadReportsRoute,
  loadWorkflowsRoute,
} from '../routes/routeModules';
import type {
  ApplicationDiagnostics,
  ApplicationRuntime,
} from './applicationTypes';

export function createApplication(
  runtimeConfig: RuntimeConfig,
): ApplicationRuntime {
  // Application-lifetime infrastructure is created in one visible place.
  const dependencies = createAppDependencies();
  const store = configureAppStore(dependencies);
  const bootstrap = createBootstrapRuntime(runtimeConfig.bootstrapProfile);
  const analytics = createPortfolioAnalytics(runtimeConfig.analyticsStrategy);

  // Feature logic receives capabilities, not concrete infrastructure imports.
  const orderTicketServices = createMockOrderTicketServices();
  const orderTicketLogic = createOrderTicketMachine(orderTicketServices);
  const externalContextSource = createMockExternalContextSource();
  const workflowWorkspaceLogic = createWorkflowWorkspaceMachine(
    orderTicketLogic,
    externalContextSource,
  );
  const prefetch = createPreloadRegistry();

  // Intent and activation share these registered loader promises.
  prefetch.register({
    id: 'route:reports',
    label: 'Reports route module',
    load: loadReportsRoute,
  });
  prefetch.register({
    id: 'route:analytics',
    label: 'Analytics route module',
    load: loadAnalyticsRoute,
  });
  prefetch.register({
    id: 'route:workflows',
    label: 'Workflows route module',
    load: loadWorkflowsRoute,
  });
  prefetch.register({
    id: 'route:panels',
    label: 'Panels route module',
    load: loadPanelsRoute,
  });

  for (const definition of Object.values(panelDefinitions)) {
    prefetch.register({
      id: definition.preloaderId,
      label: `${definition.title} module`,
      load: definition.load,
    });
  }

  // Diagnostics make otherwise invisible Composition Root wiring presentable.
  const diagnostics: ApplicationDiagnostics = {
    runtimeConfig,
    bootstrap,
    prefetch,
    wiring: [
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
        capability: 'Workflow actor workspace',
        implementation: 'XState parent + spawned ticket actors',
        lifetime: 'route',
      },
      {
        capability: 'Reports reducer',
        implementation: 'Lazy injectReducer wiring',
        lifetime: 'route',
      },
    ],
  };

  const router = createAppRouter({
    store,
    diagnostics,
    analytics,
    orderTicketLogic,
    workflowWorkspaceLogic,
    externalContextSource,
    prefetch,
    prefetchMode: runtimeConfig.prefetchMode,
  });

  let reactRoot: ReactDOM.Root | undefined;

  return {
    diagnostics,
    async start() {
      bootstrap.start();
      // This promise is the single gate before React may mount.
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
      // The Composition Root also owns application-lifetime cleanup.
      reactRoot?.unmount();
      reactRoot = undefined;
      analytics.dispose();
      bootstrap.stop();
    },
  };
}
