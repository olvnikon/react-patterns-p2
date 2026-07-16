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

export function StartupRoute({ diagnostics }: StartupRouteProps) {
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

      <PatternNote
        ariaLabel="Next startup phase"
        tags={['Next: XState bootstrap graph']}
      >
        The next phase will place named startup tasks between configuration and
        application readiness. This page already exposes the stable diagnostics
        surface that will visualize those tasks.
      </PatternNote>
    </section>
  );
}
