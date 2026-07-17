# Real Bootstrap Operations — Implementation Plan

**Status: Implemented**

## Goal

Replace the current delay-only bootstrap simulation with a small but genuine
client-side startup pipeline.

Every task should perform an observable operation. Selected task results should
be stored in Redux and displayed on `/startup`, so the presenter can show that
the graph coordinates real application initialization rather than animated
status changes.

The application remains a purely client-side JAMstack SPA. All asynchronous
operations are fake, local, and generic. No backend or real financial logic is
required.

## Original limitation

The XState graph currently models useful dependencies, parallel branches,
failure, retry, and readiness. However, its generic `runTask()` only waits and
optionally throws a synthetic error.

```text
enter task state
    → wait
    → succeed or throw
    → update diagnostic status
```

Consequently, the graph demonstrates orchestration semantics but does not
initialize meaningful application state.

## Target architecture

```text
Composition Root
    ├── creates Redux store
    ├── creates mocked bootstrap services
    ├── creates analytics Strategy
    └── creates Bootstrap Operations
             ↓ injected
       XState Bootstrap Machine
             ↓ invokes by task ID
       concrete local operation
             ├── mocked asynchronous work
             ├── dispatch result to Redux where useful
             └── resolve / reject

Redux bootstrap slice
    ↓
StartupRoute displays real task outputs
```

XState remains responsible for:

- dependency ordering;
- parallel execution;
- cancellation through `AbortSignal`;
- critical versus optional failure;
- retries;
- the Main View Ready milestone.

Bootstrap operations remain responsible for:

- calling mocked services or browser adapters;
- producing application data;
- dispatching successful results;
- keeping infrastructure details outside the machine.

## Concrete task behavior

| Task | Real local action | Redux update | Startup impact |
| --- | --- | --- | --- |
| Runtime config | Already completed by `loadResources()` and Zod before the machine is created | Store a small safe config summary when bootstrap begins | Critical, blocks Main View |
| Infrastructure | Record startup time through the injected clock and log initialization through the injected logger | `bootstrapStarted` | Critical, blocks Main View |
| Platform context | Initialize a mocked Shell/FDC3-style context adapter and obtain an initial instrument context | `platformContextInitialized` | Critical, blocks Main View |
| Demo session | Call a mocked session repository returning `USR-DEMO` and `DESK-GLOBAL` | `sessionLoaded` | Critical, blocks Main View |
| Reference data | Call a mocked repository for fake instruments and portfolio labels, using the loaded session | `referenceDataLoaded` | Critical, blocks Main View |
| Workspace state | Read a small versioned workspace preference from `localStorage`, with a safe fake default | `workspaceRestored` | Critical, blocks Main View |
| Main view | Confirm all required Redux outputs exist and record the mount milestone | `mainViewReady` | Critical mount gate |
| Market data | Perform a mocked connection handshake and return a generic connection status | `marketDataConnected` | Optional background capability |
| Analytics warmup | Run a tiny calculation through the configured `PortfolioAnalytics` Strategy, warming the Worker when selected | `analyticsWarmed` | Optional background capability |

The data remains deliberately small:

```ts
session: {
  userId: 'USR-DEMO',
  deskId: 'DESK-GLOBAL',
}

referenceData: {
  instruments: ['INST-ALPHA', 'INST-BETA', 'INST-GAMMA'],
  portfolios: ['PF-001', 'PF-002'],
}

workspace: {
  selectedPortfolioId: 'PF-001',
  layout: 'standard',
}
```

## Proposed Redux state

Add an application-owned static slice named `bootstrapData`.

```ts
type BootstrapDataState = {
  startedAt?: string;
  runtimeConfig?: {
    analyticsStrategy: 'direct' | 'worker';
    contextProvider: 'mock' | 'shell' | 'fdc3';
  };
  platformContext?: {
    provider: string;
    instrumentId: string;
  };
  session?: {
    userId: string;
    deskId: string;
  };
  referenceData?: {
    instruments: string[];
    portfolios: string[];
  };
  workspace?: {
    selectedPortfolioId: string;
    layout: string;
  };
  mainViewReady: boolean;
  marketData?: {
    status: 'connected';
    connectedAt: string;
  };
  analyticsWarmup?: {
    strategy: 'direct' | 'worker';
    completedAt: string;
  };
};
```

