# Part 2 Live Demo Walkthrough

## Recommended order

The complete walkthrough takes roughly 25–35 minutes. Each section below says
exactly what to click, what should appear, and what architectural point the
interaction demonstrates.

Start with a fresh page load before presenting. This resets the route and panel
preload registry to `idle`, which makes intent prefetching visible.

## Package and ownership map

The route is the visible demonstration. The files contain the pattern.

| Ownership boundary | Patterns demonstrated | Package or directory |
| --- | --- | --- |
| Application startup | Runtime Configuration, Composition Root, Bootstrap Task Graph | [`apps/financial-workspace/src`](../../apps/financial-workspace/src) |
| Analytics capability | Strategy Pattern, Web Worker Offloading | [`packages/feature-analytics-lab`](../../packages/feature-analytics-lab) |
| Workflow capability | State Machines and Statecharts, Actor Model | [`packages/feature-workflow-lab`](../../packages/feature-workflow-lab) |
| Dynamic panel capability | Graceful Capability Degradation, panel-level intent loading | [`packages/feature-dynamic-panels`](../../packages/feature-dynamic-panels) |
| Application loading policy | Import on Interaction / Intent-Based Prefetching | [`apps/financial-workspace/src/prefetch`](../../apps/financial-workspace/src/prefetch), route loaders, and panel loaders |

The three Part 2 feature packages expose deliberate public APIs through their
`src/index.ts` files:

- [`feature-analytics-lab/src/index.ts`](../../packages/feature-analytics-lab/src/index.ts)
- [`feature-workflow-lab/src/index.ts`](../../packages/feature-workflow-lab/src/index.ts)
- [`feature-dynamic-panels/src/index.ts`](../../packages/feature-dynamic-panels/src/index.ts)

Routes import package roots while each package keeps implementation details
private.

## Quick pattern-to-source map

