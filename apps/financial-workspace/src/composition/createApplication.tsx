import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from '../app/App';
import { createAppRouter } from '../app/routes';
import {
  configureAppStore,
} from '../app/store/configureAppStore';
import { createAppDependencies } from '../app/store/appDependencies';
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

  const diagnostics: ApplicationDiagnostics = Object.freeze({
    runtimeConfig,
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
        capability: 'Reports reducer',
        implementation: 'Lazy injectReducer wiring',
        lifetime: 'route',
      },
    ]),
  });

  const router = createAppRouter({
    store,
    diagnostics,
  });

  let reactRoot: ReactDOM.Root | undefined;

  return {
    diagnostics,
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
    },
  };
}
