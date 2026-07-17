import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  AnalyticsStrategyName,
  ContextProviderName,
} from '../../runtime';

export const bootstrapDataReducerKey = 'bootstrapData';

export type BootstrapDataState = {
  startedAt?: string;
  runtimeConfig?: {
    analyticsStrategy: AnalyticsStrategyName;
    contextProvider: ContextProviderName;
  };
  platformContext?: {
    provider: string;
    instrumentId: string;
  };
  session?: {
    userId: string;
    deskId: string;
  };
  referenceData?: {
    instruments: string[];
    portfolios: string[];
  };
  workspace?: {
    selectedPortfolioId: string;
    layout: string;
  };
  mainViewReady: boolean;
  marketData?: {
    status: 'connected';
    connectedAt: string;
  };
  analyticsWarmup?: {
    strategy: AnalyticsStrategyName;
    completedAt: string;
  };
};

const initialState: BootstrapDataState = {
  mainViewReady: false,
};

const bootstrapDataSlice = createSlice({
  name: bootstrapDataReducerKey,
  initialState,
  reducers: {
    bootstrapDataReset: () => initialState,
    bootstrapStarted(
      state,
      action: PayloadAction<{
        startedAt: string;
        runtimeConfig: NonNullable<BootstrapDataState['runtimeConfig']>;
      }>,
    ) {
      state.startedAt = action.payload.startedAt;
      state.runtimeConfig = action.payload.runtimeConfig;
    },
    platformContextInitialized(
      state,
      action: PayloadAction<
        NonNullable<BootstrapDataState['platformContext']>
      >,
    ) {
      state.platformContext = action.payload;
    },
    sessionLoaded(
      state,
      action: PayloadAction<NonNullable<BootstrapDataState['session']>>,
    ) {
      state.session = action.payload;
    },
    referenceDataLoaded(
      state,
      action: PayloadAction<
        NonNullable<BootstrapDataState['referenceData']>
      >,
    ) {
      state.referenceData = action.payload;
    },
    workspaceRestored(
      state,
      action: PayloadAction<NonNullable<BootstrapDataState['workspace']>>,
    ) {
      state.workspace = action.payload;
    },
    bootstrapMainViewReady(state) {
      state.mainViewReady = true;
    },
    marketDataConnected(
      state,
      action: PayloadAction<NonNullable<BootstrapDataState['marketData']>>,
    ) {
      state.marketData = action.payload;
    },
    analyticsWarmed(
      state,
      action: PayloadAction<
        NonNullable<BootstrapDataState['analyticsWarmup']>
      >,
    ) {
      state.analyticsWarmup = action.payload;
    },
  },
});

export const bootstrapDataReducer = bootstrapDataSlice.reducer;

export const {
  analyticsWarmed,
  bootstrapDataReset,
  bootstrapMainViewReady,
  bootstrapStarted,
  marketDataConnected,
  platformContextInitialized,
  referenceDataLoaded,
  sessionLoaded,
  workspaceRestored,
} = bootstrapDataSlice.actions;
