# React Patterns Part 2 — Implementation Plan

## 1. Objective

Extend the existing Financial Workspace SPA so it can be used to present and demonstrate these nine topics:

1. Runtime Configuration Pattern
2. Composition Root
3. Strategy Pattern
4. State Machines and Statecharts
5. Actor Model for UI Orchestration
6. Declarative Bootstrap Task Graph with XState
7. Web Worker Offloading
8. Import on Interaction / Intent-Based Prefetching
9. Graceful Capability Degradation

The result should remain an architecture showcase rather than a production financial product. Every example must use generic, fake, local data and must be small enough to explain live.

### UI-only / JAMstack boundary

This is a purely client-side React/JAMstack showcase:

- no backend project;
- no SSR or React Server Components;
- no server-owned UI composition;
- no database, authentication service, or message broker;
- no real endpoints;
- no backend workflow orchestration.

Browser code may call repository contracts to demonstrate API-shaped asynchronous work, but every implementation in this repository must be fake, local, and mocked. If a future real deployment connected those contracts to HTTP APIs, that backend would remain outside this showcase.

## 2. Recommended Direction

Reuse the existing application and monorepo.

The current project already provides:

- A generic Financial Workspace visual shell
- Client-side React routing
- Feature packages with public APIs
- Route-level application composition
- Redux Toolkit and redux-observable
- Lazy route loading
- Mock repositories
- Presentation notes embedded in the UI
- Existing Part 1 demonstrations that should remain intact

Starting a second application would duplicate the shell, navigation, styling, fake data, and package conventions. Extending the current SPA also makes the presentation narrative stronger:

```text
Part 1
Clear feature boundaries and application composition
        ↓
Part 2
Runtime wiring, orchestration, performance, and resilience
```

The new demos should be visibly grouped as Part 2 and should not rewrite the existing Part 1 examples unless a small integration change is necessary.

## 3. Guiding Architecture

```text
public/resources.json
        ↓
Runtime config loader and validator
        ↓
Declarative bootstrap task graph
        ↓
Composition Root
        ├── repositories and platform adapters
        ├── selected strategies
        ├── Redux store and epic dependencies
        ├── actor logic
        ├── Worker-backed services
        └── router and React application
                ↓
Part 1 routes + Part 2 demo routes
```

The patterns must remain distinct:

- Runtime Configuration describes deployment choices.
- The Composition Root creates and connects implementations.
- Strategy encapsulates interchangeable behavior.
- Statecharts model one workflow.
- Actors run and coordinate independent workflow instances.
- The Bootstrap Task Graph coordinates application initialization.
- Workers change where CPU-heavy work executes.
- Intent prefetching changes when likely resources start loading.
- Graceful degradation defines what remains usable after a local failure.

## 4. Documentation-First Deliverables

Create the documentation before implementing the demos.

```text
docs/
  README.md
  patterns/
    01-runtime-configuration.md
    02-composition-root.md
    03-strategy-pattern.md
    04-state-machines-and-statecharts.md
    05-actor-model-for-ui-orchestration.md
    06-declarative-bootstrap-task-graph.md
    07-web-worker-offloading.md
    08-intent-based-prefetching.md
    09-graceful-capability-degradation.md
  architecture/
    part-2-overview.md
    demo-walkthrough.md
    pattern-comparison.md
```

Each pattern document should contain:

1. Short definition
2. Problem it solves
3. Diagram
4. Demo scenario
5. Architecture and responsibilities
6. Minimal but complete code example
7. Best-fit use cases
8. When not to use it
9. Benefits
10. Disadvantages and risks
11. Relevant libraries
12. Relationship to the other patterns
13. Location of the working demo in the repository
14. Presentation talking points

The root README should later link to these documents and distinguish Part 1 from Part 2.

## 5. Proposed Demo Information Architecture

Keep the original routes:

```text
/
/orders
/orders/:orderId/approval
/reports
```

Add focused Part 2 routes:

```text
/architecture
  Overview and pattern map

/startup
  Runtime Configuration
  Composition Root
  Declarative Bootstrap Task Graph

/workflows
  State Machines and Statecharts
  Actor Model for UI Orchestration

/analytics
  Strategy Pattern
  Web Worker Offloading

/panels
  Import on Interaction / Intent-Based Prefetching
  Graceful Capability Degradation
```

This grouping keeps the number of routes manageable while preserving a clear story.

## 6. Pattern-to-Demo Map

