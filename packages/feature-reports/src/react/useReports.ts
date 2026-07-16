import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  selectReportsView,
  type ReportsViewState,
} from '../model/reportsSelectors';
import {
  reportsGenerateRequested,
  reportsGenerateSucceeded,
  reportsPortfolioFilterChanged,
  reportsReportTypeChanged,
  reportsReset,
  type ReportType,
} from '../model/reportsSlice';

type UseReportsResult = {
  state: ReportsViewState;
  api: {
    changeReportType: (reportType: ReportType) => void;
    changePortfolioFilter: (portfolioId: string) => void;
    generate: () => void;
    reset: () => void;
  };
};

export function useReports(): UseReportsResult {
  const dispatch = useDispatch();
  const state = useSelector(selectReportsView);

  useEffect(() => {
    if (state.generationStatus !== 'generating') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch(reportsGenerateSucceeded());
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [dispatch, state.generationStatus]);

  const changeReportType = useCallback(
    (reportType: ReportType) => {
      dispatch(reportsReportTypeChanged(reportType));
    },
    [dispatch],
  );

  const changePortfolioFilter = useCallback(
    (portfolioId: string) => {
      dispatch(reportsPortfolioFilterChanged(portfolioId));
    },
    [dispatch],
  );

  const generate = useCallback(() => {
    dispatch(reportsGenerateRequested());
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch(reportsReset());
  }, [dispatch]);

  const api = useMemo(
    () => ({
      changeReportType,
      changePortfolioFilter,
      generate,
      reset,
    }),
    [changePortfolioFilter, changeReportType, generate, reset],
  );

  return {
    state,
    api,
  };
}