| Pattern or practice | Route | Open first | Supporting files |
| --- | --- | --- | --- |
| Runtime Configuration | `/startup` | [`resources.json`](../../apps/financial-workspace/public/resources.json), [`runtimeConfig.ts`](../../apps/financial-workspace/src/runtime/runtimeConfig.ts) | [`createRuntimeConfig.ts`](../../apps/financial-workspace/src/runtime/createRuntimeConfig.ts), [`loadResources.ts`](../../apps/financial-workspace/src/runtime/loadResources.ts), [`applyDemoRuntimeConfigOverride.ts`](../../apps/financial-workspace/src/runtime/applyDemoRuntimeConfigOverride.ts), [`main.tsx`](../../apps/financial-workspace/src/main.tsx) |
| Composition Root | `/startup` | [`createApplication.tsx`](../../apps/financial-workspace/src/composition/createApplication.tsx) | [`applicationTypes.ts`](../../apps/financial-workspace/src/composition/applicationTypes.ts), [`main.tsx`](../../apps/financial-workspace/src/main.tsx) |
| Strategy Pattern | `/analytics` | [`analyticsTypes.ts`](../../packages/feature-analytics-lab/src/model/analyticsTypes.ts), [`createPortfolioAnalytics.ts`](../../packages/feature-analytics-lab/src/model/createPortfolioAnalytics.ts) | [`directAnalyticsStrategy.ts`](../../packages/feature-analytics-lab/src/model/directAnalyticsStrategy.ts), [`workerAnalyticsStrategy.ts`](../../packages/feature-analytics-lab/src/model/workerAnalyticsStrategy.ts) |
| State Machines and Statecharts | `/workflows` | [`createOrderTicketMachine.ts`](../../packages/feature-workflow-lab/src/model/createOrderTicketMachine.ts) | [`createMockOrderTicketServices.ts`](../../packages/feature-workflow-lab/src/model/createMockOrderTicketServices.ts), [`useOrderTicket.ts`](../../packages/feature-workflow-lab/src/react/useOrderTicket.ts), [`OrderTicketEntry.tsx`](../../packages/feature-workflow-lab/src/OrderTicketEntry.tsx) |
| Actor Model | `/workflows` | [`createWorkflowWorkspaceMachine.ts`](../../packages/feature-workflow-lab/src/model/createWorkflowWorkspaceMachine.ts) | [`externalContextSource.ts`](../../packages/feature-workflow-lab/src/model/externalContextSource.ts), [`WorkflowWorkspaceEntry.tsx`](../../packages/feature-workflow-lab/src/WorkflowWorkspaceEntry.tsx) |
| Declarative Bootstrap Task Graph | `/startup` | [`bootstrapTasks.ts`](../../apps/financial-workspace/src/bootstrap/bootstrapTasks.ts), [`createBootstrapMachine.ts`](../../apps/financial-workspace/src/bootstrap/createBootstrapMachine.ts) | [`createBootstrapRuntime.ts`](../../apps/financial-workspace/src/bootstrap/createBootstrapRuntime.ts), [`StartupRoute.tsx`](../../apps/financial-workspace/src/routes/StartupRoute.tsx) |
| Web Worker Offloading | `/analytics` | [`createWorkerScenarioClient.ts`](../../packages/feature-analytics-lab/src/worker/createWorkerScenarioClient.ts), [`scenario.worker.ts`](../../packages/feature-analytics-lab/src/worker/scenario.worker.ts) | [`workerProtocol.ts`](../../packages/feature-analytics-lab/src/worker/workerProtocol.ts), [`calculateScenario.ts`](../../packages/feature-analytics-lab/src/model/calculateScenario.ts), [`AnalyticsEntry.tsx`](../../packages/feature-analytics-lab/src/AnalyticsEntry.tsx) |
| Intent-Based Prefetching | Navigation, `/startup`, `/panels` | [`createPreloadRegistry.ts`](../../apps/financial-workspace/src/prefetch/createPreloadRegistry.ts), [`createIntentHandlers.ts`](../../apps/financial-workspace/src/prefetch/createIntentHandlers.ts) | [`routeModules.ts`](../../apps/financial-workspace/src/routes/routeModules.ts), [`routes.tsx`](../../apps/financial-workspace/src/app/routes.tsx), [`panelLoaders.ts`](../../packages/feature-dynamic-panels/src/model/panelLoaders.ts) |
| Graceful Capability Degradation | `/panels` | [`DynamicPanelHost.tsx`](../../packages/feature-dynamic-panels/src/internal/DynamicPanelHost.tsx), [`PanelErrorBoundary.tsx`](../../packages/feature-dynamic-panels/src/internal/PanelErrorBoundary.tsx) | [`panelDefinitions.ts`](../../packages/feature-dynamic-panels/src/model/panelDefinitions.ts), [`DynamicPanelsEntry.tsx`](../../packages/feature-dynamic-panels/src/DynamicPanelsEntry.tsx), [`panels/`](../../packages/feature-dynamic-panels/src/panels) |

## 1. Introduce construction and bootstrap

### On the website

1. Click **Map** under **Part 2**. Use the nine cards to introduce the scope.
2. Click **Startup**.
3. In **Validated configuration**, point out the values loaded from
   `resources.json`: Worker analytics, standard bootstrap, mock context, and
   intent prefetching.
4. In **Composition diagnostics**, point out that concrete implementations and
   their lifetimes are listed in one place. For example,
   `PortfolioAnalytics` is wired to `WorkerAnalyticsStrategy`.

No button changes Runtime Configuration in place. This is intentional:
configuration is read before the application is created. The Strategy demo
later performs a full application restart to select another configuration.

### Demonstrate the Bootstrap Task Graph

1. Under **Replay profile**, click **Slow**.
2. Watch **Infrastructure** and **Platform context** enter `Running` together.
   This demonstrates independent branches executing in parallel.
3. Watch **Demo session** wait for Infrastructure, then **Reference data** and
   **Workspace state** run together.