| Pattern | Primary demo | Visible behavior |
| --- | --- | --- |
| Runtime Configuration | Application startup and `/startup` | Display validated values loaded from `resources.json`; allow a few safe demo profiles through local resource files or query-selected mock resource sets. |
| Composition Root | Application creation and `/startup` | Show which concrete repository, strategy, platform adapter, and analytics service were selected. |
| Strategy Pattern | `/analytics` | Switch between interchangeable direct and Worker-backed analytics strategies through runtime configuration or a controlled demo profile. |
| State Machines and Statecharts | `/workflows` | One order ticket moves through editing, checking, confirming, submitting, outcome unknown, reconciliation, accepted, and failed states. |
| Actor Model | `/workflows` | Open several independent order-ticket actors and show that each has its own state, messages, and lifecycle. |
| Bootstrap Task Graph | Startup and `/startup` | Visualize named tasks, dependencies, parallel work, critical tasks, optional tasks, retries, and the Main View Ready milestone. |
| Web Worker Offloading | `/analytics` | Run a fake portfolio scenario calculation while the main UI remains interactive; show progress and cancellation. |
| Intent-Based Prefetching | Navigation and `/panels` | Hover or focus a panel/route link to warm its module and safe mock data before activation; display prefetch status for the demo. |
| Graceful Capability Degradation | `/panels` | Lazy dynamic panels receive config, validate it, load data, fail independently, retain their frame, and offer Retry or Remove. |

## 7. Proposed Packages and App-Level Modules

Add packages only for the three visible Part 2 feature boundaries. Keep application-specific startup and wiring code inside the app package so the showcase does not become a package-count demonstration.

```text
packages/
  feature-workflow-lab/
    Order-ticket statechart, actor workspace, and React adapter

  feature-analytics-lab/
    Analytics contract, strategies, Worker protocol/adapter, and demo UI

  feature-dynamic-panels/
    Panel registry, lazy panel host, config validation, boundaries, and demo panels

apps/financial-workspace/src/
  composition/
    createApplication.ts
    createApplicationDependencies.ts
    applicationTypes.ts

  runtime/
    loadResources.ts
    createRuntimeConfig.ts

  bootstrap/
    bootstrapTasks.ts
    bootstrapMachine.ts
    startApplication.ts

  prefetch/
    routePreloaders.ts
    createIntentHandlers.ts
```

Every new package must expose a deliberate `src/index.ts`. App code must import package roots only.

The longer pattern documents contain advanced alternatives and fuller reference implementations. They are source material, not a requirement to implement every variant. The application should build only the smallest slice listed in this plan.

## 8. Runtime Configuration Design

Add:

```text
apps/financial-workspace/public/resources.json
```

Example shape:

```json
{
  "applicationId": "financial-workspace-demo",
  "customData": [
    { "key": "analyticsStrategy", "value": "worker" },
    { "key": "bootstrapProfile", "value": "standard" },
    { "key": "contextProvider", "value": "mock" },
    { "key": "prefetchMode", "value": "intent" }
  ]
}
```

The loader should:

1. Fetch the resource file before application creation.
2. Convert `customData` entries into a key/value record.
3. Validate supported keys and values.
4. Apply safe defaults for optional values.
5. Produce an immutable typed `RuntimeConfig`.
6. Fail clearly for invalid required configuration.

Do not allow features to read `resources.json`, `window`, or raw `customData` directly.

## 9. Composition Root Design

Replace the current direct module-level application construction with:

```ts
const resources = await loadResources();
const runtimeConfig = createRuntimeConfig(resources);
const application = await createApplication(runtimeConfig);

application.mount(rootElement);
```

`createApplication` should own:

- Mock repository creation
- Logger and clock creation
- Strategy selection
- Worker client creation
- XState actor logic creation
- Redux/epic dependency wiring
- Store creation
- Router creation or router dependency injection
- Cleanup registration

Return an explicit application runtime:

```ts
type ApplicationRuntime = {
  mount(root: HTMLElement): void;
  stop(): void;
  diagnostics: ApplicationDiagnostics;
};
```

The exact lifecycle may be simplified, but construction must be centralized and inspectable.

## 10. Strategy Pattern Design

Use one stable analytics capability:

```ts
type PortfolioAnalytics = {
  calculateScenario(input: ScenarioInput): Promise<ScenarioResult>;
  cancel?(): void;
};
```

Provide at least two implementations:

```text
DirectAnalyticsStrategy
WorkerAnalyticsStrategy
```

Both must use the same pure fake calculation algorithm and return the same result shape. The Composition Root selects the implementation from `RuntimeConfig`.

This demonstrates a meaningful Strategy boundary and naturally connects to Web Worker Offloading without making the two concepts identical:

```text
Strategy
  Which implementation is used?

Worker Offloading
  On which thread does one implementation execute?
```

## 11. State Machine and Actor Model Design

Use XState v5 and `@xstate/react`.

The order-ticket machine should include:

```text
editing
checking
confirming
submitting
outcomeUnknown
reconciling
accepted
blocked
failed
```

Use only fake checks and fake repositories. Do not present the client as an authoritative risk, approval, or compliance boundary.

The Actor Model demo should:

- Create one workspace actor.
- Spawn an actor per open order ticket.
- Allow several tickets to be in different states simultaneously.
- Route a mock external instrument-selection event through an adapter.
- Stop an actor when its ticket closes.
- Show actor messages and current states in a small diagnostics panel.

The React UI should subscribe through a feature adapter rather than spreading XState APIs through every component.

## 12. Declarative Bootstrap Task Graph Design

Model startup as named XState-managed tasks rather than one procedural bootstrap function.

Initial task graph:

```text
runtimeConfig
    ├── infrastructure
    ├── platformContext
    └── preloadCoreRoute

infrastructure
    ↓
session
    ├── referenceData
    └── workspaceState

platformContext + referenceData + workspaceState
    ↓
mainView

mainView
    ├── marketData
    └── analyticsWarmup
```

Rules:

- Independent tasks run in parallel.
- Dependencies are explicit.
- Critical and optional tasks are distinguishable.
- Critical failure prevents application readiness.
- Optional failure produces a degraded capability.
- Task status is observable.
- Retry is supported for selected tasks.
- The UI can display the graph after startup for presentation purposes.

The first implementation may use an explicit XState machine tailored to this demo. Do not build a generic workflow engine unless it becomes necessary.

Keep the visible graph to roughly 6–8 tasks. The UI needs task status, dependency arrows, one critical failure, one optional failure, and Retry; it does not need a reusable arbitrary-DAG platform.

## 13. Web Worker Offloading Design

Use a module Worker created with Vite:

```ts
new Worker(new URL('./scenario.worker.ts', import.meta.url), {
  type: 'module',
});
```

Demo requirements:

- Generate a large local collection of fake positions.
- Run a deliberately CPU-heavy but generic scenario aggregation.
- Keep scrolling, buttons, and a small animation responsive.
- Report progress in coarse batches.
- Support cancellation by terminating or superseding the Worker job.
- Use request IDs so stale Worker responses cannot update a newer job.
- Compare direct and Worker strategies without freezing the browser for an unsafe duration.

No real pricing or risk formula should be used.

Use one Worker and one request protocol. Worker pools, SharedArrayBuffer, Atomics, WebAssembly, and generic Worker RPC infrastructure remain documentation-only alternatives.

## 14. Intent-Based Prefetching Design

Implement a small application-owned preload registry:

```ts
type Preloader = () => Promise<unknown>;
```

Triggers:

- `pointerenter`
- keyboard `focus`
- optional `pointerdown`

Resources that may be prefetched:

- Lazy route or panel module
- Safe read-only mock data
- Worker module initialization

Rules:

- Deduplicate repeated preloads.
- Cache successful preload promises.
- Do not prefetch mutations.
- Keep normal Suspense/loading behavior as fallback.
- Make prefetch status visible in the demo route.
- Respect `navigator.connection?.saveData` when available.

The implementation should work with the current React Router version rather than depending on a router API that is not installed.

## 15. Graceful Capability Degradation Design

Create a dynamic panel host with this flow:

```text
Panel definition
    ↓
Lazy module resolution
    ↓
Host Suspense boundary
    ↓
Host Error Boundary
    ↓
Panel receives layout and filter config
    ↓
Panel validates config
    ↓
Panel runs mock query
```

Provide three demo panel types and use presentation controls to move them through the relevant states:

- Portfolio Overview — normal success
- Activity Summary — slow load and stale-data mode
- Scenario Summary — optional analytics capability with degraded and failed modes

An invalid configuration can be demonstrated by changing one panel's local demo config; it does not require a separate permanent panel implementation.

Capability states should be non-linear:

```text
Loading → Ready
Loading → Failed
Ready → Stale
Ready → Degraded
Stale → Ready after refresh
Degraded → Ready after recovery
Failed → Loading after retry

Disabled is separate and intentional.
```

Safety rules:

- A failed panel must not crash sibling panels.
- Stale data must show a timestamp.
- Unsafe actions must be disabled when data is stale or incomplete.
- A panel frame should preserve enough context to Retry or Remove.
- Critical application failures must still fail at an appropriate higher boundary.

## 16. Implementation Phases

### Phase 0 — Baseline Verification

Tasks:

- Install existing dependencies.
- Run typecheck and production build.
- Record the existing routes and presentation walkthrough.
- Confirm that Part 1 behavior is unchanged before new work begins.

Exit criteria:

- Existing app builds.
- Existing routes work.
- No unrelated source changes are required.

### Phase 1 — Pattern Documentation

Tasks:

- Create all nine pattern documents.
- Create the Part 2 overview and pattern comparison.
- Define one primary demo scenario per pattern.
- Add diagrams using Mermaid where useful.
- Document boundaries between easily confused patterns.
- Add a documentation index that distinguishes comprehensive reference material from the intentionally small implementation slice.
- State the UI-only/JAMstack boundary in the documentation index.

Exit criteria:

- Every pattern has a complete document.
- Every pattern maps to a planned route and source location.
- Documentation contains only generic fake financial examples.

### Phase 2 — Runtime Foundation

Tasks:

- Add `resources.json`.
- Implement resource parsing and typed runtime configuration.
- Add validation and an application startup error screen.
- Introduce the Composition Root.
- Refactor store creation so dependencies are passed into it.
- Keep the existing Part 1 store behavior intact.

Exit criteria:

- React mounts only after valid configuration and application creation.
- Features do not read raw configuration.
- Existing routes still work.

### Phase 3 — Bootstrap Task Graph

Tasks:

- Add XState dependencies.
- Implement mocked bootstrap actors/tasks.
- Create critical and optional task paths.
- Add task diagnostics and the `/startup` route.
- Expose the Main View Ready milestone.

Exit criteria:

- Dependencies and parallelism are visible.
- Optional failure does not prevent main readiness.
- Critical failure produces a clear startup failure.
- Retry works for selected failed tasks.

### Phase 4 — Strategy and Worker Analytics

Tasks:

- Create the analytics capability contract.
- Extract a pure fake scenario algorithm.
- Implement direct and Worker-backed strategies.
- Select the strategy in the Composition Root.
- Build the `/analytics` route.
- Add progress, cancellation, superseding, and responsiveness demonstration.

Exit criteria:

- Both strategies return equivalent result shapes.
- Runtime configuration changes the selected implementation.
- The Worker version keeps the UI responsive.
- Worker cleanup happens on route/application disposal.

### Phase 5 — Statechart Workflow

Tasks:

- Implement the order-ticket statechart.
- Add guards, invoked async actors, timeout, outcome unknown, and reconciliation.
- Create a React adapter exposing view-ready `state` and business-friendly `api`.
- Add one-ticket mode to `/workflows`.

Exit criteria:

- Only declared transitions are possible.
- Timeout is not represented as rejection.
- React components do not coordinate the workflow manually.

### Phase 6 — Actor Workspace

Tasks:

- Create a workspace actor.
- Spawn and stop multiple ticket actors.
- Add targeted parent/child messages.
- Add a mock Shell/FDC3 context adapter.
- Add actor diagnostics to `/workflows`.

Exit criteria:

- Multiple tickets progress independently.
- Closing a ticket stops its actor.
- External context is adapted before entering the actor system.
- The demo clearly distinguishes actors from Redux and Workers.

### Phase 7 — Intent Prefetching

Tasks:

- Create route/panel preload functions.
- Attach preload behavior to navigation and demo cards.
- Deduplicate requests.
- Add visible preload diagnostics.
- Respect reduced-data preferences where possible.

Exit criteria:

- Hover/focus starts loading before click.
- Click still works without prior intent.
- No mutation or unsafe action is prefetched.

### Phase 8 — Dynamic Panels and Degradation

Tasks:

- Create the panel registry and host.
- Add Suspense and Error Boundary ownership to the host.
- Add panel config validation.
- Implement success, slow, stale, degraded, failed, and disabled examples.
- Build `/panels`.

Exit criteria:

