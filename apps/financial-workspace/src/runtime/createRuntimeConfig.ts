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
  // Nothing outside this parse can assume the shape of resources.json.
  const resourceResult = resourceDocumentSchema.safeParse(resources);

  if (!resourceResult.success) {
    throw toRuntimeConfigError(resourceResult.error);
  }

  // Convert the platform's entry array into the shape owned by this app.
  const values = Object.fromEntries(
    resourceResult.data.customData.map(({ key, value }) => [key, value]),
  );
  const valuesResult = runtimeValuesSchema.safeParse(values);

  if (!valuesResult.success) {
    throw toRuntimeConfigError(valuesResult.error);
  }

  // The final schema applies the inferred readonly RuntimeConfig contract.
  const configResult = runtimeConfigSchema.safeParse({
    applicationId: resourceResult.data.applicationId,
    ...valuesResult.data,
  });

  if (!configResult.success) {
    throw toRuntimeConfigError(configResult.error);
  }

  return configResult.data;
}