4. Point out that **Market data** and **Analytics warmup** remain idle until
   **Main view** becomes ready. They are optional background tasks.
5. Click **Optional failure** and wait for **Analytics warmup** to show
   `Failed`. The overall graph becomes `Degraded`, but the note still says
   **Main View Ready**.
6. On the failed **Analytics warmup** card, click **Retry task**. The second
   attempt succeeds and the graph becomes `Ready`.

Optional critical-failure comparison:

1. Click **Critical failure**.
2. Wait for **Reference data** to fail. The graph shows `Failed` and
   **Main View Waiting** because the dependent Main view cannot run.
3. Click **Retry task** on **Reference data**. The second attempt succeeds;
   Workspace state and Platform context are reused, Main view runs, and the
   optional tasks start afterward.

The replay controls operate on an isolated diagnostic actor, so a critical
demo failure does not unmount the presentation UI.

### Open these files

1. [`public/resources.json`](../../apps/financial-workspace/public/resources.json)
2. [`runtime/runtimeConfig.ts`](../../apps/financial-workspace/src/runtime/runtimeConfig.ts)
3. [`runtime/createRuntimeConfig.ts`](../../apps/financial-workspace/src/runtime/createRuntimeConfig.ts)
4. [`runtime/applyDemoRuntimeConfigOverride.ts`](../../apps/financial-workspace/src/runtime/applyDemoRuntimeConfigOverride.ts)
5. [`composition/createApplication.tsx`](../../apps/financial-workspace/src/composition/createApplication.tsx)
6. [`bootstrap/bootstrapTasks.ts`](../../apps/financial-workspace/src/bootstrap/bootstrapTasks.ts)
7. [`bootstrap/createBootstrapMachine.ts`](../../apps/financial-workspace/src/bootstrap/createBootstrapMachine.ts)

Explain:

> Runtime Configuration describes serializable choices. The Composition Root
> creates live objects. The Bootstrap Graph controls when those objects become
> ready.

## 2. Demonstrate route intent prefetching before visiting lazy routes

Do this before opening Analytics or Workflows. Otherwise those route modules
are already cached and the transition is no longer visible.

### On the website

1. Stay on **Startup** and scroll to **Load likely routes before activation**.
2. Find **Analytics route module** and confirm its status is `Idle`.
3. Move the pointer over **Analytics** in the top navigation, but do not click.
   Keyboard alternative: press Tab until the Analytics link receives focus.
4. Watch the small navigation indicator and the diagnostic card change from
   `Idle` to `Loading` to `Ready`. The route has not changed.
5. Now click **Analytics**. Activation reuses the cached module instead of
   starting a second import.

If the module was already loaded during rehearsal, refresh the page, return
directly to `/startup`, and repeat with another idle lazy route such as
**Workflows**, **Panels**, or **Reports**.

### Open these files

1. [`prefetch/createPreloadRegistry.ts`](../../apps/financial-workspace/src/prefetch/createPreloadRegistry.ts)
2. [`prefetch/createIntentHandlers.ts`](../../apps/financial-workspace/src/prefetch/createIntentHandlers.ts)
3. [`routes/routeModules.ts`](../../apps/financial-workspace/src/routes/routeModules.ts)
4. [`app/routes.tsx`](../../apps/financial-workspace/src/app/routes.tsx)

Explain:

> Lazy loading removes code from the initial bundle. Intent prefetching starts
> the same cached import when likely intent appears, reducing the wait after
> activation. Clicking without prior intent still works.

## 3. Compare Strategy and Web Worker execution

The default `resources.json` selects the **Worker Strategy**.

### Worker Strategy

1. On **Analytics**, verify the status chip says **Worker Strategy**.
2. Set **Fake positions** to **125,000**.
3. Set **Calculation intensity** to **Heavy**.
4. Click **Run calculation**.
5. While progress advances, watch **Tick** in the Main-thread heartbeat. It
   continues increasing because calculation chunks execute in a Worker.
