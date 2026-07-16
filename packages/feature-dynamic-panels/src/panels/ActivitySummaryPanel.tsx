import {
  useEffect,
  useState,
} from 'react';

import type {
  ActivityPanelConfig,
  DynamicPanelProps,
} from '../model/panelTypes';

type QueryStatus = 'loading' | 'ready' | 'stale' | 'failed';

const activityItems = [
  'Order reviewed',
  'Portfolio viewed',
  'Report generated',
];

export default function ActivitySummaryPanel({
  config,
}: DynamicPanelProps) {
  const activityConfig = config as ActivityPanelConfig;
  const [status, setStatus] = useState<QueryStatus>('loading');
  const [attempt, setAttempt] = useState(1);
  const [updatedAt, setUpdatedAt] = useState<Date>();

  useEffect(() => {
    let active = true;
    setStatus('loading');

    const timeout = window.setTimeout(() => {
      if (!active) {
        return;
      }

      if (activityConfig.mode === 'fail-first' && attempt === 1) {
        setStatus('failed');
        return;
      }

      setUpdatedAt(new Date());
      setStatus(activityConfig.mode === 'stale' ? 'stale' : 'ready');
    }, 650);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [activityConfig.mode, attempt]);

  if (status === 'loading') {
    return (
      <article className="dynamic-panel">
        <div className="dynamic-panel__heading">
          <div>
            <p className="eyebrow">Mock query</p>
            <h2>Activity Summary</h2>
          </div>
          <span className="status-chip status-chip--running">Loading</span>
        </div>
        <p>Loading activity for {activityConfig.userId}…</p>
      </article>
    );
  }

  if (status === 'failed') {
    return (
      <article className="dynamic-panel dynamic-panel--failed" role="alert">
        <div className="dynamic-panel__heading">
          <div>
            <p className="eyebrow">Mock query</p>
            <h2>Activity Summary</h2>
          </div>
          <span className="status-chip status-chip--failed">Failed</span>
        </div>
        <p>The first synthetic request failed. No sibling panel is affected.</p>
        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
          Retry query
        </button>
      </article>
    );
  }

  return (
    <article
      className={
        status === 'stale'
          ? 'dynamic-panel dynamic-panel--stale'
          : 'dynamic-panel'
      }
    >
      <div className="dynamic-panel__heading">
        <div>
          <p className="eyebrow">Mock query</p>
          <h2>Activity Summary</h2>
        </div>
        <span
          className={`status-chip status-chip--${
            status === 'stale' ? 'degraded' : 'ready'
          }`}
        >
          {status === 'stale' ? 'Stale' : 'Ready'}
        </span>
      </div>
      {status === 'stale' ? (
        <p className="workflow-warning">
          Cached read-only data. Last updated:{' '}
          {updatedAt?.toLocaleTimeString() ?? 'unknown'}.
        </p>
      ) : null}
      <ul className="placeholder-list">
        {activityItems.map((item) => (
          <li key={item}>
            <span>{item}</span>
            <span>{activityConfig.filter}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setAttempt((value) => value + 1)}
      >
        Refresh safely
      </button>
    </article>
  );
}
