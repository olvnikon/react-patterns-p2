import type { PrefetchMode } from '../runtime';
import type { PreloadRegistry } from './preloadTypes';

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
  };
};

export function canIntentPrefetch(mode: PrefetchMode): boolean {
  if (mode !== 'intent') {
    return false;
  }

  return !(navigator as NavigatorWithConnection).connection?.saveData;
}

export function createIntentHandlers(
  registry: PreloadRegistry,
  preloaderId: string,
  mode: PrefetchMode,
) {
  function preload() {
    if (!canIntentPrefetch(mode)) {
      return;
    }

    void registry.preload(preloaderId).catch(() => {
      // Prefetch is an optimization. Route activation owns visible failures.
    });
  }

  return {
    onPointerEnter: preload,
    onFocus: preload,
  };
}