6. While the calculation is still running, click **Cancel**. The result area
   reports `cancelled` and says that no stale result was applied.
7. Click **Run calculation** again and let it complete. Point out that the
   output contract is the same regardless of Strategy.

### Direct Strategy

1. Click **Direct** under **Restart demo with**. This sets the presentation-only
   `?demoAnalyticsStrategy=direct` override and performs a full application
   restart. The application still loads its one `resources.json`.
2. Verify the chip now says **Direct Strategy**.
3. Again choose **125,000** and **Heavy**, then click **Run calculation**.
4. Observe that the heartbeat pauses while the synchronous calculation owns
   the main thread. Progress also cannot paint incrementally during that work.
5. Click **Worker** to restart with the default Worker configuration before
   continuing the presentation.

The Direct and Worker buttons deliberately restart the app instead of mutating
the Strategy in React. Runtime Configuration selects the Strategy, and the
Composition Root constructs it once. The query override is demo scaffolding,
not a second resource document or a recommended production configuration
source.

### Open these files

1. [`model/analyticsTypes.ts`](../../packages/feature-analytics-lab/src/model/analyticsTypes.ts)
2. [`model/createPortfolioAnalytics.ts`](../../packages/feature-analytics-lab/src/model/createPortfolioAnalytics.ts)
3. [`model/directAnalyticsStrategy.ts`](../../packages/feature-analytics-lab/src/model/directAnalyticsStrategy.ts)
4. [`model/workerAnalyticsStrategy.ts`](../../packages/feature-analytics-lab/src/model/workerAnalyticsStrategy.ts)
5. [`worker/createWorkerScenarioClient.ts`](../../packages/feature-analytics-lab/src/worker/createWorkerScenarioClient.ts)
6. [`worker/scenario.worker.ts`](../../packages/feature-analytics-lab/src/worker/scenario.worker.ts)

Explain:

> Strategy chooses interchangeable behavior. Web Worker Offloading changes
> where one Strategy executes CPU-heavy work.

## 4. Run one explicit Statechart workflow

### Accepted happy path

1. Click **Workflows** in the top navigation.
2. Keep **One Statechart** selected.
3. Leave **Demo outcome** as **Accepted**.
4. Click **Review order**. The active state changes from `editing` to
   `checking` while the fake asynchronous check runs.
5. Wait until the state becomes `confirming`. The **Confirm** and **Edit**
   buttons now appear because those events are legal only in this state.
6. Click **Confirm**. The state becomes `submitting`, then `accepted`, and an
   `ORD-...` receipt appears.
7. Click **Create another order** to return to `editing` with a new
   idempotency key.

### Timeout followed by successful reconciliation

1. Set **Demo outcome** to **Timeout, then reconciles**.
2. Click **Review order**, wait for `confirming`, then click **Confirm**.
3. After roughly 800 ms, the client stops waiting and enters
   `outcomeUnknown`. The backend simulation has committed the order, but the
   browser did not receive the submission response in time.
4. Click **Reconcile outcome**. The state enters `reconciling`, looks up the
   stable idempotency key, and then becomes `accepted`.
5. Click **Create another order**.

### Timeout followed by a not-found result

1. Set **Demo outcome** to **Timeout, result not found**.
2. Click **Review order**, wait, click **Confirm**, wait for
   `outcomeUnknown`, and click **Reconcile outcome**.
3. Reconciliation finds no committed order, so the workflow becomes `failed`
   with an explicit message.
4. Click **Return to draft**. The workflow returns to `editing`; React does not
   manually repair several loading and error booleans.

Optional shorter branches:

- Choose **Blocked by demo check** and click **Review order**. The check moves
  directly to `blocked`; click **Edit draft** to recover.
- Choose **Definite failure**, review, and confirm. Submission enters `failed`
  directly because this is a known rejection rather than an unknown outcome.

### Open these files

