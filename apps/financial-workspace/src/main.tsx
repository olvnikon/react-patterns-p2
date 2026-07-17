import React from 'react';
import ReactDOM from 'react-dom/client';

import { createApplication } from './composition';
import {
  applyDemoRuntimeConfigOverride,
  createRuntimeConfig,
  loadResources,
} from './runtime';
import { StartupFailure } from './StartupFailure';
import './styles.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('The application root element is missing.');
}

const applicationRoot = rootElement;

async function startApplication() {
  try {
    const resources = await loadResources();
    const resourceConfig = createRuntimeConfig(resources);
    const runtimeConfig = applyDemoRuntimeConfigOverride(
      resourceConfig,
      window.location.search,
    );
    const application = createApplication(runtimeConfig);

    await application.start();
    application.mount(applicationRoot);
  } catch (error) {
    ReactDOM.createRoot(applicationRoot).render(
      <React.StrictMode>
        <StartupFailure error={error} />
      </React.StrictMode>,
    );
  }
}

void startApplication();
