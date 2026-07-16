import {
  DynamicPanelsEntry,
  type PanelPreloadApi,
} from '@demo/feature-dynamic-panels';
import { useMemo } from 'react';

import {
  canIntentPrefetch,
  type PreloadRegistry,
} from '../prefetch';
import type { PrefetchMode } from '../runtime';

type PanelsRouteProps = {
  prefetch: PreloadRegistry;
  prefetchMode: PrefetchMode;
};

export function PanelsRoute({
  prefetch,
  prefetchMode,
}: PanelsRouteProps) {
  const preload = useMemo<PanelPreloadApi>(
    () => ({
      requestIntent(id) {
        if (!canIntentPrefetch(prefetchMode)) {
          return;
        }

        void prefetch.preload(id).catch(() => {
          // Activation owns visible failure handling.
        });
      },
      force(id) {
        return prefetch.preload(id);
      },
      getSnapshot() {
        return prefetch.getSnapshot();
      },
      subscribe(listener) {
        return prefetch.subscribe(listener);
      },
    }),
    [prefetch, prefetchMode],
  );

  return <DynamicPanelsEntry preload={preload} />;
}
