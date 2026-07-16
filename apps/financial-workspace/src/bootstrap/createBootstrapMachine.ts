import {
  assign,
  fromPromise,
  setup,
} from 'xstate';

import type { BootstrapProfile } from '../runtime';
import { bootstrapTaskDefinitions } from './bootstrapTasks';
import type {
  BootstrapTaskId,
  BootstrapTaskSnapshot,
} from './bootstrapTypes';

type BootstrapContext = {
  profile: BootstrapProfile;
  mainViewReady: boolean;
  tasks: Record<BootstrapTaskId, BootstrapTaskSnapshot>;
};

type BootstrapInput = {
  profile: BootstrapProfile;
};

type BootstrapEvent = {
  type: 'RETRY_TASK';
  taskId: BootstrapTaskId;
};

type RunTaskInput = {
  taskId: BootstrapTaskId;
  profile: BootstrapProfile;
  attempt: number;
};

function createInitialTasks(): Record<
  BootstrapTaskId,
  BootstrapTaskSnapshot
> {
  return Object.fromEntries(
    Object.values(bootstrapTaskDefinitions).map((definition) => [
      definition.id,
      {
        ...definition,
        status: definition.id === 'runtimeConfig' ? 'ready' : 'idle',
        attempts: definition.id === 'runtimeConfig' ? 1 : 0,
      },
    ]),
  ) as Record<BootstrapTaskId, BootstrapTaskSnapshot>;
}

function updateTask(
  context: BootstrapContext,
  taskId: BootstrapTaskId,
  update: Partial<BootstrapTaskSnapshot>,
): BootstrapContext['tasks'] {
  return {
    ...context.tasks,
    [taskId]: {
      ...context.tasks[taskId],
      ...update,
    },
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Bootstrap task failed.';
}

function taskDelay(
  taskId: BootstrapTaskId,
  profile: BootstrapProfile,
): number {
  const baseDelays: Record<BootstrapTaskId, number> = {
    runtimeConfig: 0,
    infrastructure: 160,
    platformContext: 220,
    session: 170,
    referenceData: 260,
    workspaceState: 190,
    mainView: 120,
    marketData: 360,
    analyticsWarmup: 440,
  };

  return profile === 'slow-startup'
    ? baseDelays[taskId] * 3
    : baseDelays[taskId];
}

function wait(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(resolve, milliseconds);

    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeout);
        reject(new DOMException('Bootstrap task cancelled.', 'AbortError'));
      },
      { once: true },
    );
  });
}

async function runTask({
  input,
  signal,
}: {
  input: RunTaskInput;
  signal: AbortSignal;
}) {
  await wait(taskDelay(input.taskId, input.profile), signal);

  if (
    input.profile === 'critical-failure' &&
    input.taskId === 'referenceData' &&
    input.attempt === 1
  ) {
    throw new Error('Synthetic critical reference-data failure.');
  }

  if (
    input.profile === 'optional-failure' &&
    input.taskId === 'analyticsWarmup' &&
    input.attempt === 1
  ) {
    throw new Error('Synthetic optional analytics warmup failure.');
  }
}

function markRunning(taskId: BootstrapTaskId) {
  return {
    type: 'markRunning' as const,
    params: {
      taskId,
    },
  };
}

function markReady(taskId: BootstrapTaskId) {
  return {
    type: 'markReady' as const,
    params: {
      taskId,
    },
  };
}

function markFailed(taskId: BootstrapTaskId) {
  return {
    type: 'markFailed' as const,
    params: {
      taskId,
    },
  };
}

function taskInput(taskId: BootstrapTaskId) {
  return ({ context }: { context: BootstrapContext }): RunTaskInput => ({
    taskId,
    profile: context.profile,
    attempt: context.tasks[taskId].attempts,
  });
}

function retries(taskId: BootstrapTaskId) {
  return ({ event }: { event: BootstrapEvent }) =>
    event.type === 'RETRY_TASK' && event.taskId === taskId;
}

