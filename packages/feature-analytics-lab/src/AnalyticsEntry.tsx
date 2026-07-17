import {
  useEffect,
  useRef,
  useState,
} from 'react';

import type {
  AnalyticsStrategyName,
  PortfolioAnalytics,
  ScenarioResult,
} from './model/analyticsTypes';

type AnalyticsEntryProps = {
  analytics: PortfolioAnalytics;
};

type RunStatus = 'idle' | 'running' | 'completed' | 'cancelled' | 'failed';

function formatScore(value: number): string {
  return Math.round(value).toLocaleString();
}

function restartWithStrategy(strategy: AnalyticsStrategyName) {
  const search = new URLSearchParams(window.location.search);
  search.set('demoAnalyticsStrategy', strategy);
  window.location.search = search.toString();
}

export function AnalyticsEntry({ analytics }: AnalyticsEntryProps) {
  const [positionCount, setPositionCount] = useState(75_000);
  const [iterations, setIterations] = useState(140);
  const [shockPercent, setShockPercent] = useState(8);
  const [status, setStatus] = useState<RunStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [elapsedMilliseconds, setElapsedMilliseconds] = useState<number>();
  const [result, setResult] = useState<ScenarioResult>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [heartbeat, setHeartbeat] = useState(0);
  const activeController = useRef<AbortController>();
  const runId = useRef(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeartbeat((value) => value + 1);
    }, 100);

    return () => {
      window.clearInterval(interval);
      activeController.current?.abort();
    };
  }, []);

  async function runScenario() {
    activeController.current?.abort();

    const controller = new AbortController();
    const currentRunId = runId.current + 1;
    const startedAt = performance.now();

    runId.current = currentRunId;
    activeController.current = controller;
    setStatus('running');
    setProgress(0);
    setResult(undefined);
    setErrorMessage(undefined);
    setElapsedMilliseconds(undefined);

    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      const nextResult = await analytics.calculateScenario(
        {
          positionCount,
          iterations,
          shockPercent,
        },
        {
          signal: controller.signal,
          onProgress(nextProgress) {
            if (runId.current === currentRunId) {
              setProgress(nextProgress.percent);
            }
          },
        },
      );

      if (runId.current !== currentRunId) {
        return;
      }

      setResult(nextResult);
      setProgress(100);
      setElapsedMilliseconds(performance.now() - startedAt);
      setStatus('completed');
    } catch (error) {
      if (runId.current !== currentRunId) {
        return;
      }

      setElapsedMilliseconds(performance.now() - startedAt);

      if (error instanceof DOMException && error.name === 'AbortError') {
        setStatus('cancelled');
        return;
      }

      setErrorMessage(
        error instanceof Error ? error.message : 'Calculation failed.',
      );
      setStatus('failed');
    }
  }

  function cancelScenario() {
    activeController.current?.abort();
  }

  return (
    <section className="page-section">
      <div>
        <p className="eyebrow">Part 2 · Performance</p>
        <h1>Portfolio Scenario Lab</h1>
      </div>

      <div className="pattern-tags">
        <span className="pattern-tag">Strategy Pattern</span>
        <span className="pattern-tag">Web Worker Offloading</span>
        <span className="pattern-tag">Synthetic local data</span>
      </div>

      <p>
        Both implementations use the same fake deterministic algorithm and
        return the same result shape. The configured Strategy decides whether
        the calculation runs on the main thread or in a Worker.
      </p>

      <div className="analytics-layout">
        <article className="workspace-panel analytics-controls">
          <div className="analytics-strategy-heading">
            <div>
              <p className="eyebrow">Configured capability</p>
              <h2>PortfolioAnalytics</h2>
            </div>
            <span className="status-chip status-chip--ready">
              {analytics.strategyName === 'worker'
                ? 'Worker Strategy'
                : 'Direct Strategy'}
            </span>
          </div>

          <div className="strategy-switcher">
            <span>Restart demo with:</span>
            <button
              type="button"
              disabled={analytics.strategyName === 'direct'}
              onClick={() => restartWithStrategy('direct')}
            >
              Direct
            </button>
            <button
              type="button"
              disabled={analytics.strategyName === 'worker'}
              onClick={() => restartWithStrategy('worker')}
            >
              Worker
            </button>
            <small>
              Demo-only URL override; the application still loads one
              resources.json.
            </small>
          </div>

          <label className="form-field">
            <span>Fake positions</span>
            <select
              value={positionCount}
              onChange={(event) => setPositionCount(Number(event.target.value))}
              disabled={status === 'running'}
            >
              <option value={25_000}>25,000</option>
              <option value={75_000}>75,000</option>
              <option value={125_000}>125,000</option>
            </select>
          </label>

          <label className="form-field">
            <span>Calculation intensity</span>
            <select
              value={iterations}
              onChange={(event) => setIterations(Number(event.target.value))}
              disabled={status === 'running'}
            >
              <option value={60}>Light</option>
              <option value={140}>Medium</option>
              <option value={220}>Heavy</option>
            </select>
          </label>

          <label className="form-field">
            <span>Synthetic shock: {shockPercent}%</span>
            <input
              type="range"
              min="1"
              max="20"
              value={shockPercent}
              onChange={(event) => setShockPercent(Number(event.target.value))}
              disabled={status === 'running'}
            />
          </label>

          <div className="approval-actions">
            <button
              type="button"
              onClick={() => void runScenario()}
              disabled={status === 'running'}
            >
              Run calculation
            </button>
            <button
              type="button"
              onClick={cancelScenario}
              disabled={status !== 'running'}
            >
              Cancel
            </button>
          </div>
        </article>

        <article className="workspace-panel analytics-results">
          <div className="analytics-strategy-heading">
            <div>
              <p className="eyebrow">Execution</p>
              <h2>{status}</h2>
            </div>
            <div className="heartbeat" title="Main-thread heartbeat">
              <span aria-hidden="true" />
              Tick {heartbeat}
            </div>
          </div>

          <div className="analytics-progress">
            <div style={{ width: `${progress}%` }} />
          </div>
          <p>
            Progress: {progress}% · Main-thread heartbeat should keep advancing
            during Worker execution.
          </p>

          {elapsedMilliseconds !== undefined ? (
            <p>Elapsed: {Math.round(elapsedMilliseconds)} ms</p>
          ) : null}

          {result ? (
            <dl className="analytics-result-grid">
              <div>
                <dt>Positions</dt>
                <dd>{result.positionCount.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Baseline score</dt>
                <dd>{formatScore(result.baselineScore)}</dd>
              </div>
              <div>
                <dt>Stressed score</dt>
                <dd>{formatScore(result.stressedScore)}</dd>
              </div>
              <div>
                <dt>Change score</dt>
                <dd>{formatScore(result.changeScore)}</dd>
              </div>
            </dl>
          ) : null}

          {status === 'cancelled' ? (
            <p>Calculation cancelled. No stale result was applied.</p>
          ) : null}
          {errorMessage ? (
            <p className="error-message">{errorMessage}</p>
          ) : null}
        </article>
      </div>

      <div className="route-note">
        <div className="pattern-tags">
          <span className="pattern-tag">What to observe</span>
        </div>
        <p>
          The Strategy changes through runtime configuration and a full
          application restart. Worker Offloading is an implementation detail of
          one Strategy. The Direct Strategy intentionally blocks the heartbeat
          during heavy work; the Worker Strategy does not.
        </p>
      </div>
    </section>
  );
}
