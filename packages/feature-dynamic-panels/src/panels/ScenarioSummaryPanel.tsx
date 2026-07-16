import type {
  DynamicPanelProps,
  ScenarioPanelConfig,
} from '../model/panelTypes';

export default function ScenarioSummaryPanel({
  config,
}: DynamicPanelProps) {
  const scenarioConfig = config as ScenarioPanelConfig;

  if (scenarioConfig.mode === 'render-failure') {
    throw new Error('Synthetic panel rendering failure.');
  }

  const degraded = scenarioConfig.mode === 'degraded';

  return (
    <article
      className={
        degraded
          ? 'dynamic-panel dynamic-panel--degraded'
          : 'dynamic-panel'
      }
    >
      <div className="dynamic-panel__heading">
        <div>
          <p className="eyebrow">Optional capability</p>
          <h2>Scenario Summary</h2>
        </div>
        <span
          className={`status-chip status-chip--${
            degraded ? 'degraded' : 'ready'
          }`}
        >
          {degraded ? 'Degraded' : 'Ready'}
        </span>
      </div>
      <p>Portfolio: {scenarioConfig.portfolioId}</p>
      {degraded ? (
        <p className="workflow-warning">
          Detailed analytics are unavailable. A safe summary remains visible,
          and scenario actions are disabled.
        </p>
      ) : (
        <p>
          Synthetic scenario summary is available. No real financial
          calculation is performed.
        </p>
      )}
      <button type="button" disabled={degraded}>
        Open scenario details
      </button>
    </article>
  );
}
