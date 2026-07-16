export type AnalyticsStrategyName = 'direct' | 'worker';

export type ScenarioInput = Readonly<{
  positionCount: number;
  iterations: number;
  shockPercent: number;
}>;

export type ScenarioResult = Readonly<{
  positionCount: number;
  baselineScore: number;
  stressedScore: number;
  changeScore: number;
  checksum: number;
}>;

export type AnalyticsProgress = Readonly<{
  completed: number;
  total: number;
  percent: number;
}>;

export type CalculateScenarioOptions = {
  signal?: AbortSignal;
  onProgress?(progress: AnalyticsProgress): void;
};

export type PortfolioAnalytics = {
  readonly strategyName: AnalyticsStrategyName;
  calculateScenario(
    input: ScenarioInput,
    options?: CalculateScenarioOptions,
  ): Promise<ScenarioResult>;
  dispose(): void;
};
