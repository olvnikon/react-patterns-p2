import { useSyncExternalStore } from 'react';
import { useSelector } from 'react-redux';

import type {
  BootstrapProfile,
} from '../runtime';
import { selectBootstrapData } from '../app/store/bootstrapDataSelectors';
import type { ApplicationDiagnostics } from '../composition/applicationTypes';
import { PatternNote } from './components/PatternNote';

type StartupRouteProps = {
  diagnostics: ApplicationDiagnostics;
};

const configLabels: Record<
  keyof ApplicationDiagnostics['runtimeConfig'],
  string
> = {
  applicationId: 'Application',
  analyticsStrategy: 'Analytics strategy',
  bootstrapProfile: 'Bootstrap profile',
  contextProvider: 'Context provider',
  prefetchMode: 'Prefetch mode',
};

const bootstrapProfiles: ReadonlyArray<{
  id: BootstrapProfile;
  label: string;
}> = [
  {
    id: 'standard',
    label: 'Standard',
  },
  {
    id: 'slow-startup',
    label: 'Slow',
  },
  {
    id: 'optional-failure',
    label: 'Optional failure',
  },
  {
    id: 'critical-failure',
    label: 'Critical failure',
  },
];

function formatStatus(status: string): string {
  return status
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function StartupRoute({ diagnostics }: StartupRouteProps) {
  const bootstrapData = useSelector(selectBootstrapData);
  const bootstrap = useSyncExternalStore(
    diagnostics.bootstrap.subscribe,
    diagnostics.bootstrap.getSnapshot,
  );
  const prefetch = useSyncExternalStore(
    diagnostics.prefetch.subscribe,
    diagnostics.prefetch.getSnapshot,
  );
  const configEntries = Object.entries(diagnostics.runtimeConfig) as Array<
    [
      keyof ApplicationDiagnostics['runtimeConfig'],
      ApplicationDiagnostics['runtimeConfig'][keyof ApplicationDiagnostics['runtimeConfig']],
    ]
  >;

  return (
    <section className="page-section">
      <div>
        <p className="eyebrow">Part 2 · Construction</p>
        <h1>Application Startup</h1>
      </div>

      <PatternNote
        ariaLabel="Startup pattern summary"
        tags={['Runtime Configuration', 'Composition Root']}
      >
        Configuration describes serializable choices. The Composition Root
        turns those choices into live application objects before React mounts.
      </PatternNote>

      <div className="startup-flow" aria-label="Application startup flow">
        <span>resources.json</span>
        <span aria-hidden="true">→</span>
        <span>RuntimeConfig</span>
        <span aria-hidden="true">→</span>
        <span>Composition Root</span>
        <span aria-hidden="true">→</span>
        <span>Bootstrap Graph</span>
        <span aria-hidden="true">→</span>
        <span>React</span>
      </div>

      <div className="diagnostics-grid">
        <article className="workspace-panel">
          <div>
            <p className="eyebrow">Validated configuration</p>
            <span className="status-chip status-chip--ready">Immutable</span>
          </div>
          <dl>
            {configEntries.map(([key, value]) => (
              <div key={key}>
                <dt>{configLabels[key]}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="workspace-panel">
          <div>
            <p className="eyebrow">Composition diagnostics</p>
            <span className="status-chip status-chip--ready">Created</span>
          </div>
          <ul className="wiring-list">
            {diagnostics.wiring.map((item) => (
              <li key={item.capability}>
                <div>
                  <strong>{item.capability}</strong>
                  <span>{item.implementation}</span>
                </div>
                <span className="pattern-tag">{item.lifetime}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <section className="bootstrap-section" aria-labelledby="outputs-title">
        <div className="bootstrap-heading">
          <div>
            <p className="eyebrow">Real task outputs</p>
            <h2 id="outputs-title">Bootstrap outputs in Redux</h2>
          </div>
          <span
            className={`status-chip status-chip--${
              bootstrapData.mainViewReady ? 'ready' : 'running'
            }`}
          >
            {bootstrapData.mainViewReady ? 'Main View Ready' : 'Updating'}
          </span>
        </div>

        <div className="diagnostics-grid">
          <article className="workspace-panel">
            <div>
              <p className="eyebrow">Required outputs</p>
              <span className="pattern-tag">Redux bootstrapData</span>
            </div>
            <dl>
              <div>
                <dt>Session</dt>
                <dd>
                  {bootstrapData.session
                    ? `${bootstrapData.session.userId} · ${bootstrapData.session.deskId}`
                    : 'Waiting…'}
                </dd>
              </div>
              <div>
                <dt>Platform context</dt>
                <dd>
                  {bootstrapData.platformContext
                    ? `${bootstrapData.platformContext.provider} · ${bootstrapData.platformContext.instrumentId}`
                    : 'Waiting…'}
                </dd>
              </div>
              <div>
                <dt>Reference data</dt>
                <dd>
                  {bootstrapData.referenceData
                    ? `${bootstrapData.referenceData.instruments.length} instruments · ${bootstrapData.referenceData.portfolios.length} portfolios`
                    : 'Waiting…'}
                </dd>
              </div>
              <div>
                <dt>Workspace</dt>
                <dd>
                  {bootstrapData.workspace
                    ? `${bootstrapData.workspace.selectedPortfolioId} · ${bootstrapData.workspace.layout}`
                    : 'Waiting…'}
                </dd>
              </div>
            </dl>
          </article>

          <article className="workspace-panel">
            <div>
              <p className="eyebrow">Optional outputs</p>
              <span className="pattern-tag">After Main View</span>
            </div>
            <dl>
              <div>
                <dt>Market data</dt>
                <dd>
                  {bootstrapData.marketData
                    ? `${bootstrapData.marketData.status} · ${bootstrapData.marketData.connectedAt}`
                    : 'Waiting…'}
                </dd>
              </div>
              <div>
                <dt>Analytics warmup</dt>
                <dd>
                  {bootstrapData.analyticsWarmup
                    ? `${bootstrapData.analyticsWarmup.strategy} · completed`
                    : 'Waiting…'}
                </dd>
              </div>
              <div>
                <dt>Started at</dt>
                <dd>{bootstrapData.startedAt ?? 'Waiting…'}</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section className="bootstrap-section" aria-labelledby="bootstrap-title">
        <div className="bootstrap-heading">
          <div>
            <p className="eyebrow">Declarative Bootstrap Task Graph</p>
            <h2 id="bootstrap-title">Which task can run now?</h2>
          </div>
          <span
            className={`status-chip status-chip--${bootstrap.status}`}
          >
            {formatStatus(bootstrap.status)}
          </span>
        </div>

        <div className="bootstrap-controls" aria-label="Bootstrap demo profiles">
          <span>Replay profile:</span>
          {bootstrapProfiles.map((profile) => (
            <button
              type="button"
              key={profile.id}
              aria-pressed={bootstrap.profile === profile.id}
              onClick={() => diagnostics.bootstrap.replay(profile.id)}
            >
              {profile.label}
            </button>
          ))}
          <small>
            Replay reruns mocked operations and resets only bootstrapData; the
            mounted application remains available for the presentation.
          </small>
        </div>

        <div className="bootstrap-graph">
          {bootstrap.tasks.map((task) => (
            <article
              className={`bootstrap-task bootstrap-task--${task.status}`}
              key={task.id}
            >
              <div className="bootstrap-task__heading">
                <strong>{task.label}</strong>
                <span
                  className={`status-chip status-chip--${task.status}`}
                >
                  {formatStatus(task.status)}
                </span>
              </div>
              <p>{task.description}</p>
              <div className="bootstrap-task__metadata">
                <span>{task.critical ? 'Critical' : 'Optional'}</span>
                <span>
                  {task.blocksMainView ? 'Blocks main view' : 'Background'}
                </span>
                <span>Attempt {task.attempts}</span>
              </div>
              {task.dependencies.length > 0 ? (
                <p className="bootstrap-task__dependencies">
                  After: {task.dependencies.join(', ')}
                </p>
              ) : (
                <p className="bootstrap-task__dependencies">Graph input</p>
              )}
              {task.errorMessage ? (
                <p className="error-message">{task.errorMessage}</p>
              ) : null}
              {task.status === 'failed' ? (
                <button
                  type="button"
                  onClick={() => diagnostics.bootstrap.retry(task.id)}
                >
                  Retry task
                </button>
              ) : null}
            </article>
          ))}
        </div>

        <PatternNote
          ariaLabel="Bootstrap graph observation"
          tags={[
            bootstrap.mainViewReady
              ? 'Main View Ready'
              : 'Main View Waiting',
            'XState actors',
            'Critical vs optional',
          ]}
        >
          Infrastructure and platform context start in parallel. Reference data
          and workspace restoration wait for the demo session. Optional market
          data and analytics warmups begin only after the main view milestone.
        </PatternNote>
      </section>

      <section className="bootstrap-section" aria-labelledby="prefetch-title">
        <div className="bootstrap-heading">
          <div>
            <p className="eyebrow">Intent-Based Prefetching</p>
            <h2 id="prefetch-title">Load likely routes before activation</h2>
          </div>
          <span className="pattern-tag">
            Mode: {diagnostics.runtimeConfig.prefetchMode}
          </span>
        </div>

        <div className="prefetch-diagnostics">
          {prefetch.map((entry) => (
            <article className="workspace-panel" key={entry.id}>
              <div>
                <div>
                  <p className="eyebrow">{entry.id}</p>
                  <h2>{entry.label}</h2>
                </div>
                <span
                  className={`status-chip status-chip--${entry.status}`}
                >
                  {formatStatus(entry.status)}
                </span>
              </div>
              <p>
                Attempts: {entry.attempts}
                {entry.durationMilliseconds !== undefined
                  ? ` · ${Math.round(entry.durationMilliseconds)} ms`
                  : ''}
              </p>
              {entry.errorMessage ? (
                <p className="error-message">{entry.errorMessage}</p>
              ) : null}
              <button
                type="button"
                disabled={entry.status === 'loading' || entry.status === 'ready'}
                onClick={() =>
                  void diagnostics.prefetch.preload(entry.id).catch(() => {
                    // The visible diagnostic state reports the failure.
                  })
                }
              >
                Preload now
              </button>
            </article>
          ))}
        </div>

        <PatternNote
          ariaLabel="Intent prefetching observation"
          tags={['Hover', 'Keyboard focus', 'Deduplicated promise']}
        >
          Hover or focus Reports, Analytics, or Workflows in the main
          navigation. The indicator and this diagnostic projection change
          before navigation. Direct navigation still uses the same lazy loader.
        </PatternNote>
      </section>
    </section>
  );
}
