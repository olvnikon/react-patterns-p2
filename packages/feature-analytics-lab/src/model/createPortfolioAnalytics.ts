import type {
  AnalyticsStrategyName,
  PortfolioAnalytics,
} from './analyticsTypes';
import { createDirectAnalyticsStrategy } from './directAnalyticsStrategy';
import { createWorkerAnalyticsStrategy } from './workerAnalyticsStrategy';
import { createWorkerScenarioClient } from '../worker/createWorkerScenarioClient';

export function createPortfolioAnalytics(
  strategyName: AnalyticsStrategyName,
): PortfolioAnalytics {
  switch (strategyName) {
    case 'direct':
      return createDirectAnalyticsStrategy();
    case 'worker':
      return createWorkerAnalyticsStrategy(createWorkerScenarioClient());
  }
}
