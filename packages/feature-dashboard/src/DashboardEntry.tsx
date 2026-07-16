const dashboardItems = [
  {
    href: '/orders',
    label: 'Orders',
    value: '12',
    summary: 'Open generic orders',
    pattern: 'Flat composition',
  },
  {
    href: '/orders/ORD-1001/approval',
    label: 'Approvals',
    value: '3',
    summary: 'Pending demo reviews',
    pattern: 'React adapter',
  },
  {
    href: '/reports',
    label: 'Reports',
    value: '5',
    summary: 'Saved generic views',
    pattern: 'Reducer injection',
  },
  {
    href: '/orders',
    label: 'Portfolios',
    value: '2',
    summary: 'Mock portfolios',
    pattern: 'Public APIs',
  },
];

export function DashboardEntry() {
  return (
    <section className="page-section">
      <div>
        <p className="eyebrow">Dashboard</p>
        <h1>Demo Desk Overview</h1>
      </div>
      <div className="pattern-tags" aria-label="Showcase patterns">
        <span className="pattern-tag">Feature packages</span>
        <span className="pattern-tag">Route composition</span>
        <span className="pattern-tag">Redux workflow state</span>
      </div>
      <p>
        Local placeholder data for orders, approvals, reports, and portfolios.
      </p>
      <div className="summary-grid">
        {dashboardItems.map((item) => (
          <a className="summary-card" href={item.href} key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.summary}</p>
            <span className="pattern-tag">{item.pattern}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
