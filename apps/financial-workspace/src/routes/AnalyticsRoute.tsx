import {
  AnalyticsEntry,
  type PortfolioAnalytics,
} from '@demo/feature-analytics-lab';

type AnalyticsRouteProps = {
  analytics: PortfolioAnalytics;
};

export function AnalyticsRoute({ analytics }: AnalyticsRouteProps) {
  return <AnalyticsEntry analytics={analytics} />;
}
