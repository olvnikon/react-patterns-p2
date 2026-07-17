# Part 2 Live Demo Walkthrough

## Recommended order

The full walkthrough should take roughly 20–30 minutes. Each stop should explain one primary distinction rather than every implementation detail.

## Package and ownership map

The route is the visible demonstration. The files below contain the actual
pattern.

| Ownership boundary | Patterns demonstrated | Package or directory |
| --- | --- | --- |
| Application startup | Runtime Configuration, Composition Root, Bootstrap Task Graph | [`apps/financial-workspace/src`](../../apps/financial-workspace/src) |
| Analytics capability | Strategy Pattern, Web Worker Offloading | [`packages/feature-analytics-lab`](../../packages/feature-analytics-lab) |
| Workflow capability | State Machines and Statecharts, Actor Model | [`packages/feature-workflow-lab`](../../packages/feature-workflow-lab) |
| Dynamic panel capability | Graceful Capability Degradation, panel-level intent loading | [`packages/feature-dynamic-panels`](../../packages/feature-dynamic-panels) |
| Application loading policy | Import on Interaction / Intent-Based Prefetching | [`apps/financial-workspace/src/prefetch`](../../apps/financial-workspace/src/prefetch), route loaders, and panel loaders |

The three feature packages expose deliberate public APIs through their
`src/index.ts` files:

- [`feature-analytics-lab/src/index.ts`](../../packages/feature-analytics-lab/src/index.ts)
- [`feature-workflow-lab/src/index.ts`](../../packages/feature-workflow-lab/src/index.ts)
- [`feature-dynamic-panels/src/index.ts`](../../packages/feature-dynamic-panels/src/index.ts)

This is worth showing briefly: routes import package roots, while each package
keeps its implementation details private.

## Quick pattern-to-source map

