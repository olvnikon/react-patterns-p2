import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export const reportsReducerKey = 'reports';

export type ReportType =
  | 'Monthly Exposure Report'
  | 'Portfolio Activity Report'
  | 'Approval Summary Report';

export type ReportsGenerationStatus =
  | 'idle'
  | 'generating'
  | 'ready'
  | 'failed';

export type ReportsState = {
  selectedReportType: ReportType;
  portfolioId: string;
  generationStatus: ReportsGenerationStatus;
  generatedReportId?: string;
};

export const reportTypes: ReportType[] = [
  'Monthly Exposure Report',
  'Portfolio Activity Report',
  'Approval Summary Report',
];

export const initialReportsState: ReportsState = {
  selectedReportType: 'Monthly Exposure Report',
  portfolioId: 'PF-001',
  generationStatus: 'idle',
};

const reportsSlice = createSlice({
  name: reportsReducerKey,
  initialState: initialReportsState,
  reducers: {
    reportsReportTypeChanged(state, action: PayloadAction<ReportType>) {
      state.selectedReportType = action.payload;
      state.generationStatus = 'idle';
      state.generatedReportId = undefined;
    },

    reportsPortfolioFilterChanged(state, action: PayloadAction<string>) {
      state.portfolioId = action.payload;
      state.generationStatus = 'idle';
      state.generatedReportId = undefined;
    },

    reportsGenerateRequested(state) {
      state.generationStatus = 'generating';
      state.generatedReportId = undefined;
    },

    reportsGenerateSucceeded(state) {
      state.generationStatus = 'ready';
      state.generatedReportId = 'RPT-DEMO-001';
    },

    reportsGenerateFailed(state) {
      state.generationStatus = 'failed';
      state.generatedReportId = undefined;
    },

    reportsReset() {
      return initialReportsState;
    },
  },
});

export const reportsReducer = reportsSlice.reducer;

export const {
  reportsGenerateFailed,
  reportsGenerateRequested,
  reportsGenerateSucceeded,
  reportsPortfolioFilterChanged,
  reportsReportTypeChanged,
  reportsReset,
} = reportsSlice.actions;