The slice should store task outputs, not duplicate the XState execution status.

```text
XState snapshot
    owns running / ready / failed / attempts

Redux bootstrapData
    owns session / reference data / workspace / capability results
```

This separation is an important presentation point.

## New and changed files

### App store

Create:

```text
apps/financial-workspace/src/app/store/bootstrapDataSlice.ts
apps/financial-workspace/src/app/store/bootstrapDataSelectors.ts
```

Update:

```text
apps/financial-workspace/src/app/store/createReducer.ts
```

`bootstrapData` becomes a static reducer because its results are available
before any lazy route is loaded.

### Mocked bootstrap services

Create a small app-owned boundary:

```text
apps/financial-workspace/src/bootstrap/bootstrapServices.ts
apps/financial-workspace/src/bootstrap/createMockBootstrapServices.ts
```

Suggested contract:

```ts
type BootstrapServices = {
  loadSession(signal: AbortSignal): Promise<DemoSession>;
  loadReferenceData(
    session: DemoSession,
    signal: AbortSignal,
  ): Promise<ReferenceData>;
  restoreWorkspace(
    session: DemoSession,
    signal: AbortSignal,
  ): Promise<WorkspaceState>;
  initializePlatformContext(
    signal: AbortSignal,
  ): Promise<PlatformContext>;
  connectMarketData(signal: AbortSignal): Promise<MarketDataConnection>;
};
```

The implementation may use small delays to preserve visible progress, but the
delay accompanies a returned result rather than being the entire task.

### Bootstrap operations

Create:

```text
apps/financial-workspace/src/bootstrap/createBootstrapOperations.ts
```

Suggested contract:

```ts
type BootstrapOperation = (input: {
  signal: AbortSignal;
}) => Promise<void>;

type BootstrapOperations = Partial<
  Record<BootstrapTaskId, BootstrapOperation>
>;
```

`createBootstrapOperations()` receives:

- runtime configuration;
- the Redux store;
- mocked bootstrap services;
- logger and clock;
- the configured analytics Strategy.

Each operation calls a capability and dispatches its successful result. The
operation reads prerequisites such as the loaded session through a small
selector or a captured task-result boundary.

The XState machine must not import the Redux store, browser storage, or concrete
mock implementations.

### Bootstrap machine and runtime

Update:

```text
apps/financial-workspace/src/bootstrap/createBootstrapMachine.ts
apps/financial-workspace/src/bootstrap/createBootstrapRuntime.ts
apps/financial-workspace/src/bootstrap/bootstrapTypes.ts
```

Changes:

1. Convert `bootstrapMachine` into `createBootstrapMachine(operations)`.
2. Make the generic promise actor invoke the operation associated with the
   current task ID.
3. Keep the current profile delays only to make parallelism visible.
4. Keep first-attempt synthetic failures as a thin presentation decorator.
5. Pass `AbortSignal` into every operation.
6. Preserve the existing statechart structure and retry transitions.
7. Treat Runtime Configuration as a real prerequisite already completed before
   the machine starts.

The essential executor becomes conceptually:

```ts
async function runTask({ input, signal }: RunTaskArguments) {
  await visibleDemoDelay(input, signal);
  applySyntheticFirstAttemptFailure(input);
  await operations[input.taskId]?.({ signal });
}
```

### Composition Root

Update:

```text
apps/financial-workspace/src/composition/createApplication.tsx
```

The order should remain explicit:

```text
create dependencies
→ create Redux store
→ create analytics Strategy
→ create mocked bootstrap services
→ create bootstrap operations
→ create bootstrap runtime
```

This demonstrates Dependency Injection and Composition Root together with the
Bootstrap Graph.

### Startup UI

Update:

```text
apps/financial-workspace/src/routes/StartupRoute.tsx
```

Add a compact **Bootstrap outputs in Redux** section showing:

- loaded demo user and desk;
- instrument and portfolio counts;
- restored workspace selection;
- initialized platform context;
- Main View readiness;
- optional market-data and analytics-warmup results.

The existing task cards continue to show execution state and attempts.

The audience can then compare:

```text
Task card: Reference Data — Ready, attempt 1
Redux output: 3 instruments, 2 portfolios
```