1. [`model/createOrderTicketMachine.ts`](../../packages/feature-workflow-lab/src/model/createOrderTicketMachine.ts)
2. [`model/createMockOrderTicketServices.ts`](../../packages/feature-workflow-lab/src/model/createMockOrderTicketServices.ts)
3. [`react/useOrderTicket.ts`](../../packages/feature-workflow-lab/src/react/useOrderTicket.ts)
4. [`OrderTicketEntry.tsx`](../../packages/feature-workflow-lab/src/OrderTicketEntry.tsx)

Explain:

> A timeout describes the browser's knowledge, not the final business outcome.
> The machine owns checks, legal transitions, timeouts, and reconciliation;
> React renders a projection and sends events.

All behavior and data remain fake and local.

## 5. Run several Actor instances

### Target a single actor and broadcast to all actors

1. On **Workflows**, click **Actor Workspace**.
2. Point out the three initial tabs: `TICKET-01`, `TICKET-02`, and
   `TICKET-03`. Each is a running instance of the same order-ticket logic.
3. Select the **TICKET-02** tab. Its instrument starts as `INST-BETA`.
4. Click **Publish external INST-GAMMA**. Only the selected ticket changes to
   `INST-GAMMA`, and the **Workspace mailbox facts** list records that the
   adapter routed the message.
5. Click **Send SELL to all**. Select each tab briefly and confirm its Side is
   now Sell. One parent command targeted every known child actor reference.

### Show independent states at the same time

1. Select **TICKET-01**, leave its outcome as **Accepted**, and click
   **Review**. Wait until its tab says `confirming`; do not confirm yet.
2. Select **TICKET-02**, choose **Blocked**, and click **Review**. Wait until
   its tab says `blocked`.
3. Point at the tabs: TICKET-01 is `confirming`, TICKET-02 is `blocked`, and
   TICKET-03 remains `editing`. They share logic but not state.
4. Return to **TICKET-01** and click **Confirm**. When it becomes `accepted`,
   the parent mailbox records an accepted fact with the generated order ID.

### Show dynamic lifecycle ownership

1. Click **Spawn ticket**. A new selected `TICKET-04` tab appears and the actor
   count increases.
2. Click the **×** button on the TICKET-04 tab. The tab disappears and the
   mailbox records `Stopped TICKET-04`; the parent stopped the child actor and
   removed its reference.

### Open these files

1. [`model/createWorkflowWorkspaceMachine.ts`](../../packages/feature-workflow-lab/src/model/createWorkflowWorkspaceMachine.ts)
2. [`model/externalContextSource.ts`](../../packages/feature-workflow-lab/src/model/externalContextSource.ts)
3. [`WorkflowWorkspaceEntry.tsx`](../../packages/feature-workflow-lab/src/WorkflowWorkspaceEntry.tsx)

Explain:

> The statechart defines behavior. Actors run independent instances, own
> private state and lifecycle, and communicate through messages. These actors
> model logical concurrency on the main thread; they are not Web Workers.

## 6. Demonstrate panel-level intent loading and graceful degradation

### Load panels on intent

1. Click **Panels** in the top navigation.
2. The workspace initially contains only **Portfolio Overview**.
3. Find the **Activity Summary** catalogue card. Before clicking, point out its
   `Idle` status.
4. Hover the card, or focus its **Add panel** button with the keyboard. Watch
   the module status change from `Idle` to `Loading` to `Ready`.
5. Click **Add panel**. The host reuses the loaded module, passes its config,
   validates the config, and the panel runs its own 650 ms fake query.
6. Repeat with **Scenario Summary**, then click **Add panel**. You now have
   three independently hosted sibling panels.

### Stale data remains visible but honest

1. On the Activity Summary instance, set **Activity mode** to
   **Stale cached data**.
2. Wait for its query. The panel keeps the list visible, labels it `Stale`, and
   shows a last-updated timestamp.
3. Point out that sibling panels do not rerender into an error state.

### Retry a local query failure

