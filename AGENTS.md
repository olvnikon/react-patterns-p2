# SKILL.md — Codex Instructions for the Financial Workspace SPA Showcase

## Mission

Build a **generic Financial Workspace SPA** that demonstrates several React scaling patterns for large client-side applications.

This repository is an **architecture showcase**, not a production product. The application should be small enough to explain in a live presentation, but realistic enough to show how patterns work together.

The app should demonstrate these patterns:

1. **Feature Modules with Public API**
2. **Flat Application Composition / Slot-Based Layouts**
3. **Feature Facade + React Adapter**
4. **redux-observable dependencies**
5. **replaceReducer / injectReducer in a multi-route SPA**

Do **not** implement Plugin / Extension Points in this showcase. That pattern is covered separately.

---

# 1. Hard Constraints

## 1.1 Safety / Sensitivity

Use only **generic financial application examples**.

Allowed generic concepts:

- Orders
- Portfolios
- Reports
- Approvals
- Dashboard
- Risk Summary
- Activity Feed
- Demo User
- Demo Desk
- Saved Views

Forbidden:

- Real company names
- Real internal platform names
- Real business unit names
- Real customer data
- Real user names
- Real portfolio IDs
- Real order/trade IDs
- Real API endpoints
- Real authentication
- Real permission model
- Real environment names
- Real risk calculations
- Real approval policies
- Real system names
- Real infrastructure details

All data must be fake, local, and mocked.

Use fake identifiers such as:

```txt
ORD-1001
ORD-1002
PF-001
PF-002
USR-DEMO
Global Desk
Monthly Exposure Report
```

## 1.2 Architecture Constraints

- Build a **client-side React SPA**.
- Use a **monorepo**.
- Use **TypeScript**.
- Use **Redux Toolkit** for Redux slices.
- Use **redux-observable** and **RxJS** for selected side effects.
- Use **mock repositories** instead of real HTTP.
- Use **client-side routing**.
- Use **lazy route loading** for at least the Reports route.
- Use **reducer injection** for the Reports feature.
- Keep UI simple and clean.
- Do not implement SSR.
- Do not implement React Server Components.
- Do not implement Module Federation.
- Do not create a backend.
- Do not add real authentication.
- Do not add a full design system.
- Do not overbuild.

---

# 2. Recommended Tech Stack

Use a modern React/TypeScript setup.

Recommended:

```txt
pnpm workspace
Vite
React
TypeScript
React Router
Redux Toolkit
redux-observable
RxJS
```

Optional but useful:

```txt
ESLint
Prettier
Vitest
Testing Library
```

Keep dependencies minimal.

---

# 3. Target Monorepo Structure

Use this structure as the target shape.

```txt
financial-workspace-spa/
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json

  apps/
    financial-workspace/
      package.json
      index.html
      vite.config.ts
      src/
        main.tsx
        app/
          App.tsx
          routes.tsx
          store/
            configureAppStore.ts
            createReducer.ts
            rootEpic.ts
            appDependencies.ts
            appTypes.ts
        routes/
          DashboardRoute.tsx
          OrdersRoute.tsx
          OrderApprovalRoute.tsx
          ReportsRoute.tsx

  packages/
    ui-layouts/
      package.json
      src/
        index.ts
        AppShell.tsx
        WorkspaceLayout.tsx
        LeftNav.tsx
        CenterContent.tsx
        RightContent.tsx

    shared-types/
      package.json
      src/
        index.ts
        ids.ts
        money.ts
        status.ts

    shared-formatting/
      package.json
      src/
        index.ts
        formatMoney.ts
        formatDate.ts
        formatStatus.ts

    shared-api/
      package.json
      src/
        index.ts
        delay.ts
        createMockOrderApprovalRepository.ts
        createMockReportsRepository.ts
        createMockLogger.ts
        createMockClock.ts

    feature-dashboard/
      package.json
      src/
        index.ts
        DashboardEntry.tsx
        internal/
          DashboardSummaryCard.tsx
          dashboardData.ts

    feature-orders/
      package.json
      src/
        index.ts
        OrdersEntry.tsx
        internal/
          OrderBlotter.tsx
          RecentOrders.tsx
          orderFixtures.ts

    feature-order-approval/
      package.json
      src/
        index.ts
        OrderApprovalEntry.tsx
        react/
          useOrderApproval.ts
        model/
          orderApprovalSlice.ts
          orderApprovalSelectors.ts
          orderApprovalEpic.ts
          orderApprovalTypes.ts
        internal/
          OrderApprovalView.tsx
          OrderSummaryPanel.tsx
          ApprovalActions.tsx
          ApprovalCommentBox.tsx

    feature-reports/
      package.json
      src/
        index.ts
        ReportsEntry.tsx
        routeModule.ts
        model/
          reportsSlice.ts
          reportsSelectors.ts
        internal/
          ReportsView.tsx
          ReportFilters.tsx
          ReportResults.tsx

    feature-portfolio-summary/
      package.json
      src/
        index.ts
        PortfolioSummaryEntry.tsx
        internal/
          PortfolioList.tsx
          portfolioFixtures.ts

    feature-risk-summary/
      package.json
      src/
        index.ts
        RiskSummaryEntry.tsx
        internal/
          RiskCard.tsx
          riskFixtures.ts

    feature-activity-feed/
      package.json
      src/
        index.ts
        ActivityFeedEntry.tsx
        internal/
          ActivityItem.tsx
          activityFixtures.ts
```

