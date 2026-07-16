import type {
  AnalyticsStrategyName,
  BootstrapProfile,
  ContextProviderName,
  PrefetchMode,
  ResourceDocument,
  RuntimeConfig,
} from './runtimeConfig';

export class RuntimeConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RuntimeConfigError';
  }
}

const supportedKeys = new Set([
  'analyticsStrategy',
  'bootstrapProfile',
  'contextProvider',
  'prefetchMode',
]);

function mapCustomData(
  entries: ResourceDocument['customData'],
): ReadonlyMap<string, string> {
  const values = new Map<string, string>();

  for (const entry of entries) {
    if (!supportedKeys.has(entry.key)) {
      throw new RuntimeConfigError(
        `Unsupported runtime configuration key "${entry.key}".`,
      );
    }

    if (values.has(entry.key)) {
      throw new RuntimeConfigError(
        `Runtime configuration contains duplicate key "${entry.key}".`,
      );
    }

    values.set(entry.key, entry.value);
  }

  return values;
}

function readEnumValue<T extends string>(
  values: ReadonlyMap<string, string>,
  key: string,
  supportedValues: readonly T[],
  fallback: T,
): T {
  const value = values.get(key);

  if (value === undefined) {
    return fallback;
  }

  if (!supportedValues.includes(value as T)) {
    throw new RuntimeConfigError(
      `Unsupported value "${value}" for runtime configuration key "${key}".`,
    );
  }

  return value as T;
}

export function createRuntimeConfig(
  resources: ResourceDocument,
): RuntimeConfig {
  const values = mapCustomData(resources.customData);

  const runtimeConfig: RuntimeConfig = {
    applicationId: resources.applicationId,
    analyticsStrategy: readEnumValue<AnalyticsStrategyName>(
      values,
      'analyticsStrategy',
      ['direct', 'worker'],
      'direct',
    ),
    bootstrapProfile: readEnumValue<BootstrapProfile>(
      values,
      'bootstrapProfile',
      ['standard', 'slow-startup', 'optional-failure'],
      'standard',
    ),
    contextProvider: readEnumValue<ContextProviderName>(
      values,
      'contextProvider',
      ['mock', 'shell', 'fdc3'],
      'mock',
    ),
    prefetchMode: readEnumValue<PrefetchMode>(
      values,
      'prefetchMode',
      ['none', 'intent'],
      'intent',
    ),
  };

  return Object.freeze(runtimeConfig);
}