1. Change **Activity mode** to **Fail first query**.
2. Wait until only Activity Summary displays `Failed`.
3. Click **Retry query** inside that panel. Attempt two succeeds and the panel
   becomes `Ready`; the other panels were usable throughout.

### Validate configuration before running a panel

1. Click **Break config** above Activity Summary. The host displays
   `Activity Summary requires a query filter` before the panel can issue its
   query.
2. Clicking **Retry validation** alone cannot repair invalid input. Click
   **Restore config** to supply the required filter and recover the panel.

### Distinguish degraded, disabled, and failed

1. On Scenario Summary, set **Scenario mode** to **Degraded**. A safe summary
   remains visible, but **Open scenario details** is disabled.
2. Click **Disable**. The panel shows `Disabled` as intentional configuration,
   not as a failure. Click **Enable** to restore it.
3. Set **Scenario mode** to **Render failure**. The local Error Boundary keeps
   the panel frame and shows **Retry** and **Remove**; Portfolio and Activity
   remain usable.
4. Clicking **Retry** repeats the deterministic failure because its cause has
   not changed. Change **Scenario mode** back to **Ready** to repair the cause
   and reset the boundary, or click **Remove** to close that capability.

### Open these files

1. [`model/panelDefinitions.ts`](../../packages/feature-dynamic-panels/src/model/panelDefinitions.ts)
2. [`internal/DynamicPanelHost.tsx`](../../packages/feature-dynamic-panels/src/internal/DynamicPanelHost.tsx)
3. [`internal/PanelErrorBoundary.tsx`](../../packages/feature-dynamic-panels/src/internal/PanelErrorBoundary.tsx)
4. [`panels/ActivitySummaryPanel.tsx`](../../packages/feature-dynamic-panels/src/panels/ActivitySummaryPanel.tsx)
5. [`panels/ScenarioSummaryPanel.tsx`](../../packages/feature-dynamic-panels/src/panels/ScenarioSummaryPanel.tsx)
6. [`model/panelLoaders.ts`](../../packages/feature-dynamic-panels/src/model/panelLoaders.ts)

Explain:

> Suspense owns loading, the Error Boundary catches rendering failure, and the
> capability policy decides what safe UI remains. Failed, stale, degraded, and
> intentionally disabled are different states.

Critical startup dependencies are different: they block the higher-level Main
View milestone instead of degrading one optional panel.

## Closing pattern map

```text
Runtime Configuration chooses
Composition Root wires
Strategy varies
Statecharts constrain
Actors coordinate
Bootstrap Graph schedules
Workers offload
Intent Prefetching anticipates
Graceful Degradation contains
```

## Minimal code-tour version

If presentation time is tight, open these files in this order:

1. [`runtimeConfig.ts`](../../apps/financial-workspace/src/runtime/runtimeConfig.ts) and [`createRuntimeConfig.ts`](../../apps/financial-workspace/src/runtime/createRuntimeConfig.ts)
2. [`createApplication.tsx`](../../apps/financial-workspace/src/composition/createApplication.tsx)
3. [`createPortfolioAnalytics.ts`](../../packages/feature-analytics-lab/src/model/createPortfolioAnalytics.ts)
4. [`createOrderTicketMachine.ts`](../../packages/feature-workflow-lab/src/model/createOrderTicketMachine.ts)
5. [`createWorkflowWorkspaceMachine.ts`](../../packages/feature-workflow-lab/src/model/createWorkflowWorkspaceMachine.ts)
6. [`createBootstrapMachine.ts`](../../apps/financial-workspace/src/bootstrap/createBootstrapMachine.ts)
7. [`createWorkerScenarioClient.ts`](../../packages/feature-analytics-lab/src/worker/createWorkerScenarioClient.ts)
8. [`createPreloadRegistry.ts`](../../apps/financial-workspace/src/prefetch/createPreloadRegistry.ts)
9. [`DynamicPanelHost.tsx`](../../packages/feature-dynamic-panels/src/internal/DynamicPanelHost.tsx)
