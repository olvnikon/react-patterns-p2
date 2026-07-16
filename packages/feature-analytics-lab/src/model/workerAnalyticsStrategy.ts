import type {
  CalculateScenarioOptions,
  PortfolioAnalytics,
  ScenarioInput,
  ScenarioResult,
} from './analyticsTypes';
import type { WorkerScenarioClient } from '../worker/createWorkerScenarioClient';

export function createWorkerAnalyticsStrategy(
  client: WorkerScenarioClient,
): PortfolioAnalytics {
  return {
    strategyName: 'worker',
    calculateScenario(
      input: ScenarioInput,
      options?: CalculateScenarioOptions,
    ): Promise<ScenarioResult> {
      return client.calculate(input, options);
    },
    dispose() {
      client.dispose();
    },
  };
}
