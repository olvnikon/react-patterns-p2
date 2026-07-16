import { Link } from 'react-router-dom';

type PatternCard = {
  name: string;
  category: string;
  kind: 'Pattern' | 'Solution' | 'Best practice';
  route: string;
  question: string;
  distinction: string;
};

const patternGroups: ReadonlyArray<{
  title: string;
  summary: string;
  patterns: PatternCard[];
}> = [
  {
    title: 'Construction',
    summary: 'How deployment choices become a running browser application.',
    patterns: [
      {
        name: 'Runtime Configuration',
        category: 'Construction',
        kind: 'Pattern',
        route: '/startup',
        question: 'Which deployment choices were supplied?',
        distinction: 'Serializable choices, not live objects.',
      },
      {
        name: 'Composition Root',
        category: 'Construction',
        kind: 'Pattern',
        route: '/startup',
        question: 'Which implementations are created and connected?',
        distinction: 'Object construction, not business workflow.',
      },
      {
        name: 'Strategy',
        category: 'Construction',
        kind: 'Pattern',
        route: '/analytics',
        question: 'Which interchangeable behavior should run?',
        distinction: 'Behavior selection, not workflow state.',
      },
    ],
  },
  {
    title: 'Workflow and orchestration',
    summary: 'How one workflow and many independent instances are coordinated.',
    patterns: [
      {
        name: 'State Machines and Statecharts',
        category: 'Workflow',
        kind: 'Solution',
        route: '/workflows',
        question: 'Which state is one workflow in?',
        distinction: 'One explicit workflow.',
      },
      {
        name: 'Actor Model',
        category: 'Orchestration',
        kind: 'Pattern',
        route: '/workflows',
        question: 'How do independent workflow instances communicate?',
        distinction: 'Logical concurrency, not Worker threads.',
      },
      {
        name: 'Declarative Bootstrap Task Graph',
        category: 'Startup',
        kind: 'Solution',
        route: '/startup',
        question: 'Which startup task can run now?',
        distinction: 'Application readiness, not a business workflow.',
      },
    ],
  },
  {
    title: 'Performance and resilience',
    summary: 'How the UI remains responsive, fast to activate, and locally safe.',
    patterns: [
      {
        name: 'Web Worker Offloading',
        category: 'Performance',
        kind: 'Best practice',
        route: '/analytics',
        question: 'Where should CPU-heavy JavaScript execute?',
        distinction: 'Background thread, not React prioritization.',
      },
      {
        name: 'Intent-Based Prefetching',
        category: 'Performance',
        kind: 'Best practice',
        route: '/startup',
        question: 'When should a likely lazy resource start loading?',
        distinction: 'Earlier loading, not eager-loading everything.',
      },
      {
        name: 'Graceful Capability Degradation',
        category: 'Resilience',
        kind: 'Best practice',
        route: '/panels',
        question: 'What remains safely usable after a local failure?',
        distinction: 'Local containment, not hiding critical failure.',
      },
    ],
  },
];

export function ArchitectureRoute() {
  return (
    <section className="page-section">
      <div>
        <p className="eyebrow">React Patterns · Part 2</p>
        <h1>Architecture Map</h1>
      </div>

      <p>
        Nine patterns and practices solve different problems. The application
        combines them deliberately, but no pattern owns responsibilities that
        belong to another.
      </p>

      <div className="architecture-flow" aria-label="Pattern narrative">
        <span>Config chooses</span>
        <span>Root wires</span>
        <span>Strategy varies</span>
        <span>Statecharts constrain</span>
        <span>Actors coordinate</span>
        <span>Bootstrap schedules</span>
        <span>Workers offload</span>
        <span>Intent anticipates</span>
        <span>Degradation contains</span>
      </div>

      {patternGroups.map((group) => (
        <section className="pattern-group" key={group.title}>
          <div>
            <p className="eyebrow">{group.title}</p>
            <p>{group.summary}</p>
          </div>
          <div className="architecture-grid">
            {group.patterns.map((pattern) => (
              <Link
                className="architecture-card"
                to={pattern.route}
                key={pattern.name}
              >
                <div>
                  <span className="pattern-tag">{pattern.kind}</span>
                  <span>{pattern.category}</span>
                </div>
                <h2>{pattern.name}</h2>
                <p>{pattern.question}</p>
                <small>{pattern.distinction}</small>
                <strong>Open demo →</strong>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <div className="route-note">
        <div className="pattern-tags">
          <span className="pattern-tag">Application boundary</span>
        </div>
        <p>
          This is a client-side JAMstack showcase. All repositories, data,
          decisions, calculations, context events, and failures are fake and
          local. There is no backend application in this repository.
        </p>
      </div>
    </section>
  );
}
