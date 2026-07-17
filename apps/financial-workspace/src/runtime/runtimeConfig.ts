import * as z from 'zod';

const supportedKeys = [
  'analyticsStrategy',
  'bootstrapProfile',
  'contextProvider',
  'prefetchMode',
] as const;

export const analyticsStrategySchema = z.enum(['direct', 'worker']);

export const bootstrapProfileSchema = z.enum([
  'standard',
  'slow-startup',
  'optional-failure',
  'critical-failure',
]);

export const contextProviderSchema = z.enum(['mock', 'shell', 'fdc3']);

export const prefetchModeSchema = z.enum(['none', 'intent']);

export const resourceCustomDataEntrySchema = z.object({
  key: z.string(),
  value: z.string(),
});

const customDataSchema = z
  .array(resourceCustomDataEntrySchema)
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

export const resourceDocumentSchema = z.object({
  applicationId: z
    .string()
    .trim()
    .min(1, 'resources.json must contain a non-empty applicationId.'),
  customData: customDataSchema,
});

export const runtimeValuesSchema = z.strictObject({
  analyticsStrategy: analyticsStrategySchema.default('direct'),
  bootstrapProfile: bootstrapProfileSchema.default('standard'),
  contextProvider: contextProviderSchema.default('mock'),
  prefetchMode: prefetchModeSchema.default('intent'),
});

export const runtimeConfigSchema = z.strictObject({
  applicationId: resourceDocumentSchema.shape.applicationId,
  analyticsStrategy: analyticsStrategySchema,
  bootstrapProfile: bootstrapProfileSchema,
  contextProvider: contextProviderSchema,
  prefetchMode: prefetchModeSchema,
}).readonly();

export type AnalyticsStrategyName = z.infer<typeof analyticsStrategySchema>;
export type BootstrapProfile = z.infer<typeof bootstrapProfileSchema>;
export type ContextProviderName = z.infer<typeof contextProviderSchema>;
export type PrefetchMode = z.infer<typeof prefetchModeSchema>;
export type ResourceCustomDataEntry = z.infer<
  typeof resourceCustomDataEntrySchema
>;
export type ResourceDocument = z.infer<typeof resourceDocumentSchema>;
export type RuntimeConfig = z.infer<typeof runtimeConfigSchema>;