This structure is intentionally larger than the final UI needs because the purpose is to demonstrate package-level feature boundaries.

Do not create extra packages unless needed.

---

# 4. Package Naming

Use generic package names.

Example:

```json
{
  "name": "@demo/feature-order-approval",
  "private": true
}
```

Recommended package names:

```txt
@demo/app-financial-workspace
@demo/ui-layouts
@demo/shared-types
@demo/shared-formatting
@demo/shared-api
@demo/feature-dashboard
@demo/feature-orders
@demo/feature-order-approval
@demo/feature-reports
@demo/feature-portfolio-summary
@demo/feature-risk-summary
@demo/feature-activity-feed
```

---

# 5. Public API Rule

Every package must expose a public API from `src/index.ts`.

Consumers must import only from the package root.

Good:

```ts
import { OrderApprovalEntry } from '@demo/feature-order-approval';
import { WorkspaceLayout } from '@demo/ui-layouts';
```

Bad:

```ts
import { OrderSummaryPanel } from '@demo/feature-order-approval/src/internal/OrderSummaryPanel';
import { orderApprovalReducer } from '@demo/feature-order-approval/src/model/orderApprovalSlice';
```

Exception:

The package public API may intentionally export reducer metadata, epic metadata, route metadata, or types if the app needs them for wiring.

Example:

```ts
// packages/feature-reports/src/index.ts
export { ReportsEntry } from './ReportsEntry';
export { reportsReducerKey, reportsReducer } from './routeModule';
```

Do not export internal UI pieces just because another feature wants to reuse them. If reuse is real, create an intentional public component or move generic functionality into a shared package.

---

# 6. Pattern 1 — Feature Modules with Public API

## 6.1 Pattern Explanation

A feature package is a boundary.

The package owns:

- Its internal UI
- Its state model
- Its selectors
- Its side effects
- Its fixtures
- Its validation rules
- Its internal helpers

The rest of the app sees only what the package exports from its public API.

This is the monorepo version of feature folders with `index.ts`.

## 6.2 Public API Example

Each feature package should have a small `src/index.ts`.

Example for order approval:

```ts
export { OrderApprovalEntry } from './OrderApprovalEntry';

export {
  orderApprovalReducer,
  orderApprovalReducerKey,
} from './model/orderApprovalSlice';

export { orderApprovalEpic } from './model/orderApprovalEpic';

export type {
  OrderApprovalState,
  OrderApprovalStatus,
} from './model/orderApprovalTypes';
```

Only export what the app actually needs.

Do not export:

```ts
export * from './internal/OrderSummaryPanel';
export * from './internal/ApprovalActions';
export * from './internal/ApprovalCommentBox';
```

## 6.3 Package Internal Structure

Example:

```txt
feature-order-approval/
  src/
    index.ts
    OrderApprovalEntry.tsx
    react/
      useOrderApproval.ts
    model/
      orderApprovalSlice.ts
      orderApprovalSelectors.ts
      orderApprovalEpic.ts
      orderApprovalTypes.ts
    internal/
      OrderApprovalView.tsx
      OrderSummaryPanel.tsx
      ApprovalActions.tsx
      ApprovalCommentBox.tsx
```

Meaning:

```txt
OrderApprovalEntry.tsx
  public feature entry

react/
  React Adapter layer

model/
  Redux slice, selectors, epic, types

internal/
  private rendering components
```

## 6.4 Acceptance Criteria

- App imports feature packages only from package roots.
- No deep imports from `internal`, `model`, or `react` folders outside the package.
- Public APIs are intentionally small.
- Every feature package can reorganize internals without breaking the app.
- The difference between public and internal files is obvious.

---

# 7. Pattern 2 — Flat Application Composition / Slot-Based Layouts

## 7.1 Pattern Explanation

The route should compose major application sections directly.

Layout components should arrange sections, not import business features.

This avoids deep wrapper trees and prop drilling.

The guiding phrase:

```txt
Build the application, not wrapper trees.
```

## 7.2 Layout Package

The layout package should provide structural components only.

Example public API:

```ts
export { AppShell } from './AppShell';
export { WorkspaceLayout } from './WorkspaceLayout';
export { LeftNav } from './LeftNav';
export { CenterContent } from './CenterContent';
export { RightContent } from './RightContent';
```

Example responsibility:

```tsx
type WorkspaceLayoutProps = {
  leftNav: React.ReactNode;
  centerContent: React.ReactNode;
  rightContent?: React.ReactNode;
};

export function WorkspaceLayout({
  leftNav,
  centerContent,
  rightContent,
}: WorkspaceLayoutProps) {
  return (
    <div className="workspace-layout">
      <aside className="workspace-left">{leftNav}</aside>
      <main className="workspace-center">{centerContent}</main>
      {rightContent ? (
        <aside className="workspace-right">{rightContent}</aside>
      ) : null}
    </div>
  );
}
```

The layout must not import:

```txt
OrderBlotter
PortfolioSummaryEntry
RiskSummaryEntry
ActivityFeedEntry
ReportsEntry
```

## 7.3 Orders Route Composition

Use the Orders route to demonstrate this pattern.

The route should compose feature entries like this:

```tsx
import {
  WorkspaceLayout,
  LeftNav,
  CenterContent,
  RightContent,
} from '@demo/ui-layouts';

import { OrdersEntry } from '@demo/feature-orders';
import { PortfolioSummaryEntry } from '@demo/feature-portfolio-summary';
import { RiskSummaryEntry } from '@demo/feature-risk-summary';
import { ActivityFeedEntry } from '@demo/feature-activity-feed';

export function OrdersRoute() {
  const demoUserId = 'USR-DEMO';
  const selectedDeskId = 'DESK-GLOBAL';
  const selectedPortfolioId = 'PF-001';

  return (
    <WorkspaceLayout
      leftNav={
        <LeftNav>
          <PortfolioSummaryEntry selectedPortfolioId={selectedPortfolioId} />
        </LeftNav>
      }
      centerContent={
        <CenterContent>
          <OrdersEntry
            selectedDeskId={selectedDeskId}
            selectedPortfolioId={selectedPortfolioId}
          />
        </CenterContent>
      }
      rightContent={
        <RightContent>
          <RiskSummaryEntry selectedPortfolioId={selectedPortfolioId} />
          <ActivityFeedEntry userId={demoUserId} />
        </RightContent>
      }
    />
  );
}
```

This is intentionally explicit.

The route has the data and composes the application.

The layout just arranges the regions.

## 7.4 Avoid This

Avoid hiding the route structure inside nested wrappers:

```tsx
export function OrdersRoute() {
  return <OrdersWorkspace />;
}

function OrdersWorkspace() {
  return (
    <WorkspaceLayout>
      <OrdersLeftColumn />
      <OrdersCenterColumn />
      <OrdersRightColumn />
    </WorkspaceLayout>
  );
}

function OrdersCenterColumn() {
  return <OrdersEntry />;
}
```

This is not always wrong, but it can hide the application composition and cause prop drilling. Use explicit route-level composition for the showcase.

## 7.5 Acceptance Criteria

- Orders route visibly composes left, center, and right areas.
- Layout package is business-agnostic.
- Data flows directly from the route to feature entries.
- No wrapper exists only to pass props through.
- The structure supports a clear presentation explanation.

---

# 8. Pattern 3 — Feature Facade + React Adapter

## 8.1 Pattern Explanation

The UI should not manually coordinate Redux actions, selectors, loading flags, error states, and workflow transitions.

Instead, the UI should use a feature adapter hook that exposes:

```ts
{
  state: FeatureStateForUI,
  api: FeatureActionsForUI
}
```

The adapter may use Redux internally.

The component should not care.

## 8.2 Order Approval Feature

Use the Order Approval feature as the main example.

It should expose:

```tsx
<OrderApprovalEntry orderId="ORD-1001" />
```

The entry should render the approval screen.

Internally, the approval UI should use:

```ts
const { state, api } = useOrderApproval(orderId);
```

## 8.3 Adapter Shape

Example:

```ts
type UseOrderApprovalResult = {
  state: {
    orderId: string;
    title: string;
    amountLabel: string;
    status:
      | 'idle'
      | 'loading'
      | 'ready'
      | 'saving'
      | 'approved'
      | 'rejected'
      | 'failed';
    comment: string;
    errorMessage?: string;
    canApprove: boolean;
    canReject: boolean;
  };
  api: {
    load: () => void;
    updateComment: (comment: string) => void;
    approve: () => void;
    reject: () => void;
    reset: () => void;
  };
};
```

## 8.4 React Adapter Example

The adapter may use Redux hooks internally.

```ts
export function useOrderApproval(orderId: string): UseOrderApprovalResult {
  const dispatch = useAppDispatch();

  const state = useAppSelector((rootState) =>
    selectOrderApprovalView(rootState, orderId),
  );

  return {
    state,
    api: {
      load: () => dispatch(orderApprovalLoadRequested({ orderId })),
      updateComment: (comment) =>
        dispatch(orderApprovalCommentChanged({ orderId, comment })),
      approve: () => dispatch(orderApprovalApproveRequested({ orderId })),
      reject: () => dispatch(orderApprovalRejectRequested({ orderId })),
      reset: () => dispatch(orderApprovalReset({ orderId })),
    },
  };
}
```

The UI should not use `dispatch` directly.

The UI should not call selectors directly.

The UI should not know action names.

## 8.5 UI Example

```tsx
export function OrderApprovalView({ orderId }: { orderId: string }) {
  const { state, api } = useOrderApproval(orderId);

  React.useEffect(() => {
    api.load();
  }, [api, orderId]);

  if (state.status === 'loading') {
    return <p>Loading approval details...</p>;
  }

  return (
    <section>
      <h1>{state.title}</h1>

      <p>{state.amountLabel}</p>

      <textarea
        value={state.comment}
        onChange={(event) => api.updateComment(event.target.value)}
      />

      {state.errorMessage ? <p>{state.errorMessage}</p> : null}

      <button type="button" disabled={!state.canApprove} onClick={api.approve}>
        Approve
      </button>

      <button type="button" disabled={!state.canReject} onClick={api.reject}>
        Reject
      </button>
    </section>
  );
}
```

## 8.6 Selectors as View Model

Use selectors to create a view-ready state shape.

Example:

```ts
export function selectOrderApprovalView(
  state: RootState,
  orderId: string,
): OrderApprovalViewState {
  const approval = state.orderApproval.byId[orderId];

  if (!approval) {
    return {
      orderId,
      title: 'Order Approval',
      amountLabel: '',
      status: 'idle',
      comment: '',
      canApprove: false,
      canReject: false,
    };
  }

  return {
    orderId,
    title: `Order ${approval.orderId}`,
    amountLabel: formatMoney(approval.amount),
    status: approval.status,
    comment: approval.comment,
    errorMessage: approval.errorMessage,
    canApprove:
      approval.status === 'ready' && approval.comment.trim().length > 0,
    canReject:
      approval.status === 'ready' && approval.comment.trim().length > 0,
  };
}
```

The selector prepares UI-friendly data.

## 8.7 Acceptance Criteria

- Approval UI uses `useOrderApproval`.
- UI receives `state` and `api`.
- UI does not call Redux dispatch directly.
- UI does not call selectors directly.
- Feature operations use business-friendly names.
- Redux remains an internal implementation detail of the feature adapter.
- The pattern is demonstrated clearly without creating a giant global facade.

---

# 9. Pattern 4 — redux-observable Dependencies

## 9.1 Pattern Explanation

redux-observable epics receive dependencies as the third argument.

Use this to inject repositories, loggers, clocks, permission services, or other external services.

Do not import concrete infrastructure directly inside epics.

## 9.2 App Dependencies

Create application dependencies in the app package.

Example:

