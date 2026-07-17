import type {
  PanelModule,
  PanelType,
} from './panelTypes';

// Module-level Promise caches are shared by prefetch and React.lazy activation.
let portfolioPromise: Promise<PanelModule> | undefined;
let activityPromise: Promise<PanelModule> | undefined;
let scenarioPromise: Promise<PanelModule> | undefined;

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export function loadPortfolioPanel(): Promise<PanelModule> {
  portfolioPromise ??= import('../panels/PortfolioOverviewPanel');
  return portfolioPromise;
}

export function loadActivityPanel(): Promise<PanelModule> {
  activityPromise ??= Promise.all([
    import('../panels/ActivitySummaryPanel'),
    delay(700),
  ]).then(([module]) => module);
  return activityPromise;
}

export function loadScenarioPanel(): Promise<PanelModule> {
  scenarioPromise ??= Promise.all([
    import('../panels/ScenarioSummaryPanel'),
    delay(900),
  ]).then(([module]) => module);
  return scenarioPromise;
}

export const panelLoaders: Readonly<
  Record<PanelType, () => Promise<PanelModule>>
> = {
  'portfolio-overview': loadPortfolioPanel,
  'activity-summary': loadActivityPanel,
  'scenario-summary': loadScenarioPanel,
};
