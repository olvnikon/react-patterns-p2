import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createServer } from 'vite';
import { createActor } from 'xstate';

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const workspaceRoot = path.resolve(appRoot, '..', '..');

globalThis.window ??= globalThis;

function toViteFsPath(relativePath) {
  const absolutePath = path
    .resolve(workspaceRoot, relativePath)
    .replaceAll('\\', '/');

  return `/@fs/${absolutePath}`;
}

function waitForSnapshot(
  subscribable,
  predicate,
  label,
  timeoutMilliseconds = 5_000,
) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      reject(new Error(`Timed out waiting for ${label}.`));
    }, timeoutMilliseconds);

    function inspect() {
      const snapshot = subscribable.getSnapshot();

      if (!predicate(snapshot)) {
        return;
      }

      clearTimeout(timeout);
      unsubscribe();
      resolve(snapshot);
    }

    const subscription = subscribable.subscribe(inspect);
    const unsubscribe = () => {
      if (typeof subscription === 'function') {
        subscription();
        return;
      }

      subscription.unsubscribe();
    };

    inspect();
  });
}

const server = await createServer({
  root: appRoot,
  appType: 'custom',
  logLevel: 'error',
  server: {
    middlewareMode: true,
  },
});

try {
  const runtimeModule = await server.ssrLoadModule(
    '/src/runtime/createRuntimeConfig.ts',
  );
  const prefetchModule = await server.ssrLoadModule(
    '/src/prefetch/createPreloadRegistry.ts',
  );
  const bootstrapModule = await server.ssrLoadModule(
    '/src/bootstrap/createBootstrapRuntime.ts',
  );
  const analyticsModule = await server.ssrLoadModule(
    toViteFsPath(
      'packages/feature-analytics-lab/src/model/createPortfolioAnalytics.ts',
    ),
  );
  const workflowModule = await server.ssrLoadModule(
    toViteFsPath('packages/feature-workflow-lab/src/index.ts'),
  );
  const panelModule = await server.ssrLoadModule(
    toViteFsPath(
      'packages/feature-dynamic-panels/src/model/panelDefinitions.ts',
    ),
  );

  const runtimeConfig = runtimeModule.createRuntimeConfig({
    applicationId: 'financial-workspace-demo',
    customData: [
      { key: 'analyticsStrategy', value: 'worker' },
      { key: 'bootstrapProfile', value: 'standard' },
      { key: 'contextProvider', value: 'mock' },
      { key: 'prefetchMode', value: 'intent' },
    ],
  });

  assert.equal(runtimeConfig.analyticsStrategy, 'worker');
  assert.equal(runtimeConfig.prefetchMode, 'intent');
  assert.throws(
    () =>
      runtimeModule.createRuntimeConfig({
        applicationId: 'financial-workspace-demo',
        customData: [{ key: 'unknownKey', value: 'value' }],
      }),
    /Unsupported runtime configuration key/,
  );

  const prefetch = prefetchModule.createPreloadRegistry();
  let preloadCalls = 0;

  prefetch.register({
    id: 'demo',
    label: 'Demo module',
    load: async () => {
      preloadCalls += 1;
      return 'ready';
    },
  });

  await Promise.all([prefetch.preload('demo'), prefetch.preload('demo')]);
  assert.equal(preloadCalls, 1);
  assert.equal(prefetch.getEntry('demo')?.status, 'ready');

  let retryCalls = 0;
  prefetch.register({
    id: 'retry',
    label: 'Retryable module',
    load: async () => {
      retryCalls += 1;

      if (retryCalls === 1) {
        throw new Error('Synthetic preload failure.');
      }
    },
  });

  await assert.rejects(prefetch.preload('retry'), /Synthetic preload failure/);
  await prefetch.preload('retry');
  assert.equal(prefetch.getEntry('retry')?.attempts, 2);

  const optionalBootstrap =
    bootstrapModule.createBootstrapRuntime('optional-failure');
  optionalBootstrap.start();
  await optionalBootstrap.waitUntilMainViewReady();
  await waitForSnapshot(
    optionalBootstrap,
    (snapshot) => snapshot.status === 'degraded',
    'optional bootstrap degradation',
  );
  optionalBootstrap.retry('analyticsWarmup');
  await waitForSnapshot(
    optionalBootstrap,
    (snapshot) => snapshot.status === 'ready',
    'optional bootstrap recovery',
  );
  optionalBootstrap.stop();

  const criticalBootstrap =
    bootstrapModule.createBootstrapRuntime('critical-failure');
  criticalBootstrap.start();
  await assert.rejects(
    criticalBootstrap.waitUntilMainViewReady(),
    /Reference data failed/,
  );
  criticalBootstrap.retry('referenceData');
  await criticalBootstrap.waitUntilMainViewReady();
  criticalBootstrap.stop();

  const analytics = analyticsModule.createPortfolioAnalytics('direct');
  const scenarioInput = {
    positionCount: 2_000,
    iterations: 8,
    shockPercent: 6,
  };
  const firstResult = await analytics.calculateScenario(scenarioInput);
  const secondResult = await analytics.calculateScenario(scenarioInput);

  assert.deepEqual(firstResult, secondResult);
  assert.equal(firstResult.positionCount, scenarioInput.positionCount);
  analytics.dispose();

  const services = workflowModule.createMockOrderTicketServices();
  const orderTicketLogic = workflowModule.createOrderTicketMachine(services);
  const acceptedTicket = createActor(orderTicketLogic, {
    input: {
      ticketId: 'TICKET-VERIFY-01',
    },
  });

  acceptedTicket.start();
  acceptedTicket.send({ type: 'SUBMIT' });
  await waitForSnapshot(
    acceptedTicket,
    (snapshot) => snapshot.matches('confirming'),
    'ticket confirmation',
  );
  acceptedTicket.send({ type: 'CONFIRM' });
  await waitForSnapshot(
    acceptedTicket,
    (snapshot) => snapshot.matches('accepted'),
    'accepted ticket',
  );
  acceptedTicket.stop();

  const reconciledTicket = createActor(orderTicketLogic, {
    input: {
      ticketId: 'TICKET-VERIFY-02',
    },
  });

  reconciledTicket.start();
  reconciledTicket.send({
    type: 'OUTCOME_CHANGED',
    value: 'timeout-reconciles',
  });
  reconciledTicket.send({ type: 'SUBMIT' });
  await waitForSnapshot(
    reconciledTicket,
    (snapshot) => snapshot.matches('confirming'),
    'reconciliation ticket confirmation',
  );
  reconciledTicket.send({ type: 'CONFIRM' });
  await waitForSnapshot(
    reconciledTicket,
    (snapshot) => snapshot.matches('outcomeUnknown'),
    'outcome unknown',
  );
  reconciledTicket.send({ type: 'RECONCILE' });
  await waitForSnapshot(
    reconciledTicket,
    (snapshot) => snapshot.matches('accepted'),
    'reconciled ticket',
  );
  reconciledTicket.stop();

  const externalContextSource =
    workflowModule.createMockExternalContextSource();
  const workspaceLogic = workflowModule.createWorkflowWorkspaceMachine(
    orderTicketLogic,
    externalContextSource,
  );
  const workspace = createActor(workspaceLogic);

  workspace.start();
  assert.equal(Object.keys(workspace.getSnapshot().context.tickets).length, 3);
  workspace.send({ type: 'ticket.open' });
  assert.equal(Object.keys(workspace.getSnapshot().context.tickets).length, 4);
  workspace.send({ type: 'ticket.close', ticketId: 'TICKET-04' });
  assert.equal(Object.keys(workspace.getSnapshot().context.tickets).length, 3);
  externalContextSource.publishInstrument('INST-VERIFY');
  assert.equal(
    workspace
      .getSnapshot()
      .context.tickets['TICKET-01']
      .getSnapshot().context.draft.instrumentId,
    'INST-VERIFY',
  );
  workspace.stop();

  assert.equal(
    panelModule.panelDefinitions['activity-summary'].validate({
      userId: 'USR-DEMO',
      filter: undefined,
      mode: 'ready',
    }),
    'Activity Summary requires a query filter.',
  );
  assert.equal(
    panelModule.panelDefinitions['scenario-summary'].validate({
      portfolioId: 'PF-001',
      mode: 'degraded',
    }),
    undefined,
  );

  console.log('Runtime verification passed.');
} finally {
  await server.close();
}
