import {
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';

import { DynamicPanelHost } from './internal/DynamicPanelHost';
import { panelDefinitions } from './model/panelDefinitions';
import type {
  ActivityPanelConfig,
  PanelInstance,
  PanelPreloadApi,
  PanelType,
  ScenarioPanelConfig,
} from './model/panelTypes';

type DynamicPanelsEntryProps = {
  preload: PanelPreloadApi;
};

function createPanelInstance(type: PanelType): PanelInstance {
  switch (type) {
    case 'portfolio-overview':
      return {
        id: type,
        type,
        enabled: true,
        revision: 0,
        config: {
          portfolioId: 'PF-001',
        },
      };
    case 'activity-summary':
      return {
        id: type,
        type,
        enabled: true,
        revision: 0,
        config: {
          userId: 'USR-DEMO',
          filter: 'today',
          mode: 'ready',
        },
      };
    case 'scenario-summary':
      return {
        id: type,
        type,
        enabled: true,
        revision: 0,
        config: {
          portfolioId: 'PF-001',
          mode: 'ready',
        },
      };
  }
}

export function DynamicPanelsEntry({
  preload,
}: DynamicPanelsEntryProps) {
  const preloadSnapshot = useSyncExternalStore(
    preload.subscribe,
    preload.getSnapshot,
  );
  const [panels, setPanels] = useState<PanelInstance[]>([
    createPanelInstance('portfolio-overview'),
  ]);

  useEffect(() => {
    void preload
      .force(panelDefinitions['portfolio-overview'].preloaderId)
      .catch(() => {
        // The panel host owns visible activation failure handling.
      });
  }, [preload]);

  function addPanel(type: PanelType) {
    const definition = panelDefinitions[type];

    void preload.force(definition.preloaderId).catch(() => {
      // Suspense/Error Boundary own visible activation failures.
    });

    setPanels((current) =>
      current.some((panel) => panel.type === type)
        ? current
        : [...current, createPanelInstance(type)],
    );
  }

  function updatePanel(
    id: string,
    update: (panel: PanelInstance) => PanelInstance,
  ) {
    setPanels((current) =>
      current.map((panel) =>
        panel.id === id
          ? {
              ...update(panel),
              revision: panel.revision + 1,
            }
          : panel,
      ),
    );
  }

  function retryPanel(id: string) {
    updatePanel(id, (panel) => panel);
  }

  function removePanel(id: string) {
    setPanels((current) => current.filter((panel) => panel.id !== id));
  }

  return (
    <section className="page-section">
      <div>
        <p className="eyebrow">Part 2 · Resilience</p>
        <h1>Dynamic Panel Workspace</h1>
      </div>

      <div className="pattern-tags">
        <span className="pattern-tag">Graceful Degradation</span>
        <span className="pattern-tag">Intent Prefetching</span>
        <span className="pattern-tag">Local Error Boundaries</span>
      </div>

      <p>
        The host lazily resolves panel modules, passes local configuration,
        validates it, and owns Suspense and rendering isolation. Panels own
        their mock queries and capability state.
      </p>

      <div className="capability-state-map" aria-label="Capability state map">
        <span>Loading → Ready</span>
        <span>Loading → Failed</span>
        <span>Ready → Stale</span>
        <span>Ready → Degraded</span>
        <span>Failed → Retry → Loading</span>
        <span>Disabled is intentional</span>
      </div>

      <div className="panel-catalog">
        {Object.values(panelDefinitions).map((definition) => {
          const status =
            preloadSnapshot.find(
              (entry) => entry.id === definition.preloaderId,
            )?.status ?? 'idle';
          const open = panels.some((panel) => panel.type === definition.type);

          return (
            <article
              className="panel-catalog-card"
              key={definition.type}
              onPointerEnter={() =>
                preload.requestIntent(definition.preloaderId)
              }
              onFocus={() => preload.requestIntent(definition.preloaderId)}
            >
              <div>
                <div>
                  <p className="eyebrow">Lazy panel</p>
                  <h2>{definition.title}</h2>
                </div>
                <span
                  className={`status-chip status-chip--${status}`}
                >
                  {status}
                </span>
              </div>
              <p>{definition.summary}</p>
              <button
                type="button"
                disabled={open}
                onClick={() => addPanel(definition.type)}
              >
                {open ? 'Panel open' : 'Add panel'}
              </button>
            </article>
          );
        })}
      </div>

      <div className="dynamic-panel-grid">
        {panels.map((panel) => (
          <div className="dynamic-panel-slot" key={panel.id}>
            <div className="panel-slot-heading">
              <span>{panelDefinitions[panel.type].title} instance</span>
              <button type="button" onClick={() => removePanel(panel.id)}>
                Remove
              </button>
            </div>

            {panel.type === 'activity-summary' ? (
              <div className="panel-demo-controls">
                <label>
                  Activity mode
                  <select
                    value={
                      (panel.config as ActivityPanelConfig).mode
                    }
                    onChange={(event) =>
                      updatePanel(panel.id, (current) => ({
                        ...current,
                        config: {
                          ...(current.config as ActivityPanelConfig),
                          mode: event.target
                            .value as ActivityPanelConfig['mode'],
                        },
                      }))
                    }
                  >
                    <option value="ready">Ready</option>
                    <option value="stale">Stale cached data</option>
                    <option value="fail-first">Fail first query</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    updatePanel(panel.id, (current) => ({
                      ...current,
                      config: {
                        ...(current.config as ActivityPanelConfig),
                        filter: undefined,
                      },
                    }))
                  }
                >
                  Break config
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updatePanel(panel.id, (current) => ({
                      ...current,
                      config: {
                        ...(current.config as ActivityPanelConfig),
                        filter: 'today',
                      },
                    }))
                  }
                >
                  Restore config
                </button>
              </div>
            ) : null}

            {panel.type === 'scenario-summary' ? (
              <div className="panel-demo-controls">
                <label>
                  Scenario mode
                  <select
                    value={
                      (panel.config as ScenarioPanelConfig).mode
                    }
                    onChange={(event) =>
                      updatePanel(panel.id, (current) => ({
                        ...current,
                        config: {
                          ...(current.config as ScenarioPanelConfig),
                          mode: event.target
                            .value as ScenarioPanelConfig['mode'],
                        },
                      }))
                    }
                  >
                    <option value="ready">Ready</option>
                    <option value="degraded">Degraded</option>
                    <option value="render-failure">Render failure</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    updatePanel(panel.id, (current) => ({
                      ...current,
                      enabled: !current.enabled,
                    }))
                  }
                >
                  {panel.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            ) : null}

            <DynamicPanelHost
              instance={panel}
              onRetry={() => retryPanel(panel.id)}
              onRemove={() => removePanel(panel.id)}
            />
          </div>
        ))}
      </div>

      <div className="route-note">
        <div className="pattern-tags">
          <span className="pattern-tag">What to observe</span>
        </div>
        <p>
          Hover or focus a catalog card before adding it. Then simulate stale
          data, a retryable query failure, invalid config, degraded analytics,
          disabled capability, or rendering failure. Sibling panels remain
          mounted and usable throughout.
        </p>
      </div>
    </section>
  );
}