```ts
export type AppDependencies = {
  orderApprovalRepository: OrderApprovalRepository;
  logger: Logger;
  clock: Clock;
};

export function createAppDependencies(): AppDependencies {
  return {
    orderApprovalRepository: createMockOrderApprovalRepository(),
    logger: createMockLogger(),
    clock: createMockClock(),
  };
}
```

## 9.3 Epic Middleware Setup

```ts
const dependencies = createAppDependencies();

const epicMiddleware = createEpicMiddleware<
  AppAction,
  AppAction,
  RootState,
  AppDependencies
>({
  dependencies,
});
```

Then add the epic middleware to the Redux store.

Run the root epic after store creation.

## 9.4 Epic Example

The epic should receive dependencies as the third argument.

```ts
export const approveOrderEpic: AppEpic = (
  action$,
  state$,
  { orderApprovalRepository, logger, clock },
) =>
  action$.pipe(
    ofType(orderApprovalApproveRequested.type),
    mergeMap((action) =>
      from(
        orderApprovalRepository.approveOrder({
          orderId: action.payload.orderId,
          approvedAt: clock.now(),
        }),
      ).pipe(
        map((result) =>
          orderApprovalApproveSucceeded({
            orderId: action.payload.orderId,
            result,
          }),
        ),
        catchError((error) => {
          logger.error('Failed to approve order', {
            orderId: action.payload.orderId,
            error,
          });

          return of(
            orderApprovalApproveFailed({
              orderId: action.payload.orderId,
              errorMessage: 'Approval failed. Try again.',
            }),
          );
        }),
      ),
    ),
  );
```

## 9.5 Repository Interface

Keep repository APIs generic and fake.

```ts
export type OrderApprovalRepository = {
  loadApprovalDetails(input: {
    orderId: string;
  }): Promise<OrderApprovalDetails>;

  approveOrder(input: {
    orderId: string;
    approvedAt: string;
  }): Promise<OrderApprovalResult>;

  rejectOrder(input: {
    orderId: string;
    rejectedAt: string;
    comment: string;
  }): Promise<OrderApprovalResult>;
};
```

## 9.6 Mock Repository

Use a fake implementation.

Do not call real HTTP.

```ts
export function createMockOrderApprovalRepository(): OrderApprovalRepository {
  return {
    async loadApprovalDetails({ orderId }) {
      await delay(300);

      return {
        orderId,
        portfolioId: 'PF-001',
        amount: {
          value: 1250000,
          currency: 'EUR',
        },
        status: 'pending',
      };
    },

    async approveOrder({ orderId, approvedAt }) {
      await delay(500);

      return {
        orderId,
        status: 'approved',
        completedAt: approvedAt,
      };
    },

    async rejectOrder({ orderId, rejectedAt, comment }) {
      await delay(500);

      return {
        orderId,
        status: 'rejected',
        completedAt: rejectedAt,
        comment,
      };
    },
  };
}
```

## 9.7 When to Use Epics

Use epics in the demo to show:

- async orchestration
- injected dependencies
- success/failure action flows
- optional cancellation or sequencing if desired

Do not overbuild. One load epic and one approve/reject epic is enough.

## 9.8 Acceptance Criteria

- Epics receive dependencies as third argument.
- Epics do not import concrete repositories.
- Repository is mocked.
- Logger is mocked.
- The approval flow visibly uses epic-driven async behavior.
- The example is easy to test and explain.

---

# 10. Pattern 5 — replaceReducer / injectReducer

## 10.1 Pattern Explanation

`replaceReducer` is the low-level Redux API that replaces the root reducer.

`injectReducer` is an application helper that registers an async reducer and calls `replaceReducer`.

Use this to register route-specific reducers when a lazy route is loaded.

## 10.2 Store Shape

The store should start with only stable reducers.

Example static reducers:

```ts
const staticReducers = {
  app: appReducer,
  orderApproval: orderApprovalReducer,
};
```

The Reports reducer should be dynamic.

## 10.3 createReducer Helper

```ts
export function createReducer(asyncReducers: ReducersMapObject = {}) {
  return combineReducers({
    ...staticReducers,
    ...asyncReducers,
  });
}
```

## 10.4 Store with injectReducer

