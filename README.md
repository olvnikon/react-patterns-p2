# Financial Workspace SPA

This repository is a generic React architecture showcase for a client-side financial workspace. It exists to demonstrate how several scaling patterns can work together in a small, presentation-friendly SPA.

The app uses only fake local examples: orders, portfolios, approvals, reports, dashboards, risk summary, activity feed, a demo user, and a demo desk. It does not contain real company names, internal systems, APIs, endpoints, authentication, credentials, or proprietary workflows.

## Run

```sh
corepack pnpm install
corepack pnpm dev
```

Validation commands:

```sh
corepack pnpm typecheck
corepack pnpm build
```

Routes:

| Route | Purpose |
| --- | --- |
| `/` | Dashboard overview and demo entry point |
| `/orders` | Flat application composition with slot-based layout |
| `/orders/:orderId/approval` | Order Approval workflow with React Adapter and epics |
| `/reports` | Lazy route with dynamically injected Reports reducer |
| `/startup` | Part 2 foundation: Runtime Configuration and Composition Root diagnostics |

## Part 2 Foundation

Part 2 extends the same client-side JAMstack SPA. The browser now starts through:

```txt
resources.json
  → validated immutable RuntimeConfig
  → Composition Root
  → XState bootstrap task graph
  → Main View Ready
  → dependencies, store, router, and React application
```

`apps/financial-workspace/public/resources.json` contains a small `customData`
collection. Application startup maps and validates those string values before
creating any feature infrastructure. Invalid configuration renders a dedicated
startup failure screen instead of mounting partially configured features.

The Composition Root lives under:

```txt
apps/financial-workspace/src/composition/
```

It creates the existing mock epic dependencies, Redux store, router, and React
application runtime. It also creates a small XState bootstrap runtime.

The bootstrap graph starts independent tasks in parallel, waits for explicit
dependencies, distinguishes critical and optional work, and lets React mount at
the Main View Ready milestone while optional warmups continue. The `/startup`
route makes configuration, concrete wiring, task state, retry, and replay
profiles visible for the presentation.

No backend application is part of this repository. All repository
implementations remain fake, local, and mocked.

## Pattern Map

| Pattern | Where to see it | What to look for |
| --- | --- | --- |
| Feature Modules with Public API | `packages/feature-*`, `packages/shared-*`, `packages/ui-layouts` | Each package exposes `src/index.ts`; app imports package roots only. |
| Flat Application Composition | `apps/financial-workspace/src/routes/OrdersRoute.tsx` | The route directly composes left, center, and right feature entries into layout slots. |
| Feature Facade + React Adapter | `packages/feature-order-approval/src/react/useOrderApproval.ts`; optional sub-example in `packages/feature-workspace-status/src/react/useWorkspaceStatus.ts` | Order Approval is Redux-backed. Workspace Status shows a tiny plain external-store adapter using `useSyncExternalStore`. |
| redux-observable dependencies | `apps/financial-workspace/src/app/store/appDependencies.ts`, `packages/feature-order-approval/src/model/orderApprovalEpic.ts` | Epics receive repository, logger, and clock through the third argument. |
| replaceReducer / injectReducer | `apps/financial-workspace/src/app/store/createReducer.ts`, `apps/financial-workspace/src/routes/ReportsRoute.tsx` | Reports reducer is not static; it is injected when the lazy Reports route loads. |

Plugin / Extension Points are intentionally not implemented in this showcase.

## Monorepo Structure

```txt
apps/
  financial-workspace/
    src/
      app/
        routes.tsx
        store/
      routes/

packages/
  ui-layouts/
  shared-api/
  shared-formatting/
  shared-types/
  feature-dashboard/
  feature-orders/
  feature-order-approval/
  feature-reports/
  feature-workspace-status/
  feature-portfolio-summary/
  feature-risk-summary/
  feature-activity-feed/
```

The app package owns routing, store setup, and application composition. Feature packages own their UI, model, fixtures, selectors, adapters, and side effects behind public package APIs.

## Feature Modules with Public API

Every package exposes its public contract from `src/index.ts`. Application code imports only from package roots:

```ts
import { OrdersEntry } from '@demo/feature-orders';
import { WorkspaceLayout } from '@demo/ui-layouts';
```

`src/index.ts` is a contract, not a barrel file. It exports only the entries, types, helpers, or wiring metadata that consumers are meant to use. Internal UI, model, React adapter, fixture, and helper files stay private by convention.

Allowed wiring exports include reducer metadata and epic metadata when the app needs them:

```ts
export { reportsReducer, reportsReducerKey } from './model/reportsSlice';
```

Avoid deep imports such as:

```ts
import { SomethingInternal } from '@demo/feature-orders/src/internal/SomethingInternal';
```

## Flat Application Composition

The `/orders` route demonstrates Flat Application Composition. The route owns the demo workspace context:

```txt
selectedDeskId: DESK-GLOBAL
selectedPortfolioId: PF-001
userId: USR-DEMO
```

It passes that data directly to the feature entries that need it:

```tsx
<WorkspaceLayout
  leftNav={<LeftNav>{/* portfolio summary */}</LeftNav>}
  centerContent={<CenterContent>{/* orders workspace */}</CenterContent>}
  rightContent={<RightContent>{/* risk + activity */}</RightContent>}
/>
```