| Pattern or practice | Route | Open first | Supporting files |
| --- | --- | --- | --- |
| Runtime Configuration | `/startup` | [`resources.json`](../../apps/financial-workspace/public/resources.json), [`runtimeConfig.ts`](../../apps/financial-workspace/src/runtime/runtimeConfig.ts) | [`createRuntimeConfig.ts`](../../apps/financial-workspace/src/runtime/createRuntimeConfig.ts), [`loadResources.ts`](../../apps/financial-workspace/src/runtime/loadResources.ts), [`main.tsx`](../../apps/financial-workspace/src/main.tsx) |
| Composition Root | `/startup` | [`createApplication.tsx`](../../apps/financial-workspace/src/composition/createApplication.tsx) | [`applicationTypes.ts`](../../apps/financial-workspace/src/composition/applicationTypes.ts), [`main.tsx`](../../apps/financial-workspace/src/main.tsx) |
| Strategy Pattern | `/analytics` | [`analyticsTypes.ts`](../../packages/feature-analytics-lab/src/model/analyticsTypes.ts), [`createPortfolioAnalytics.ts`](../../packages/feature-analytics-lab/src/model/createPortfolioAnalytics.ts) | [`directAnalyticsStrategy.ts`](../../packages/feature-analytics-lab/src/model/directAnalyticsStrategy.ts), [`workerAnalyticsStrategy.ts`](../../packages/feature-analytics-lab/src/model/workerAnalyticsStrategy.ts) |
| State Machines and Statecharts | `/workflows` | [`createOrderTicketMachine.ts`](../../packages/feature-workflow-lab/src/model/createOrderTicketMachine.ts) | [`createMockOrderTicketServices.ts`](../../packages/feature-workflow-lab/src/model/createMockOrderTicketServices.ts), [`useOrderTicket.ts`](../../packages/feature-workflow-lab/src/react/useOrderTicket.ts), [`OrderTicketEntry.tsx`](../../packages/feature-workflow-lab/src/OrderTicketEntry.tsx) |
| Actor Model | `/workflows` | [`createWorkflowWorkspaceMachine.ts`](../../packages/feature-workflow-lab/src/model/createWorkflowWorkspaceMachine.ts) | [`externalContextSource.ts`](../../packages/feature-workflow-lab/src/model/externalContextSource.ts), [`WorkflowWorkspaceEntry.tsx`](../../packages/feature-workflow-lab/src/WorkflowWorkspaceEntry.tsx) |
| Declarative Bootstrap Task Graph | `/startup` | [`bootstrapTasks.ts`](../../apps/financial-workspace/src/bootstrap/bootstrapTasks.ts), [`createBootstrapMachine.ts`](../../apps/financial-workspace/src/bootstrap/createBootstrapMachine.ts) | [`createBootstrapRuntime.ts`](../../apps/financial-workspace/src/bootstrap/createBootstrapRuntime.ts), [`StartupRoute.tsx`](../../apps/financial-workspace/src/routes/StartupRoute.tsx) |
| Web Worker Offloading | `/analytics` | [`createWorkerScenarioClient.ts`](../../packages/feature-analytics-lab/src/worker/createWorkerScenarioClient.ts), [`scenario.worker.ts`](../../packages/feature-analytics-lab/src/worker/scenario.worker.ts) | [`workerProtocol.ts`](../../packages/feature-analytics-lab/src/worker/workerProtocol.ts), [`calculateScenario.ts`](../../packages/feature-analytics-lab/src/model/calculateScenario.ts), [`AnalyticsEntry.tsx`](../../packages/feature-analytics-lab/src/AnalyticsEntry.tsx) |
| Intent-Based Prefetching | Navigation, `/startup`, `/panels` | [`createPreloadRegistry.ts`](../../apps/financial-workspace/src/prefetch/createPreloadRegistry.ts), [`createIntentHandlers.ts`](../../apps/financial-workspace/src/prefetch/createIntentHandlers.ts) | [`routeModules.ts`](../../apps/financial-workspace/src/routes/routeModules.ts), [`routes.tsx`](../../apps/financial-workspace/src/app/routes.tsx), [`panelLoaders.ts`](../../packages/feature-dynamic-panels/src/model/panelLoaders.ts) |
| Graceful Capability Degradation | `/panels` | [`DynamicPanelHost.tsx`](../../packages/feature-dynamic-panels/src/internal/DynamicPanelHost.tsx), [`PanelErrorBoundary.tsx`](../../packages/feature-dynamic-panels/src/internal/PanelErrorBoundary.tsx) | [`panelDefinitions.ts`](../../packages/feature-dynamic-panels/src/model/panelDefinitions.ts), [`DynamicPanelsEntry.tsx`](../../packages/feature-dynamic-panels/src/DynamicPanelsEntry.tsx), [`panels/`](../../packages/feature-dynamic-panels/src/panels) |

## 1. Start the application

Open `/architecture`, introduce the nine responsibilities, and then continue to
`/startup`.

Open these files:

1. [`public/resources.json`](../../apps/financial-workspace/public/resources.json)
2. [`runtime/runtimeConfig.ts`](../../apps/financial-workspace/src/runtime/runtimeConfig.ts)
3. [`runtime/createRuntimeConfig.ts`](../../apps/financial-workspace/src/runtime/createRuntimeConfig.ts)
4. [`composition/createApplication.tsx`](../../apps/financial-workspace/src/composition/createApplication.tsx)
5. [`bootstrap/bootstrapTasks.ts`](../../apps/financial-workspace/src/bootstrap/bootstrapTasks.ts)
6. [`bootstrap/createBootstrapMachine.ts`](../../apps/financial-workspace/src/bootstrap/createBootstrapMachine.ts)

Show:

- values loaded from `resources.json`;
- Zod schemas as the source of truth, with public types derived through
  `z.infer`;
- `createRuntimeConfig` turning unknown JSON into a typed immutable config;
- bootstrap tasks running in parallel;
- the Main View Ready marker;
- Composition Root diagnostics.