export const bootstrapMachine = setup({
  types: {
    context: {} as BootstrapContext,
    input: {} as BootstrapInput,
    events: {} as BootstrapEvent,
  },
  actors: {
    runTask: fromPromise(runTask),
  },
  actions: {
    markRunning: assign(
      (
        { context },
        params: {
          taskId: BootstrapTaskId;
        },
      ) => ({
        tasks: updateTask(context, params.taskId, {
          status: 'running',
          attempts: context.tasks[params.taskId].attempts + 1,
          errorMessage: undefined,
        }),
      }),
    ),
    markReady: assign(
      (
        { context },
        params: {
          taskId: BootstrapTaskId;
        },
      ) => ({
        tasks: updateTask(context, params.taskId, {
          status: 'ready',
          errorMessage: undefined,
        }),
      }),
    ),
    markFailed: assign(
      (
        { context, event },
        params: {
          taskId: BootstrapTaskId;
        },
      ) => ({
        tasks: updateTask(context, params.taskId, {
          status: 'failed',
          errorMessage: getErrorMessage(
            'error' in event ? event.error : undefined,
          ),
        }),
      }),
    ),
  },
}).createMachine({
  id: 'applicationBootstrap',
  initial: 'critical',
  context: ({ input }) => ({
    profile: input.profile,
    mainViewReady: false,
    tasks: createInitialTasks(),
  }),
  states: {
    critical: {
      type: 'parallel',
      states: {
        platform: {
          initial: 'loading',
          states: {
            loading: {
              entry: markRunning('platformContext'),
              invoke: {
                src: 'runTask',
                input: taskInput('platformContext'),
                onDone: {
                  target: 'ready',
                  actions: markReady('platformContext'),
                },
                onError: {
                  target: 'failed',
                  actions: markFailed('platformContext'),
                },
              },
            },
            failed: {
              on: {
                RETRY_TASK: {
                  guard: retries('platformContext'),
                  target: 'loading',
                },
              },
            },
            ready: {
              type: 'final',
            },
          },
        },
        data: {
          initial: 'infrastructure',
          states: {
            infrastructure: {
              entry: markRunning('infrastructure'),
              invoke: {
                src: 'runTask',
                input: taskInput('infrastructure'),
                onDone: {
                  target: 'session',
                  actions: markReady('infrastructure'),
                },
                onError: {
                  target: 'infrastructureFailed',
                  actions: markFailed('infrastructure'),
                },
              },
            },
            infrastructureFailed: {
              on: {
                RETRY_TASK: {
                  guard: retries('infrastructure'),
                  target: 'infrastructure',
                },
              },
            },
            session: {
              entry: markRunning('session'),
              invoke: {
                src: 'runTask',
                input: taskInput('session'),
                onDone: {
                  target: 'sessionDependencies',
                  actions: markReady('session'),
                },
                onError: {
                  target: 'sessionFailed',
                  actions: markFailed('session'),
                },
              },
            },
            sessionFailed: {
              on: {
                RETRY_TASK: {
                  guard: retries('session'),
                  target: 'session',
                },
              },
            },
            sessionDependencies: {
              type: 'parallel',
              states: {
                referenceData: {
                  initial: 'loading',
                  states: {
                    loading: {
                      entry: markRunning('referenceData'),
                      invoke: {
                        src: 'runTask',
                        input: taskInput('referenceData'),
                        onDone: {
                          target: 'ready',
                          actions: markReady('referenceData'),
                        },
                        onError: {
                          target: 'failed',
                          actions: markFailed('referenceData'),
                        },
                      },
                    },
                    failed: {
                      on: {
                        RETRY_TASK: {
                          guard: retries('referenceData'),
                          target: 'loading',
                        },
                      },
                    },
                    ready: {
                      type: 'final',
                    },
                  },
                },
                workspaceState: {
                  initial: 'loading',
                  states: {
                    loading: {
                      entry: markRunning('workspaceState'),
                      invoke: {
                        src: 'runTask',
                        input: taskInput('workspaceState'),
                        onDone: {
                          target: 'ready',
                          actions: markReady('workspaceState'),
                        },
                        onError: {
                          target: 'failed',
                          actions: markFailed('workspaceState'),
                        },
                      },
                    },
                    failed: {
                      on: {
                        RETRY_TASK: {
                          guard: retries('workspaceState'),
                          target: 'loading',
                        },
                      },
                    },
                    ready: {
                      type: 'final',
                    },
                  },
                },
              },
              onDone: 'ready',
            },
            ready: {
              type: 'final',
            },
          },
        },
      },
      onDone: 'mainView',
    },
    mainView: {
      entry: markRunning('mainView'),
      invoke: {
        src: 'runTask',
        input: taskInput('mainView'),
        onDone: {
          target: 'optional',
          actions: [
            markReady('mainView'),
            assign({
              mainViewReady: true,
            }),
          ],
        },
        onError: {
          target: 'mainViewFailed',
          actions: markFailed('mainView'),
        },
      },
    },
    mainViewFailed: {
      on: {
        RETRY_TASK: {
          guard: retries('mainView'),
          target: 'mainView',
        },
      },
    },
    optional: {
      type: 'parallel',
      states: {
        marketData: {
          initial: 'loading',
          states: {
            loading: {
              entry: markRunning('marketData'),
              invoke: {
                src: 'runTask',
                input: taskInput('marketData'),
                onDone: {
                  target: 'ready',
                  actions: markReady('marketData'),
                },
                onError: {
                  target: 'failed',
                  actions: markFailed('marketData'),
                },
              },
            },
            failed: {
              on: {
                RETRY_TASK: {
                  guard: retries('marketData'),
                  target: 'loading',
                },
              },
            },
            ready: {
              type: 'final',
            },
          },
        },
        analyticsWarmup: {
          initial: 'loading',
          states: {
            loading: {
              entry: markRunning('analyticsWarmup'),
              invoke: {
                src: 'runTask',
                input: taskInput('analyticsWarmup'),
                onDone: {
                  target: 'ready',
                  actions: markReady('analyticsWarmup'),
                },
                onError: {
                  target: 'failed',
                  actions: markFailed('analyticsWarmup'),
                },
              },
            },
            failed: {
              on: {
                RETRY_TASK: {
                  guard: retries('analyticsWarmup'),
                  target: 'loading',
                },
              },
            },
            ready: {
              type: 'final',
            },
          },
        },
      },
      onDone: 'complete',
    },
    complete: {
      type: 'final',
    },
  },
});
