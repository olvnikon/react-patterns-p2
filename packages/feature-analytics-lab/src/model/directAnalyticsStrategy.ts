import { calculateScenario } from './calculateScenario';
import type {
  CalculateScenarioOptions,
  PortfolioAnalytics,
  ScenarioInput,
  ScenarioResult,
} from './analyticsTypes';

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException('Calculation cancelled.', 'AbortError');
  }
}

export function createDirectAnalyticsStrategy(): PortfolioAnalytics {
  return {
    strategyName: 'direct',
    async calculateScenario(
      input: ScenarioInput,
      options: CalculateScenarioOptions = {},
    ): Promise<ScenarioResult> {
      throwIfAborted(options.signal);

      const result = calculateScenario(input);

      throwIfAborted(options.signal);
      options.onProgress?.({
        completed: input.positionCount,
        total: input.positionCount,
        percent: 100,
      });

      return result;
    },
    dispose() {
      // The direct Strategy owns no external resources.
    },
  };
}
