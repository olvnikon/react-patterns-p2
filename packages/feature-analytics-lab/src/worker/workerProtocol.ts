import type {
  AnalyticsProgress,
  ScenarioInput,
  ScenarioResult,
} from '../model/analyticsTypes';

export type WorkerRequest =
  | {
      type: 'scenario.run';
      requestId: string;
      input: ScenarioInput;
    }
  | {
      type: 'scenario.cancel';
      requestId: string;
    };

export type WorkerResponse =
  | {
      type: 'scenario.progress';
      requestId: string;
      progress: AnalyticsProgress;
    }
  | {
      type: 'scenario.completed';
      requestId: string;
      result: ScenarioResult;
    }
  | {
      type: 'scenario.cancelled';
      requestId: string;
    }
  | {
      type: 'scenario.failed';
      requestId: string;
      errorMessage: string;
    };