## Replay and retry behavior

The current replay control replaces the diagnostic actor while React remains
mounted. With real operations, replay will also rerun mocked initialization.

On replay:

1. Reset only the `bootstrapData` slice.
2. Start a fresh actor with the selected presentation profile.
3. Rerun the actual mocked operations.
4. Keep unrelated feature state untouched.

On retry:

- rerun only the failed task operation;
- preserve successful sibling task outputs;
- dispatch the result only after the retry succeeds.

A failed first attempt must not dispatch a successful result.

## Implementation phases

### Phase 1 — Redux output model

- Add `bootstrapDataSlice` and selectors.
- Register it as a static reducer.
- Add actions for each meaningful task result.
- Verify the initial store shape.

### Phase 2 — Real mocked services

- Add typed session, reference-data, workspace, platform-context, and
  market-data service methods.
- Implement local asynchronous mocks with abort-aware delays.
- Use only fake generic values.
- Use `localStorage` only for the small versioned workspace preference.

### Phase 3 — Bootstrap operations

- Create injected operations that call services.
- Dispatch task results into Redux.
- Warm the configured analytics Strategy with a tiny real calculation.
- Keep operations independently testable.

### Phase 4 — XState integration

- Convert the machine into a factory receiving operations.
- Invoke the correct operation by task ID.
- Preserve dependency ordering, parallelism, retries, and failure profiles.
- Ensure state exit aborts the active operation.

### Phase 5 — Composition Root wiring

- Construct services and operations in `createApplication`.
- Inject them into `createBootstrapRuntime`.
- Keep all concrete choices out of the machine.
- Ensure application cleanup stops bootstrap and owned capabilities.

### Phase 6 — Visible demo outputs

- Add the Redux output panel to `/startup`.
- Update labels so every task states the action it performs.
- Make replay reset and repopulate the output panel.
- Preserve the current critical and optional failure demos.

### Phase 7 — Documentation and verification

- Update the live demo walkthrough with exact expected outputs.
- Update the Bootstrap pattern document to distinguish task metadata,
  execution state, and Redux results.
- Extend `verify-runtime.mjs` with real-operation assertions.
- Run typecheck, runtime verification, production build, and route smoke tests.

## Verification plan

### Unit-level checks

- Session operation dispatches `USR-DEMO` and `DESK-GLOBAL`.
- Reference-data operation requires the session and dispatches fake lists.
- Workspace operation restores the stored value or the safe default.
- Platform initialization dispatches the configured provider.
- Analytics warmup calls the selected Strategy.
- Aborted operations do not dispatch success.

### Bootstrap integration checks

- Standard profile reaches Main View Ready with required Redux outputs.
- Reference data and workspace state start only after session succeeds.
- Optional operations start only after Main View Ready.
- Optional failure leaves required Redux outputs intact and reports degraded.
- Critical failure prevents Main View Ready.
- Retry runs only the failed operation and then continues the graph.
- Replay clears and repopulates only `bootstrapData`.

### Browser checks

- `/startup` visibly shows task status and corresponding Redux output.
- Slow profile makes parallel branches easy to observe.
- Optional failure keeps the mounted application usable.
- Critical diagnostic replay shows Main View Waiting until retry.
- Worker Strategy warmup creates the Worker without freezing the UI.

## Scope controls

Do not add:

- a backend;
- real network endpoints;
- authentication;
- real market data;
- polling infrastructure;
- persistence beyond one tiny local workspace preference;
- a generic graph scheduler library;
- a second global state model duplicating Redux;
- production-grade retry/backoff configuration.

The goal is a credible architecture example, not a bootstrap framework.

## Definition of done

- Every visible bootstrap task represents completed local work or a genuine
  prerequisite completed before the machine starts.
- At least session, reference data, workspace state, platform context, Main
  View readiness, market data, and analytics warmup produce observable results.
- Selected results are stored in the static Redux `bootstrapData` slice.
- `/startup` shows both XState execution status and Redux task outputs.
- Critical and optional failure profiles still work.
- Retry reruns real work.
- Replay resets and repopulates only bootstrap demo state.
- The XState machine contains orchestration, not concrete infrastructure.
- All data is fake, local, generic, and safe for presentation.
