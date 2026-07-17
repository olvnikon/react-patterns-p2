import {
  analyticsStrategySchema,
  runtimeConfigSchema,
  type RuntimeConfig,
} from './runtimeConfig';

const demoStrategyParameter = 'demoAnalyticsStrategy';

/**
 * Presentation-only override. A deployed application still owns exactly one
 * resources.json; this query parameter only makes both Strategy
 * implementations easy to compare during the live demo.
 */
export function applyDemoRuntimeConfigOverride(
  runtimeConfig: RuntimeConfig,
  search: string,
): RuntimeConfig {
  // Keep the browser URL explicit so this demo helper stays easy to verify.
  const requestedStrategy = new URLSearchParams(search).get(
    demoStrategyParameter,
  );

  if (requestedStrategy === null) {
    return runtimeConfig;
  }

  const strategyResult = analyticsStrategySchema.safeParse(requestedStrategy);

  if (!strategyResult.success) {
    return runtimeConfig;
  }

  return runtimeConfigSchema.parse({
    ...runtimeConfig,
    analyticsStrategy: strategyResult.data,
  });
}
