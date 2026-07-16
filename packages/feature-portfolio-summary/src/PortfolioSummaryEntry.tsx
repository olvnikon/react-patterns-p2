type PortfolioSummaryEntryProps = {
  selectedPortfolioId: string;
};

export function PortfolioSummaryEntry({
  selectedPortfolioId,
}: PortfolioSummaryEntryProps) {
  return (
    <>
      <article className="workspace-panel">
        <h2>Portfolio Summary</h2>
        <dl>
          <div>
            <dt>Portfolio</dt>
            <dd>{selectedPortfolioId}</dd>
          </div>
          <div>
            <dt>View</dt>
            <dd>Default</dd>
          </div>
        </dl>
      </article>
      <article className="workspace-panel">
        <h2>Saved Views</h2>
        <ul className="placeholder-list">
          <li>
            <span>Desk Orders</span>
            <strong>Active</strong>
          </li>
          <li>
            <span>Monthly Exposure Report</span>
            <strong>Saved</strong>
          </li>
        </ul>
      </article>
    </>
  );
}
