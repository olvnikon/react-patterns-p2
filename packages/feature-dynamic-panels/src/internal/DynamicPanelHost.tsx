import {
  Suspense,
  lazy,
  useMemo,
} from 'react';

import { panelDefinitions } from '../model/panelDefinitions';
import type { PanelInstance } from '../model/panelTypes';
import { PanelErrorBoundary } from './PanelErrorBoundary';

type DynamicPanelHostProps = {
  instance: PanelInstance;
  onRetry(): void;
  onRemove(): void;
};

export function DynamicPanelHost({
  instance,
  onRetry,
  onRemove,
}: DynamicPanelHostProps) {
  const definition = panelDefinitions[instance.type];
  const validationError = definition.validate(instance.config);
  const LazyPanel = useMemo(
    () => lazy(definition.load),
    [definition],
  );

  if (!instance.enabled) {
    return (
      <article className="dynamic-panel dynamic-panel--disabled">
        <div className="dynamic-panel__heading">
          <div>
            <p className="eyebrow">Intentional configuration</p>
            <h2>{definition.title}</h2>
          </div>
          <span className="status-chip status-chip--idle">Disabled</span>
        </div>
        <p>This optional capability is intentionally disabled.</p>
        <button type="button" onClick={onRemove}>
          Remove panel
        </button>
      </article>
    );
  }

  if (validationError) {
    return (
      <article className="dynamic-panel dynamic-panel--failed" role="alert">
        <div className="dynamic-panel__heading">
          <div>
            <p className="eyebrow">Invalid local configuration</p>
            <h2>{definition.title}</h2>
          </div>
          <span className="status-chip status-chip--failed">Failed</span>
        </div>
        <p>{validationError}</p>
        <div className="approval-actions">
          <button type="button" onClick={onRetry}>
            Retry validation
          </button>
          <button type="button" onClick={onRemove}>
            Remove panel
          </button>
        </div>
      </article>
    );
  }

  return (
    <PanelErrorBoundary
      panelTitle={definition.title}
      resetKey={instance.revision}
      onRetry={onRetry}
      onRemove={onRemove}
    >
      <Suspense
        fallback={
          <article className="dynamic-panel">
            <div className="dynamic-panel__heading">
              <div>
                <p className="eyebrow">Lazy module</p>
                <h2>{definition.title}</h2>
              </div>
              <span className="status-chip status-chip--running">
                Loading
              </span>
            </div>
            <p>Resolving panel module…</p>
          </article>
        }
      >
        <LazyPanel config={instance.config} />
      </Suspense>
    </PanelErrorBoundary>
  );
}