```ts
export function configureAppStore() {
  const epicMiddleware = createEpicMiddleware({
    dependencies: createAppDependencies(),
  });

  const store = configureStore({
    reducer: createReducer(),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(epicMiddleware),
  });

  store.asyncReducers = {};

  store.injectReducer = (key, reducer) => {
    if (store.asyncReducers[key]) {
      return;
    }

    store.asyncReducers[key] = reducer;
    store.replaceReducer(createReducer(store.asyncReducers));
  };

  epicMiddleware.run(rootEpic);

  return store;
}
```

Use proper TypeScript augmentation or local typed store type.

## 10.5 Store Type

Example concept:

```ts
export type AppStore = ReturnType<typeof configureAppStore> & {
  asyncReducers: ReducersMapObject;
  injectReducer: (key: string, reducer: Reducer) => void;
};
```

Keep the typing clear and simple.

## 10.6 Reports Feature Exports

The Reports package should export reducer metadata from its public API.

```ts
export { ReportsEntry } from './ReportsEntry';

export { reportsReducer, reportsReducerKey } from './model/reportsSlice';
```

## 10.7 Lazy Reports Route

The app route should load Reports lazily and inject its reducer.

Example concept:

```ts
{
  path: '/reports',
  lazy: async () => {
    const reportsFeature = await import('@demo/feature-reports');

    appStore.injectReducer(
      reportsFeature.reportsReducerKey,
      reportsFeature.reportsReducer,
    );

    return {
      Component: reportsFeature.ReportsEntry,
    };
  },
}
```

Adapt to the chosen router API.

## 10.8 Reports Slice

Reports state should be simple.

Example fields:

```ts
type ReportsState = {
  selectedReportType: string;
  filters: {
    portfolioId?: string;
    dateRange?: string;
  };
  generationStatus: 'idle' | 'generating' | 'ready' | 'failed';
  generatedReportId?: string;
};
```

## 10.9 Important Caveat

Reducer injection does not automatically clear state.

Document this in the README.

For the demo, choose one strategy:

Option A: Keep Reports state after first visit.

Option B: Reset Reports state on route enter.

Option C: Add reducer removal later, but do not implement unless explicitly needed.

Recommended for showcase:

Use Option A. Keep it simple and explain the caveat.

## 10.10 Acceptance Criteria

- Reports reducer is not static.
- Reports route injects reducer when loaded.
- Reports page can use its slice after injection.
- The README explains `replaceReducer` vs `injectReducer`.
- The README explains that injection does not automatically clear state.

---

# 11. Routing

Use routes:

```txt
/
  Dashboard

/orders
  Orders workspace

/orders/:orderId/approval
  Order approval workflow

/reports
  Reports route with lazy reducer injection
```

Recommended route ownership:

```txt
DashboardRoute
  imports DashboardEntry

OrdersRoute
  composes PortfolioSummaryEntry, OrdersEntry, RiskSummaryEntry, ActivityFeedEntry

OrderApprovalRoute
  renders OrderApprovalEntry

ReportsRoute
  lazy-loaded and injects Reports reducer
```

---

# 12. Root App Composition

The app root should be simple.

Responsibilities:

- Mount router
- Provide Redux store
- Provide app shell if needed
- Avoid business logic

Example structure:

```tsx
export function App() {
  return (
    <Provider store={appStore}>
      <RouterProvider router={router} />
    </Provider>
  );
}
```

The route components should own application-level composition.

---

# 13. Dashboard Feature

Keep Dashboard simple.

Purpose:

- Show app landing page
- Demonstrate feature package import
- Provide links/cards to other routes

Suggested content:

- Orders summary card
- Reports summary card
- Pending approvals card
- Portfolio summary card

No complex state needed.

---

# 14. Orders Feature

Purpose:

- Show order list and recent orders
- Participate in flat composition
- Stay simple

Suggested public API:

```ts
export { OrdersEntry } from './OrdersEntry';
```

Suggested props:

```ts
type OrdersEntryProps = {
  selectedDeskId: string;
  selectedPortfolioId: string;
};
```

Internals:

- OrderBlotter
- RecentOrders
- orderFixtures

No Redux required unless necessary.

---

# 15. Portfolio Summary Feature

Purpose:

- Used in the left navigation region of Orders route

Suggested public API:

```ts
export { PortfolioSummaryEntry } from './PortfolioSummaryEntry';
```

Suggested props:

```ts
type PortfolioSummaryEntryProps = {
  selectedPortfolioId: string;
};
```

Keep internally mocked.

---

# 16. Risk Summary Feature

Purpose:

- Used in the right side region of Orders route

Suggested public API:

```ts
export { RiskSummaryEntry } from './RiskSummaryEntry';
```

Suggested props:

```ts
type RiskSummaryEntryProps = {
  selectedPortfolioId: string;
};
```

Keep generic and fake.

Do not implement real risk logic.

---

# 17. Activity Feed Feature

Purpose:

- Used in right side region of Orders route

Suggested public API:

```ts
export { ActivityFeedEntry } from './ActivityFeedEntry';
```

Suggested props:

```ts
type ActivityFeedEntryProps = {
  userId: string;
};
```

Use fake event names:

- Order reviewed
- Report generated
- Portfolio viewed
- Approval completed

---

# 18. Reports Feature

Purpose:

- Demonstrate reducer injection

Suggested public API:

```ts
export { ReportsEntry } from './ReportsEntry';

export { reportsReducer, reportsReducerKey } from './model/reportsSlice';
```

The app may import reducer metadata from the public API because it is intentional wiring.

Do not deep-import `reportsSlice`.

---

# 19. README Requirements

Create a README in the repository root.

It must explain:

- What the demo application is
- Which patterns are covered
- Which route demonstrates each pattern
- How feature public APIs work
- How flat application composition works
- How the Order Approval adapter works
- How redux-observable dependencies work
- How Reports reducer injection works
- How to run the app
- Which simplifications were made
- Safety note that all data is fake and generic

## README Pattern Map

Include a table like this:

```md
| Pattern                         | Where to see it                                               |
| ------------------------------- | ------------------------------------------------------------- |
| Feature Modules with Public API | All packages under packages/feature-\*                        |
| Flat Application Composition    | apps/financial-workspace/src/routes/OrdersRoute.tsx           |
| Feature Facade + React Adapter  | packages/feature-order-approval/src/react/useOrderApproval.ts |
| redux-observable dependencies   | app store setup + order approval epic                         |
| replaceReducer / injectReducer  | Reports route and app store setup                             |
```

---

# 20. Iterative Build Plan for Codex

Build in phases. Do not implement everything in one step.

## Phase 1 — Workspace and shell

Create:

- pnpm workspace
- app package
- package skeletons
- basic Vite React app
- simple routing
- placeholder pages

Validation:

- App runs
- Routes work
- Packages build or type-check

## Phase 2 — Feature public APIs

Create public `index.ts` files.

Validation:

- App imports only package roots
- No deep imports from package internals

## Phase 3 — Layouts and flat composition

Create layout package and Orders route composition.

Validation:

- Orders route composes feature entries explicitly
- Layout package is business-agnostic

## Phase 4 — Redux store and order approval slice

Create store, slice, selectors, and Order Approval UI adapter.

Validation:

- Approval UI uses `useOrderApproval`
- UI does not dispatch directly

## Phase 5 — redux-observable dependencies

Add epic middleware, root epic, injected dependencies, and approval async workflows.

Validation:

- Approve/reject flows work
- Epic uses injected repository
- No real HTTP

## Phase 6 — Reports reducer injection

Add Reports feature slice and lazy route injection.

Validation:

- Reports reducer is injected on route load
- README documents the caveat about state cleanup

## Phase 7 — Polish and README

Improve styling, fake data, and documentation.

Validation:

- Demo is easy to present
- All patterns are visible
- No sensitive information

---

# 21. Definition of Done

The generated application is complete when:

- It runs locally.
- It is a monorepo.
- It has one main SPA app.
- It has feature packages with public APIs.
- It demonstrates flat composition on the Orders route.
- It demonstrates Feature Facade + React Adapter on the Order Approval route.
- It demonstrates redux-observable dependencies in the Order Approval async flow.
- It demonstrates reducer injection on the Reports route.
- It contains only fake generic financial data.
- It contains a clear README.
- It avoids Plugin / Extension Points.
- It avoids real APIs and real system names.

---

# 22. Final Architecture Message

The final application should communicate this idea:

Large React applications scale better when they are assembled from clear, stable, replaceable parts.

The app should show:

- Feature packages define ownership.
- Public APIs prevent deep-import coupling.
- Routes compose meaningful application sections.
- Layouts arrange, but do not own business features.
- React components consume feature-level APIs.
- Epics receive dependencies instead of importing infrastructure.
- Heavy route state can be injected when needed.

Keep this message visible in the README and in the code organization.