- One panel can fail without affecting siblings.
- Retry and Remove work locally.
- Stale and degraded states are distinct.
- Critical failure remains distinguishable from optional degradation.

### Phase 9 — Integration and Presentation Polish

Tasks:

- Add a Part 2 pattern map to the dashboard.
- Add concise pattern notes to each demo route.
- Add toggles that deliberately demonstrate failure, delay, and configuration modes.
- Keep the styling consistent with the existing application.
- Update the root README and demo walkthrough.

Exit criteria:

- A presenter can demonstrate all nine topics without opening source files for every explanation.
- Each route has a clear “what to observe” note.
- Part 1 and Part 2 remain easy to distinguish.

### Phase 10 — Verification

Tasks:

- Typecheck.
- Production build.
- Test primary interactions.
- Verify lazy chunks and Worker output.
- Verify cleanup when navigating away.
- Check responsive layout.
- Check that all data and identifiers are fake and generic.
- Check that no package is imported through a deep internal path.

Exit criteria:

- All Definition of Done items pass.

## 17. Testing Strategy

Keep tests proportional to the architecture risks.

Priority tests:

- Runtime config parsing, defaults, and invalid values
- Strategy selection
- Pure scenario calculation
- State-machine transitions and guards
- Timeout and reconciliation path
- Bootstrap critical/optional task behavior
- Panel configuration validation
- Panel retry state
- Intent preloader deduplication
- Worker request correlation and stale-result rejection

Prefer unit tests for pure logic and a small number of integration tests for route-level demos.

## 18. Dependencies

Expected additions:

```text
xstate
@xstate/react
```

Optional additions only if clearly justified:

```text
vitest
@testing-library/react
```

Avoid adding:

- A second global state library
- A generic dependency-injection container
- A generic task-graph framework
- A Worker RPC library unless native messaging becomes distracting
- A schema library solely for a few configuration values

Start with small explicit TypeScript implementations.

## 19. Risks and Mitigations

### Risk: Too many patterns on one screen

Mitigation: group related patterns into focused routes and keep one primary visual demonstration per pattern.

### Risk: Reference documentation drives an oversized implementation

Mitigation: treat optional variants, production concerns, and alternative libraries as discussion material. Implement only the explicit showcase slice defined in this plan.

### Risk: XState appears to replace Redux

Mitigation: keep Redux for existing shared application state and use XState only for workflow and actor orchestration demos.

### Risk: Actor Model appears to mean multithreading

Mitigation: explicitly label ordinary actors as main-thread logical concurrency and Workers as actual background-thread execution.

### Risk: Strategy and Worker Offloading collapse into one idea

Mitigation: provide two strategies behind one contract and explain that Worker execution is an implementation choice.

### Risk: Bootstrap implementation becomes a generic workflow engine

Mitigation: build an explicit application-specific XState graph first.

### Risk: Graceful degradation hides serious failures

Mitigation: classify capabilities as critical or optional and fail the application for invalid configuration or missing critical context.

### Risk: Demo calculations resemble real financial logic

Mitigation: use clearly labelled synthetic aggregation over fake generated positions.

### Risk: Part 1 examples regress

Mitigation: preserve existing routes and run baseline verification before and after each foundation refactor.

## 20. Definition of Done

The Part 2 showcase is complete when:

- The existing Part 1 routes still work.
- All nine pattern documents exist.
- The root README contains a complete Part 1 and Part 2 pattern map.
- Runtime configuration is loaded from `resources.json` before application creation.
- Raw `customData` does not leak into features.
- One Composition Root creates and connects concrete implementations.
- A runtime-selected Strategy is visible in the UI.
- A statechart models a complete fake order workflow.
- Multiple actor instances can run independently.
- Startup tasks are represented as an observable dependency graph.
- A Worker-backed calculation keeps the UI responsive.
- Hover/focus can preload a lazy feature safely.
- A dynamic panel can fail without crashing sibling panels.
- Critical failures and optional degradation are clearly different.
- All repositories and services are mocked and local.
- No backend application or server runtime is created.
- All data, identifiers, endpoints, and names are generic and fake.
- Typecheck and production build pass.
- The demo is understandable in a live presentation.

## 21. Recommended First Implementation Step

After approving this plan, begin with Phase 1:

1. Create the documentation directory.
2. Write the nine pattern documents.
3. Write the Part 2 overview and comparison document.
4. Confirm the final route and package map from the documentation.
5. Only then begin the runtime configuration and Composition Root refactor.
