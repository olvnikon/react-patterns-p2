import { createActor, type ActorRefFrom, type Subscription } from 'xstate';

import type { BootstrapProfile } from '../runtime';
import { createBootstrapMachine } from './createBootstrapMachine';
import type { BootstrapOperations } from './createBootstrapOperations';
import type {
  BootstrapRuntime,
  BootstrapSnapshot,
  BootstrapStatus,
  BootstrapTaskId,
} from './bootstrapTypes';

type BootstrapMachine = ReturnType<typeof createBootstrapMachine>;
type BootstrapActor = ActorRefFrom<BootstrapMachine>;

function projectSnapshot(actor: BootstrapActor): BootstrapSnapshot {
  // Project the actor tree into one presenter-friendly readiness model.
  const actorSnapshot = actor.getSnapshot();
  const tasks = Object.values(actorSnapshot.context.tasks);
  const criticalFailure = tasks.some(
    (task) => task.critical && task.status === 'failed',
  );
  const optionalFailure = tasks.some(
    (task) => !task.critical && task.status === 'failed',
  );
  const allOptionalReady = tasks
    .filter((task) => !task.critical)
    .every((task) => task.status === 'ready');

  let status: BootstrapStatus = 'idle';

  if (criticalFailure) {
    status = 'failed';
  } else if (actorSnapshot.context.mainViewReady && optionalFailure) {
    status = 'degraded';
  } else if (actorSnapshot.context.mainViewReady && allOptionalReady) {
    status = 'ready';
  } else if (actorSnapshot.context.mainViewReady) {
    status = 'main-ready';
  } else if (tasks.some((task) => task.status === 'running')) {
    status = 'running';
  }

  return {
    profile: actorSnapshot.context.profile,
    status,
    mainViewReady: actorSnapshot.context.mainViewReady,
    tasks: tasks.map((task) => ({ ...task })),
  };
}

// This is needed for the demo to be able to replay the bootstrap process with a different profile
export function createBootstrapRuntime(
  initialProfile: BootstrapProfile,
  operations: BootstrapOperations,
): BootstrapRuntime {
  const bootstrapMachine = createBootstrapMachine(operations);
  const listeners = new Set<() => void>();
  let actor: BootstrapActor;
  let actorSubscription: Subscription | undefined;
  let currentSnapshot: BootstrapSnapshot;

  function emit() {
    currentSnapshot = projectSnapshot(actor);

    for (const listener of listeners) {
      listener();
    }
  }

  function createAndBindActor(profile: BootstrapProfile) {
    actorSubscription?.unsubscribe();
    actor.stop();

    actor = createActor(bootstrapMachine, {
      input: {
        profile,
      },
    });
    currentSnapshot = projectSnapshot(actor);
    actorSubscription = actor.subscribe(emit);
  }

  operations.reset();
  actor = createActor(bootstrapMachine, {
    input: {
      profile: initialProfile,
    },
  });
  currentSnapshot = projectSnapshot(actor);
  actorSubscription = actor.subscribe(emit);

  return {
    getSnapshot() {
      return currentSnapshot;
    },
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    start() {
      actor.start();
    },
    waitUntilMainViewReady() {
      // Application startup awaits this gate; optional work may continue later.
      return new Promise<void>((resolve, reject) => {
        function inspect() {
          if (currentSnapshot.mainViewReady) {
            unsubscribe();
            resolve();
            return;
          }

          const criticalFailure = currentSnapshot.tasks.find(
            (task) => task.critical && task.status === 'failed',
          );

          if (criticalFailure) {
            unsubscribe();
            reject(
              new Error(
                `${criticalFailure.label} failed: ${criticalFailure.errorMessage ?? 'Unknown error'}`,
              ),
            );
          }
        }

        const unsubscribe = this.subscribe(inspect);
        inspect();
      });
    },
    retry(taskId: BootstrapTaskId) {
      actor.send({
        type: 'RETRY_TASK',
        taskId,
      });
    },
    replay(profile) {
      // Replay replaces only the diagnostic actor, keeping the mounted demo alive.
      operations.reset();
      createAndBindActor(profile);
      emit();
      actor.start();
    },
    stop() {
      actorSubscription?.unsubscribe();
      actor.stop();
      listeners.clear();
    },
  };
}
