import {
  calculateScenarioRange,
  completeScenarioResult,
  createScenarioAccumulator,
} from '../model/calculateScenario';
import type { ScenarioInput } from '../model/analyticsTypes';
import type { WorkerRequest, WorkerResponse } from './workerProtocol';

type WorkerScope = {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse): void;
};

const workerScope = self as unknown as WorkerScope;
const cancelledRequests = new Set<string>();

async function runScenario(
  requestId: string,
  input: ScenarioInput,
): Promise<void> {
  const accumulator = createScenarioAccumulator();
  const chunkSize = 1_500;

  try {
    for (
      let startIndex = 0;
      startIndex < input.positionCount;
      startIndex += chunkSize
    ) {
      if (cancelledRequests.has(requestId)) {
        workerScope.postMessage({
          type: 'scenario.cancelled',
          requestId,
        });
        return;
      }

      const endIndex = Math.min(startIndex + chunkSize, input.positionCount);

      calculateScenarioRange(input, startIndex, endIndex, accumulator);

      workerScope.postMessage({
        type: 'scenario.progress',
        requestId,
        progress: {
          completed: endIndex,
          total: input.positionCount,
          percent: Math.round((endIndex / input.positionCount) * 100),
        },
      });
    }

    workerScope.postMessage({
      type: 'scenario.completed',
      requestId,
      result: completeScenarioResult(input, accumulator),
    });
  } catch (error) {
    workerScope.postMessage({
      type: 'scenario.failed',
      requestId,
      errorMessage:
        error instanceof Error ? error.message : 'Worker calculation failed.',
    });
  } finally {
    cancelledRequests.delete(requestId);
  }
}

workerScope.onmessage = (event) => {
  if (event.data.type === 'scenario.cancel') {
    cancelledRequests.add(event.data.requestId);
    return;
  }

  void runScenario(event.data.requestId, event.data.input);
};