The layout package is business-agnostic. It arranges slots and does not import orders, portfolios, reports, approvals, risk, or activity feed features.

Guiding phrase: build the application, not wrapper trees.

## Feature Facade + React Adapter

The main example is the Order Approval route:

```txt
/orders/ORD-1001/approval
```

`OrderApprovalEntry` renders the feature. Internally, the approval UI calls:

```ts
const { state, api } = useOrderApproval(orderId);
```

The UI consumes only feature-level state and operations:

```txt
state.orderId
state.status
state.comment
api.load()
api.updateComment()
api.approve()
api.reject()
api.reset()
```

The UI does not call Redux `dispatch`, selectors, or action creators directly. Redux Toolkit remains an implementation detail behind `useOrderApproval`.

Reports uses the same adapter principle in a smaller form. `ReportsEntry` calls `useReports()` and passes view-ready state plus callbacks into `ReportsView`, keeping injected route-state wiring out of presentational components.

## Pure External-Store Facade Demo

Workspace Status is an optional educational sub-example of Feature Facade + React Adapter. It does not replace the Redux-backed Order Approval implementation.

`packages/feature-workspace-status` owns a tiny plain TypeScript external store:

```txt
createWorkspaceStatusStore()
  getSnapshot()
  subscribe(listener)
  setSessionStatus()
  setConnectionStatus()
  refresh()
```

The React adapter, `useWorkspaceStatus()`, uses `useSyncExternalStore` because the store lives outside React. It exposes:

```txt
state: sessionStatus, connectionStatus, lastUpdatedAt, message
api: setOpen, setPaused, setClosed, simulateReconnect, refresh
```

`WorkspaceStatusView` receives state and callbacks through props. It does not import the store, call `useSyncExternalStore`, use Redux hooks, or know store internals.

This style is included only to show the pure external-store variant. In real applications, use it when integrating a non-React external source such as a platform service, browser API, WebSocket status, RxJS-like source, or vanilla store. Do not use it merely to avoid Redux or normal React state. Redux-backed features do not need `useSyncExternalStore` directly because React-Redux handles subscriptions internally.

## redux-observable Dependencies

The Order Approval async workflow demonstrates redux-observable dependencies.

The app creates mocked dependencies:

```ts
{
  orderApprovalRepository,
  logger,
  clock,
}
```

Those dependencies are passed into:

```ts
createEpicMiddleware({ dependencies })
```

The Order Approval epic receives them as the third argument:

```ts
(action$, state$, dependencies) => {
  // orchestrate mocked approval workflows
}
```

The epic handles:

```txt
load approval requested/succeeded/failed
approve requested/succeeded/failed
reject requested/succeeded/failed
```

The epic does not import concrete repository factories. The mock repository lives in `@demo/shared-api` and simulates async work with local fake data only. redux-observable is used here for action-driven workflow orchestration, not as a default server-state cache.

## replaceReducer / injectReducer

The `/reports` route demonstrates route-level reducer injection.

The store starts with stable reducers only:

```txt
orderApproval
```

Reports state is route-owned and dynamic. When the lazy Reports route loads, `ReportsRoute` imports reducer metadata from the Reports public API and calls:

```ts
appStore.injectReducer(reportsReducerKey, reportsReducer);
```

`injectReducer` is the app helper built on top of Redux's low-level `replaceReducer` API. The store keeps an `asyncReducers` dictionary, rebuilds the root reducer with `createReducer(asyncReducers)`, and calls `store.replaceReducer(...)` when a new route reducer is registered.

Lazy route loading and reducer injection are related but different:

```txt
lazy route loading: delay loading route UI code
injectReducer: register route-owned Redux state when the route loads
```

Reducer injection does not automatically clear route state. This demo keeps Reports state after the first `/reports` visit. Cleanup, reset-on-enter, and reducer removal are separate strategies; the Reports UI includes a reset action without adding reducer removal.

## Demo Walkthrough

1. Start at `/`.
   Point out the dashboard cards, the pattern labels, and the optional Workspace Status external-store demo.

2. Open `/orders`.
   Explain that the route composes portfolio summary, orders, risk summary, and activity feed directly into layout slots.

3. Open `/orders/ORD-1001/approval`.
   Explain that the UI talks to `useOrderApproval(orderId)` through `state + api`.

4. Add an approval comment and trigger approve or reject.
   Explain that the adapter dispatches feature actions and the epic performs async workflow orchestration through injected dependencies.

5. Open `/reports`.
   Explain that the route bundle is lazy-loaded and the Reports reducer is injected before the page renders.

6. Change report type, edit the portfolio filter, generate a report, and reset.
   Explain that Reports uses an injected route reducer plus a lightweight React Adapter.

## Simplifications

This is an architecture demo, not a production product.

Intentional simplifications:

- Mock repositories instead of real HTTP.
- Generic local identifiers such as `ORD-1001`, `PF-001`, and `USR-DEMO`.
- No authentication or permission model.
- No backend.
- No SSR or React Server Components.
- No Module Federation.
- No full design system.
- No Plugin / Extension Points.
- Reports uses a small local timeout for demo generation instead of an epic.
- Workspace Status uses a tiny local external store only as an educational facade/adapter variant.

## Safety Note

All data is fake, generic, local, and mocked. The repository must not contain real company names, internal system names, real APIs, real endpoints, credentials, real users, real customer data, or proprietary workflows.
