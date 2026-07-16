import { AppShell } from '@demo/ui-layouts';
import {
  NavLink,
  Outlet,
  createBrowserRouter,
} from 'react-router-dom';

import { DashboardRoute } from '../routes/DashboardRoute';
import { OrderApprovalRoute } from '../routes/OrderApprovalRoute';
import { OrdersRoute } from '../routes/OrdersRoute';

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

export const router = createBrowserRouter([
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

          reportsRoute.injectReportsReducer();

          return {
            Component: reportsRoute.ReportsRoute,
          };
        },
      },
    ],
  },
]);
