import type {
  PreloadRegistry,
  PreloadRegistrySnapshot,
  PreloadSnapshot,
} from './preloadTypes';

type RegistryEntry = {
  snapshot: PreloadSnapshot;
  load(): Promise<unknown>;
  promise?: Promise<unknown>;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Preload failed.';
}

export function createPreloadRegistry(): PreloadRegistry {
  // One registry lets intent and activation reuse the same Promise.
  const entries = new Map<string, RegistryEntry>();
  const listeners = new Set<() => void>();
  let snapshot: PreloadRegistrySnapshot = [];

  function emit() {
    snapshot = Array.from(entries.values(), (entry) => entry.snapshot);

    for (const listener of listeners) {
      listener();
    }
  }

  function updateEntry(
    entry: RegistryEntry,
    update: Partial<PreloadSnapshot>,
  ) {
    entry.snapshot = {
      ...entry.snapshot,
      ...update,
    };
    emit();
  }

  return {
    register(input) {
      if (entries.has(input.id)) {
        throw new Error(`Preloader "${input.id}" is already registered.`);
      }

      entries.set(input.id, {
        load: input.load,
        snapshot: {
          id: input.id,
          label: input.label,
          status: 'idle',
          attempts: 0,
        },
      });
      emit();
    },
    preload(id) {
      const entry = entries.get(id);

      if (!entry) {
        return Promise.reject(new Error(`Unknown preloader "${id}".`));
      }

      if (entry.promise) {
        // Deduplicate hover, focus, and activation racing for one module.
        return entry.promise;
      }

      if (entry.snapshot.status === 'ready') {
        return Promise.resolve();
      }

      const startedAt = performance.now();

      updateEntry(entry, {
        status: 'loading',
        attempts: entry.snapshot.attempts + 1,
        durationMilliseconds: undefined,
        errorMessage: undefined,
      });

      entry.promise = entry
        .load()
        .then((value) => {
          updateEntry(entry, {
            status: 'ready',
            durationMilliseconds: performance.now() - startedAt,
          });
          return value;
        })
        .catch((error: unknown) => {
          // Clear rejected Promises so a later interaction can retry.
          entry.promise = undefined;
          updateEntry(entry, {
            status: 'failed',
            durationMilliseconds: performance.now() - startedAt,
            errorMessage: getErrorMessage(error),
          });
          throw error;
        });

      return entry.promise;
    },
    getEntry(id) {
      return entries.get(id)?.snapshot;
    },
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}
