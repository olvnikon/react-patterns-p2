import * as z from 'zod';

import type { RuntimeConfig } from './runtimeConfig';

export class RuntimeConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RuntimeConfigError';
  }
}

const supportedKeys = [
  'analyticsStrategy',
  'bootstrapProfile',
  'contextProvider',
  'prefetchMode',
] as const;

const customDataSchema = z
  .array(
    z.object({
      key: z.string(),
      value: z.string(),
    }),
  )
  .check((context) => {
    const seenKeys = new Set<string>();

    context.value.forEach((entry, index) => {
      if (!supportedKeys.includes(entry.key as (typeof supportedKeys)[number])) {
        context.issues.push({
          code: 'custom',
          input: entry.key,
          path: [index, 'key'],
          message: `Unsupported runtime configuration key "${entry.key}".`,
        });
      }

      if (seenKeys.has(entry.key)) {
        context.issues.push({
          code: 'custom',
          input: entry.key,
          path: [index, 'key'],
          message: `Runtime configuration contains duplicate key "${entry.key}".`,
        });
      }

      seenKeys.add(entry.key);
    });
  });

const resourceDocumentSchema = z.object({
  applicationId: z
    .string()
    .trim()
    .min(1, 'resources.json must contain a non-empty applicationId.'),
  customData: customDataSchema,
});

const runtimeValuesSchema = z.strictObject({
  analyticsStrategy: z.enum(['direct', 'worker']).default('direct'),
  bootstrapProfile: z
    .enum([
      'standard',
      'slow-startup',
      'optional-failure',
      'critical-failure',
    ])
    .default('standard'),
  contextProvider: z.enum(['mock', 'shell', 'fdc3']).default('mock'),
  prefetchMode: z.enum(['none', 'intent']).default('intent'),
});

function toRuntimeConfigError(error: z.ZodError): RuntimeConfigError {
  const message = error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
      return `${path}${issue.message}`;
    })
    .join(' ');

  return new RuntimeConfigError(message);
}

export function createRuntimeConfig(resources: unknown): RuntimeConfig {
  const resourceResult = resourceDocumentSchema.safeParse(resources);

  if (!resourceResult.success) {
    throw toRuntimeConfigError(resourceResult.error);
  }

  const values = Object.fromEntries(
    resourceResult.data.customData.map(({ key, value }) => [key, value]),
  );
  const valuesResult = runtimeValuesSchema.safeParse(values);

  if (!valuesResult.success) {
    throw toRuntimeConfigError(valuesResult.error);
  }

  return Object.freeze({
    applicationId: resourceResult.data.applicationId,
    ...valuesResult.data,
  });
}