Say:

> Configuration describes choices. The Composition Root turns those choices into application objects.

Trigger one optional bootstrap failure and retry it. If demonstrating a critical failure, use an isolated restart control rather than breaking the current presentation session.

## 2. Compare analytics strategies

Open `/analytics`.

Package:

```text
@demo/feature-analytics-lab
```

Open these files:

1. [`model/analyticsTypes.ts`](../../packages/feature-analytics-lab/src/model/analyticsTypes.ts) — stable capability contract.
2. [`model/createPortfolioAnalytics.ts`](../../packages/feature-analytics-lab/src/model/createPortfolioAnalytics.ts) — Strategy selection.
3. [`model/directAnalyticsStrategy.ts`](../../packages/feature-analytics-lab/src/model/directAnalyticsStrategy.ts) and [`model/workerAnalyticsStrategy.ts`](../../packages/feature-analytics-lab/src/model/workerAnalyticsStrategy.ts) — interchangeable implementations.
4. [`worker/createWorkerScenarioClient.ts`](../../packages/feature-analytics-lab/src/worker/createWorkerScenarioClient.ts) and [`worker/scenario.worker.ts`](../../packages/feature-analytics-lab/src/worker/scenario.worker.ts) — off-thread implementation.

Show:

- the stable `PortfolioAnalytics` capability;
- the selected Direct or Worker implementation;
- the same fake input and result shape;
- a responsiveness indicator while the Worker calculation runs.
- the application restart that changes `resources.json` profile and causes the
  Composition Root to select the other Strategy.

Say:

> Strategy chooses the implementation. The Worker changes the execution thread.

Cancel one calculation and start a new one to show stale-result protection.

## 3. Run one explicit workflow

Open `/workflows` in single-ticket mode.

Package:

```text
@demo/feature-workflow-lab
```

Open these files:

1. [`model/createOrderTicketMachine.ts`](../../packages/feature-workflow-lab/src/model/createOrderTicketMachine.ts) — states, guards, invoked actors, timeout, and reconciliation.
2. [`model/createMockOrderTicketServices.ts`](../../packages/feature-workflow-lab/src/model/createMockOrderTicketServices.ts) — fake async boundary.
3. [`react/useOrderTicket.ts`](../../packages/feature-workflow-lab/src/react/useOrderTicket.ts) — React adapter.
4. [`OrderTicketEntry.tsx`](../../packages/feature-workflow-lab/src/OrderTicketEntry.tsx) — rendering and event sending.

Move through:

```text
editing
→ checking
→ confirming
→ submitting
→ accepted
```

Then demonstrate:

```text
submitting
→ outcome unknown
→ reconciling
→ accepted or failed
```

Say:

> A timeout describes the browser's knowledge, not necessarily the final business outcome.

All behavior remains fake and local.

## 4. Run several actors

Switch `/workflows` to multi-ticket mode.

Keep the same package open, then show:

1. [`model/createWorkflowWorkspaceMachine.ts`](../../packages/feature-workflow-lab/src/model/createWorkflowWorkspaceMachine.ts) — spawn, stop, targeted messages, broadcast commands, and child facts.
2. [`model/externalContextSource.ts`](../../packages/feature-workflow-lab/src/model/externalContextSource.ts) — external event adapter boundary.
3. [`WorkflowWorkspaceEntry.tsx`](../../packages/feature-workflow-lab/src/WorkflowWorkspaceEntry.tsx) — fine-grained actor rendering.

Show:

- three independent ticket actors;
- different states at the same time;
- a targeted external instrument message;
- a workspace-wide BUY or SELL command;
- an accepted child reporting a fact to the parent mailbox;
- closing a ticket and stopping its actor.

Say:

> The statechart defines behavior. Actors run independent instances of that behavior.

Point out that these actors normally execute on the main browser thread.

