import type { ReportType } from '../model/reportsSlice';

type ReportFiltersProps = {
  selectedReportType: ReportType;
  portfolioId: string;
  reportTypes: ReportType[];
  onReportTypeChange: (reportType: ReportType) => void;
  onPortfolioFilterChange: (portfolioId: string) => void;
};

export function ReportFilters({
  selectedReportType,
  portfolioId,
  reportTypes,
  onReportTypeChange,
  onPortfolioFilterChange,
}: ReportFiltersProps) {
  return (
    <article className="workspace-panel">
      <h2>Report Filters</h2>
      <label className="form-field">
        <span>Report type</span>
        <select
          value={selectedReportType}
          onChange={(event) =>
            onReportTypeChange(event.target.value as ReportType)
          }
        >
          {reportTypes.map((reportType) => (
            <option key={reportType} value={reportType}>
              {reportType}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field">
        <span>Portfolio filter</span>
        <input
          value={portfolioId}
          onChange={(event) => onPortfolioFilterChange(event.target.value)}
          placeholder="PF-001"
        />
      </label>
    </article>
  );
}
