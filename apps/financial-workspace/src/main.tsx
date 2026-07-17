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
    const resources = await loadResources(); // External JSON stays unknown at the I/O boundary.
    const resourceConfig = createRuntimeConfig(resources); // Zod validates once and returns the inferred type.
    const runtimeConfig = applyDemoRuntimeConfigOverride(
      resourceConfig,
      window.location.search,
    ); // Presentation-only Strategy switch; resources.json remains unchanged.
    const application = createApplication(runtimeConfig); // The Composition Root wires concrete implementations.

    await application.start(); // Do not mount React before critical bootstrap work is ready.
    application.mount(applicationRoot); // React receives an already-composed application (this is attaching JSX phase).
  } catch (error) {
    ReactDOM.createRoot(applicationRoot).render(
      <React.StrictMode>
        <StartupFailure error={error} />
      </React.StrictMode>,
    );
  }
}

void startApplication();
