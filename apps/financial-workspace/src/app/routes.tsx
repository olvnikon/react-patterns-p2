import { AppShell } from '@demo/ui-layouts';
import {
  useSyncExternalStore,
} from 'react';
import {
  NavLink,
  Outlet,
  createBrowserRouter,
} from 'react-router-dom';

import type { ApplicationDiagnostics } from '../composition/applicationTypes';
import type { PortfolioAnalytics } from '@demo/feature-analytics-lab';
import type {
  ExternalContextSource,
  OrderTicketLogic,
  WorkflowWorkspaceLogic,
} from '@demo/feature-workflow-lab';
import { DashboardRoute } from '../routes/DashboardRoute';
import { OrderApprovalRoute } from '../routes/OrderApprovalRoute';
import { OrdersRoute } from '../routes/OrdersRoute';
import { StartupRoute } from '../routes/StartupRoute';
import {
  createIntentHandlers,
  type PreloadRegistry,
} from '../prefetch';
import type { PrefetchMode } from '../runtime';
import { ArchitectureRoute } from '../routes/ArchitectureRoute';
import {
  loadAnalyticsRoute,
  loadPanelsRoute,
  loadReportsRoute,
  loadWorkflowsRoute,
} from '../routes/routeModules';
import type { AppStore } from './store/configureAppStore';

function IntentNavLink({
  to,
  children,
  preloaderId,
  prefetch,
  prefetchMode,
}: {
  to: string;
  children: string;
  preloaderId?: string;
  prefetch: PreloadRegistry;
  prefetchMode: PrefetchMode;
}) {
  const prefetchSnapshot = useSyncExternalStore(
    prefetch.subscribe,
    prefetch.getSnapshot,
  );
  const status = preloaderId
    ? prefetchSnapshot.find((entry) => entry.id === preloaderId)?.status
    : undefined;
  const intentHandlers = preloaderId
    ? createIntentHandlers(prefetch, preloaderId, prefetchMode)
    : {};

  return (
    <NavLink to={to} {...intentHandlers}>
      {children}
      {status ? (
        <span
          className={`prefetch-indicator prefetch-indicator--${status}`}
          title={`Prefetch: ${status}`}
          aria-label={`Prefetch ${status}`}
        />
      ) : null}
    </NavLink>
  );
}

function RootLayout({
  prefetch,
  prefetchMode,
}: {
  prefetch: PreloadRegistry;
  prefetchMode: PrefetchMode;
}) {
  return (
    <AppShell
      title="Financial Workspace"
      subtitle="Generic React architecture showcase"
      navigation={
        <nav className="app-navigation" aria-label="Primary">
          <div className="app-navigation__group">
            <span className="app-navigation__label">Part 1</span>
            <NavLink to="/" end>
              Dashboard
            </NavLink>
            <NavLink to="/orders">Orders</NavLink>
            <NavLink to="/orders/ORD-1001/approval">Approval</NavLink>
            <IntentNavLink
              to="/reports"
              preloaderId="route:reports"
              prefetch={prefetch}
              prefetchMode={prefetchMode}
            >
              Reports
            </IntentNavLink>
          </div>
          <div className="app-navigation__group">
            <span className="app-navigation__label">Part 2</span>
            <NavLink to="/architecture">Map</NavLink>
            <NavLink to="/startup">Startup</NavLink>
            <IntentNavLink
              to="/workflows"
              preloaderId="route:workflows"
              prefetch={prefetch}
              prefetchMode={prefetchMode}
            >
              Workflows
            </IntentNavLink>
            <IntentNavLink
              to="/analytics"
              preloaderId="route:analytics"
              prefetch={prefetch}
              prefetchMode={prefetchMode}
            >
              Analytics
            </IntentNavLink>
            <IntentNavLink
              to="/panels"
              preloaderId="route:panels"
              prefetch={prefetch}
              prefetchMode={prefetchMode}
            >
              Panels
            </IntentNavLink>
          </div>
        </nav>
      }
    >
      <Outlet />
    </AppShell>
  );
}

function NotFoundRoute() {
  return (
    <section className="page-section">
      <p className="eyebrow">Not found</p>
      <h1>Route unavailable</h1>
      <p>The requested workspace route is not part of this demo shell.</p>
    </section>
  );
}

type CreateRouterInput = {
  store: AppStore;
  diagnostics: ApplicationDiagnostics;
  analytics: PortfolioAnalytics;
  orderTicketLogic: OrderTicketLogic;
  workflowWorkspaceLogic: WorkflowWorkspaceLogic;
  externalContextSource: ExternalContextSource;
  prefetch: PreloadRegistry;
  prefetchMode: PrefetchMode;
};

export function createAppRouter({
  store,
  diagnostics,
  analytics,
  orderTicketLogic,
  workflowWorkspaceLogic,
  externalContextSource,
  prefetch,
  prefetchMode,
}: CreateRouterInput) {
  return createBrowserRouter([
    {
      path: '/',
      element: (
        <RootLayout
          prefetch={prefetch}
          prefetchMode={prefetchMode}
        />
      ),
      errorElement: <NotFoundRoute />,
      children: [
        {
          index: true,
          element: <DashboardRoute />,
        },
        {
          path: 'orders',
          element: <OrdersRoute />,
        },
        {
          path: 'orders/:orderId/approval',
          element: <OrderApprovalRoute />,
        },
        {
          path: 'reports',
          lazy: async () => {
            const reportsRoute = await loadReportsRoute();

            reportsRoute.injectReportsReducer(store);

            return {
              Component: reportsRoute.ReportsRoute,
            };
          },
        },
        {
          path: 'architecture',
          element: <ArchitectureRoute />,
        },
        {
          path: 'startup',
          element: <StartupRoute diagnostics={diagnostics} />,
        },
        {
          path: 'analytics',
          lazy: async () => {
            const analyticsRoute = await loadAnalyticsRoute();

            return {
              Component: function AnalyticsRouteComponent() {
                return (
                  <analyticsRoute.AnalyticsRoute analytics={analytics} />
                );
              },
            };
          },
        },
        {
          path: 'workflows',
          lazy: async () => {
            const workflowsRoute = await loadWorkflowsRoute();

            return {
              Component: function WorkflowsRouteComponent() {
                return (
                  <workflowsRoute.WorkflowsRoute
                    orderTicketLogic={orderTicketLogic}
                    workflowWorkspaceLogic={workflowWorkspaceLogic}
                    externalContextSource={externalContextSource}
                  />
                );
              },
            };
          },
        },
        {
          path: 'panels',
          lazy: async () => {
            const panelsRoute = await loadPanelsRoute();

            return {
              Component: function PanelsRouteComponent() {
                return (
                  <panelsRoute.PanelsRoute
                    prefetch={prefetch}
                    prefetchMode={prefetchMode}
                  />
                );
              },
            };
          },
        },
      ],
    },
  ]);
}
