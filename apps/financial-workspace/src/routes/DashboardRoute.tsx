import { DashboardEntry } from '@demo/feature-dashboard';
import { WorkspaceStatusEntry } from '@demo/feature-workspace-status';

export function DashboardRoute() {
  return (
    <div className="dashboard-stack">
      <DashboardEntry />
      <section className="page-section">
        <div>
          <p className="eyebrow">Optional Facade Demo</p>
          <h1>Pure External Store</h1>
        </div>
        <WorkspaceStatusEntry />
      </section>
    </div>
  );
}
