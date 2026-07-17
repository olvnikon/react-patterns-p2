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
      // Threading remains hidden behind the stable Strategy contract.
      return client.calculate(input, options);
    },
    dispose() {
      client.dispose();
    },
  };
}
