import { formatStatus } from '@demo/shared-formatting';

import {
  initialReportsState,
  reportTypes,
  type ReportsState,
} from './reportsSlice';

export type ReportsRootState = {
  reports?: ReportsState;
};

export type ReportsViewState = ReportsState & {
  availableReportTypes: typeof reportTypes;
  statusLabel: string;
  generatedReportLabel: string;
};

export function selectReportsState(state: ReportsRootState): ReportsState {
  return state.reports ?? initialReportsState;
}

export function selectReportsView(state: ReportsRootState): ReportsViewState {
  const reportsState = selectReportsState(state);

  return {
    ...reportsState,
    availableReportTypes: reportTypes,
    statusLabel: formatStatus(reportsState.generationStatus),
    generatedReportLabel: reportsState.generatedReportId ?? 'Not generated',
  };
}
