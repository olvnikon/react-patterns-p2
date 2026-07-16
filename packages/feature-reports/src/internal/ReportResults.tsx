import type { ReportsViewState } from '../model/reportsSelectors';

type ReportResultsProps = {
  state: ReportsViewState;
  onGenerate: () => void;
  onReset: () => void;
};

export function ReportResults({
  state,
  onGenerate,
  onReset,
}: ReportResultsProps) {
  const isGenerating = state.generationStatus === 'generating';

  return (
    <article className="workspace-panel">
      <h2>Generated Report</h2>
      <dl>
        <div>
          <dt>Selected report</dt>
          <dd>{state.selectedReportType}</dd>
        </div>
        <div>
          <dt>Portfolio</dt>
          <dd>{state.portfolioId || 'All demo portfolios'}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{state.statusLabel}</dd>
        </div>
        <div>
          <dt>Report ID</dt>
          <dd>{state.generatedReportLabel}</dd>
        </div>
      </dl>
      <div className="approval-actions">
        <button type="button" disabled={isGenerating} onClick={onGenerate}>
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
        <button type="button" onClick={onReset}>
          Reset
        </button>
      </div>
    </article>
  );
}
