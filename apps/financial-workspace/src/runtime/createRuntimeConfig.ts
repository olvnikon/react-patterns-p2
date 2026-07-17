import type { ZodError } from 'zod';

import {
  resourceDocumentSchema,
  runtimeConfigSchema,
  runtimeValuesSchema,
  type RuntimeConfig,
} from './runtimeConfig';

export class RuntimeConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RuntimeConfigError';
  }
}

function toRuntimeConfigError(error: ZodError): RuntimeConfigError {
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

  const configResult = runtimeConfigSchema.safeParse({
    applicationId: resourceResult.data.applicationId,
    ...valuesResult.data,
  });

  if (!configResult.success) {
    throw toRuntimeConfigError(configResult.error);
  }

  return configResult.data;
}
