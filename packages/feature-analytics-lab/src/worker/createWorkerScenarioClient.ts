import type {
  CalculateScenarioOptions,
  ScenarioInput,
  ScenarioResult,
} from '../model/analyticsTypes';
import type {
  WorkerRequest,
  WorkerResponse,
} from './workerProtocol';

type PendingRequest = {
  resolve(result: ScenarioResult): void;
  reject(error: unknown): void;
  onProgress: CalculateScenarioOptions['onProgress'];
  removeAbortListener(): void;
};

export type WorkerScenarioClient = {
  calculate(
    input: ScenarioInput,
    options?: CalculateScenarioOptions,
  ): Promise<ScenarioResult>;
  dispose(): void;
};

function createAbortError() {
  return new DOMException('Calculation cancelled.', 'AbortError');
}

export function createWorkerScenarioClient(): WorkerScenarioClient {
  // Request IDs correlate concurrent Worker messages with their Promises.
  const pendingRequests = new Map<string, PendingRequest>();
  let worker: Worker | undefined;

  function rejectAll(error: unknown) {
    for (const request of pendingRequests.values()) {
      request.removeAbortListener();
      request.reject(error);
    }

    pendingRequests.clear();
  }

  function ensureWorker(): Worker {
    if (worker) {
      return worker;
    }

    // Create the Worker lazily so unused analytics costs nothing at startup.
    worker = new Worker(new URL('./scenario.worker.ts', import.meta.url), {
      type: 'module',
      name: 'synthetic-portfolio-analytics',
    });

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const request = pendingRequests.get(event.data.requestId);

      if (!request) {
        return;
      }

      if (event.data.type === 'scenario.progress') {
        request.onProgress?.(event.data.progress);
        return;
      }

      request.removeAbortListener();
      pendingRequests.delete(event.data.requestId);

      if (event.data.type === 'scenario.completed') {
        request.resolve(event.data.result);
        return;
      }

      if (event.data.type === 'scenario.cancelled') {
        request.reject(createAbortError());
        return;
      }

      request.reject(new Error(event.data.errorMessage));
    };

    worker.onerror = () => {
      rejectAll(new Error('The analytics Worker stopped unexpectedly.'));
      worker?.terminate();
      worker = undefined;
    };

    return worker;
  }

  return {
    calculate(
      input: ScenarioInput,
      options: CalculateScenarioOptions = {},
    ): Promise<ScenarioResult> {
      if (options.signal?.aborted) {
        return Promise.reject(createAbortError());
      }

      const activeWorker = ensureWorker();
      const requestId = crypto.randomUUID();

      return new Promise((resolve, reject) => {
        const abort = () => {
          // Cancellation is an explicit protocol message across the thread boundary.
          const message: WorkerRequest = {
            type: 'scenario.cancel',
            requestId,
          };

          activeWorker.postMessage(message);
          pendingRequests.delete(requestId);
          reject(createAbortError());
        };

        options.signal?.addEventListener('abort', abort, {
          once: true,
        });

        pendingRequests.set(requestId, {
          resolve,
          reject,
          onProgress: options.onProgress,
          removeAbortListener() {
            options.signal?.removeEventListener('abort', abort);
          },
        });

        const message: WorkerRequest = {
          type: 'scenario.run',
          requestId,
          input,
        };

        activeWorker.postMessage(message);
      });
    },
    dispose() {
      // Reject callers before terminating the application-owned Worker.
      rejectAll(new Error('Analytics capability disposed.'));
      worker?.terminate();
      worker = undefined;
    },
  };
}
