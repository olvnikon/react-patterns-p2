export type AnalyticsStrategyName = 'direct' | 'worker';
export type BootstrapProfile =
  | 'standard'
  | 'slow-startup'
  | 'optional-failure';
export type ContextProviderName = 'mock' | 'shell' | 'fdc3';
export type PrefetchMode = 'none' | 'intent';

export type RuntimeConfig = Readonly<{
  applicationId: string;
  analyticsStrategy: AnalyticsStrategyName;
  bootstrapProfile: BootstrapProfile;
  contextProvider: ContextProviderName;
  prefetchMode: PrefetchMode;
}>;

export type ResourceCustomDataEntry = {
  key: string;
  value: string;
};

export type ResourceDocument = {
  applicationId: string;
  customData: ResourceCustomDataEntry[];
};
