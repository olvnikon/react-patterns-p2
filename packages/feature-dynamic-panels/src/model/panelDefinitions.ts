import {
  loadActivityPanel,
  loadPortfolioPanel,
  loadScenarioPanel,
} from './panelLoaders';
import type {
  ActivityPanelConfig,
  PanelDefinition,
  PanelType,
  PortfolioPanelConfig,
  ScenarioPanelConfig,
} from './panelTypes';

function validatePortfolio(
  config: PortfolioPanelConfig,
): string | undefined {
  return config.portfolioId?.trim()
    ? undefined
    : 'Portfolio Overview requires portfolioId.';
}

function validateActivity(
  config: ActivityPanelConfig,
): string | undefined {
  if (!config.userId?.trim()) {
    return 'Activity Summary requires userId.';
  }

  if (!config.filter) {
    return 'Activity Summary requires a query filter.';
  }

  return undefined;
}

function validateScenario(
  config: ScenarioPanelConfig,
): string | undefined {
  return config.portfolioId?.trim()
    ? undefined
    : 'Scenario Summary requires portfolioId.';
}

export const panelDefinitions: Readonly<
  Record<PanelType, PanelDefinition>
> = {
  'portfolio-overview': {
    type: 'portfolio-overview',
    title: 'Portfolio Overview',
    summary: 'Fast local panel with ready data.',
    preloaderId: 'panel:portfolio-overview',
    load: loadPortfolioPanel,
    validate: (config) =>
      validatePortfolio(config as PortfolioPanelConfig),
  },
  'activity-summary': {
    type: 'activity-summary',
    title: 'Activity Summary',
    summary: 'Slow lazy panel with stale and retryable query states.',
    preloaderId: 'panel:activity-summary',
    load: loadActivityPanel,
    validate: (config) =>
      validateActivity(config as ActivityPanelConfig),
  },
  'scenario-summary': {
    type: 'scenario-summary',
    title: 'Scenario Summary',
    summary: 'Optional panel with degraded and render-failure modes.',
    preloaderId: 'panel:scenario-summary',
    load: loadScenarioPanel,
    validate: (config) =>
      validateScenario(config as ScenarioPanelConfig),
  },
};