## 5. Demonstrate intent prefetching

Return to navigation or the panel catalogue.

Open these files:

1. [`prefetch/createPreloadRegistry.ts`](../../apps/financial-workspace/src/prefetch/createPreloadRegistry.ts) — promise cache, deduplication, status, and retry.
2. [`prefetch/createIntentHandlers.ts`](../../apps/financial-workspace/src/prefetch/createIntentHandlers.ts) — hover/focus policy and reduced-data check.
3. [`routes/routeModules.ts`](../../apps/financial-workspace/src/routes/routeModules.ts) — cached route imports shared by prefetch and activation.
4. [`app/routes.tsx`](../../apps/financial-workspace/src/app/routes.tsx) — intent-aware navigation and lazy route activation.
5. [`feature-dynamic-panels/model/panelLoaders.ts`](../../packages/feature-dynamic-panels/src/model/panelLoaders.ts) — the same approach at panel level.

Show:

- a lazy item in `idle`;
- hover or keyboard focus changing it to `loading`;
- activation reusing the same promise;
- `/startup` showing the same registry entry as `ready`;
- normal activation still working without prefetch.

Say:

> Lazy loading reduces the initial bundle. Intent prefetching reduces the wait after likely intent.

## 6. Demonstrate local degradation

Open `/panels`.

Package:

```text
@demo/feature-dynamic-panels
```

Open these files:

1. [`model/panelDefinitions.ts`](../../packages/feature-dynamic-panels/src/model/panelDefinitions.ts) — panel contract, loader, and config validation.
2. [`internal/DynamicPanelHost.tsx`](../../packages/feature-dynamic-panels/src/internal/DynamicPanelHost.tsx) — validation, Suspense, disabled state, and boundary ownership.
3. [`internal/PanelErrorBoundary.tsx`](../../packages/feature-dynamic-panels/src/internal/PanelErrorBoundary.tsx) — local rendering failure and recovery UI.
4. [`panels/ActivitySummaryPanel.tsx`](../../packages/feature-dynamic-panels/src/panels/ActivitySummaryPanel.tsx) — ready, stale, and query-failure states.
5. [`panels/ScenarioSummaryPanel.tsx`](../../packages/feature-dynamic-panels/src/panels/ScenarioSummaryPanel.tsx) — ready, degraded, disabled, and render-failure examples.

Show:

- three sibling panel frames;
- one slow panel;
- one stale or degraded panel;
- one simulated local failure;
- Retry and Remove;
- siblings remaining usable.

Say:

> The Error Boundary catches the failure. The degradation policy defines the safe remaining UI.

Finish by showing that critical startup failures are not treated as optional panel degradation.

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

If presentation time is tight, open only these nine files:

1. [`createRuntimeConfig.ts`](../../apps/financial-workspace/src/runtime/createRuntimeConfig.ts)
2. [`createApplication.tsx`](../../apps/financial-workspace/src/composition/createApplication.tsx)
3. [`createPortfolioAnalytics.ts`](../../packages/feature-analytics-lab/src/model/createPortfolioAnalytics.ts)
4. [`createOrderTicketMachine.ts`](../../packages/feature-workflow-lab/src/model/createOrderTicketMachine.ts)
5. [`createWorkflowWorkspaceMachine.ts`](../../packages/feature-workflow-lab/src/model/createWorkflowWorkspaceMachine.ts)
6. [`createBootstrapMachine.ts`](../../apps/financial-workspace/src/bootstrap/createBootstrapMachine.ts)
7. [`createWorkerScenarioClient.ts`](../../packages/feature-analytics-lab/src/worker/createWorkerScenarioClient.ts)
8. [`createPreloadRegistry.ts`](../../apps/financial-workspace/src/prefetch/createPreloadRegistry.ts)
9. [`DynamicPanelHost.tsx`](../../packages/feature-dynamic-panels/src/internal/DynamicPanelHost.tsx)
