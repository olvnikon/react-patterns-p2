import { AppShell } from '@demo/ui-layouts';
import {
  NavLink,
  Outlet,
  createBrowserRouter,
} from 'react-router-dom';

import type { ApplicationDiagnostics } from '../composition/applicationTypes';
import type { PortfolioAnalytics } from '@demo/feature-analytics-lab';
import { AnalyticsRoute } from '../routes/AnalyticsRoute';
import { DashboardRoute } from '../routes/DashboardRoute';
import { OrderApprovalRoute } from '../routes/OrderApprovalRoute';
import { OrdersRoute } from '../routes/OrdersRoute';
import { StartupRoute } from '../routes/StartupRoute';
import type { AppStore } from './store/configureAppStore';

function RootLayout() {
  return (
    <AppShell
      title="Financial Workspace"
      subtitle="Generic React architecture showcase"
      navigation={
        <nav className="app-navigation" aria-label="Primary">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/orders/ORD-1001/approval">Approval</NavLink>
          <NavLink to="/reports">Reports</NavLink>
          <NavLink to="/startup">Part 2</NavLink>
          <NavLink to="/analytics">Analytics</NavLink>
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
};

export function createAppRouter({
  store,
  diagnostics,
  analytics,
}: CreateRouterInput) {
  return createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
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
            const reportsRoute = await import('../routes/ReportsRoute');

            reportsRoute.injectReportsReducer(store);

            return {
              Component: reportsRoute.ReportsRoute,
            };
          },
        },
        {
          path: 'startup',
          element: <StartupRoute diagnostics={diagnostics} />,
        },
        {
          path: 'analytics',
          element: <AnalyticsRoute analytics={analytics} />,
        },
      ],
    },
  ]);
}
