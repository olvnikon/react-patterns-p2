import type {
  DynamicPanelProps,
  PortfolioPanelConfig,
} from '../model/panelTypes';

export default function PortfolioOverviewPanel({
  config,
}: DynamicPanelProps) {
  const portfolioConfig = config as PortfolioPanelConfig;

  return (
    <article className="dynamic-panel">
      <div className="dynamic-panel__heading">
        <div>
          <p className="eyebrow">Required capability</p>
          <h2>Portfolio Overview</h2>
        </div>
        <span className="status-chip status-chip--ready">Ready</span>
      </div>
      <p>Portfolio: {portfolioConfig.portfolioId}</p>
      <dl className="analytics-result-grid">
        <div>
          <dt>Open orders</dt>
          <dd>12</dd>
        </div>
        <div>
          <dt>Saved views</dt>
          <dd>4</dd>
        </div>
      </dl>
    </article>
  );
}
