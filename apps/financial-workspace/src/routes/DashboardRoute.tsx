import { DashboardEntry } from '@demo/feature-dashboard';
import { WorkspaceStatusEntry } from '@demo/feature-workspace-status';
import { Link } from 'react-router-dom';

const partTwoEntries = [
  {
    to: '/architecture',
    title: 'Pattern Map',
    summary: 'See all nine patterns and their boundaries.',
    tags: ['Overview', '9 topics'],
  },
  {
    to: '/startup',
    title: 'Application Startup',
    summary: 'Runtime config, Composition Root, bootstrap graph, and prefetch.',
    tags: ['Construction', 'Readiness'],
  },
  {
    to: '/workflows',
    title: 'Workflow Lab',
    summary: 'One statechart and a workspace of independent actors.',
    tags: ['XState', 'Actor Model'],
  },
  {
    to: '/analytics',
    title: 'Analytics Lab',
    summary: 'Runtime Strategy selection and real Worker-thread execution.',
    tags: ['Strategy', 'Web Worker'],
  },
  {
    to: '/panels',
    title: 'Panel Workspace',
    summary: 'Intent-prefetched panels with local failure containment.',
    tags: ['Prefetch', 'Degradation'],
  },
];

export function DashboardRoute() {
  return (
    <div className="dashboard-stack">
      <DashboardEntry />
      <section className="page-section">
        <div>
          <p className="eyebrow">Optional Facade Demo</p>
          <h1>Pure External Store</h1>
        </div>
        <WorkspaceStatusEntry />
      </section>

      <section className="page-section">
        <div>
          <p className="eyebrow">React Patterns · Part 2</p>
          <h1>Runtime Architecture Showcase</h1>
        </div>
        <p>
          Follow the routes in presentation order, or open the complete pattern
          map first.
        </p>
        <div className="part-two-grid">
          {partTwoEntries.map((entry) => (
            <Link className="summary-card" to={entry.to} key={entry.to}>
              <h2>{entry.title}</h2>
              <p>{entry.summary}</p>
              <div className="pattern-tags">
                {entry.tags.map((tag) => (
                  <span className="pattern-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
