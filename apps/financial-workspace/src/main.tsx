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
    const resources = await loadResources(); // resources.json is loaded as unknown
    const resourceConfig = createRuntimeConfig(resources); // validating and typing resources
    const runtimeConfig = applyDemoRuntimeConfigOverride(resourceConfig); // passing runtime config to application
    const application = createApplication(runtimeConfig); // strategy parameter (just for demo)

    await application.start(); // run app initialization
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
