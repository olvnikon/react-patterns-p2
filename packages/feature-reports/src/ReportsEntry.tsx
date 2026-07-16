import { ReportsView } from './internal/ReportsView';
import { useReports } from './react/useReports';

export function ReportsEntry() {
  const { state, api } = useReports();

  return (
    <ReportsView
      state={state}
      onReportTypeChange={api.changeReportType}
      onPortfolioFilterChange={api.changePortfolioFilter}
      onGenerate={api.generate}
      onReset={api.reset}
    />
  );
}
