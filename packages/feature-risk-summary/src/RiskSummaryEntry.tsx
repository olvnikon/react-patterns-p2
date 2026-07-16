type RiskSummaryEntryProps = {
  selectedPortfolioId: string;
};

export function RiskSummaryEntry({
  selectedPortfolioId,
}: RiskSummaryEntryProps) {
  return (
    <article className="workspace-panel">
      <h2>Risk Summary</h2>
      <dl>
        <div>
          <dt>Portfolio</dt>
          <dd>{selectedPortfolioId}</dd>
        </div>
        <div>
          <dt>Review level</dt>
          <dd>Normal</dd>
        </div>
        <div>
          <dt>Exposure band</dt>
          <dd>Demo</dd>
        </div>
      </dl>
    </article>
  );
}
