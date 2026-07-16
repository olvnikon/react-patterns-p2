import type { ResourceDocument } from './runtimeConfig';

export class ResourceLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResourceLoadError';
  }
}

function isCustomDataEntry(
  value: unknown,
): value is ResourceDocument['customData'][number] {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.key === 'string' && typeof candidate.value === 'string'
  );
}

function parseResourceDocument(value: unknown): ResourceDocument {
  if (!value || typeof value !== 'object') {
    throw new ResourceLoadError('resources.json must contain an object.');
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.applicationId !== 'string' ||
    candidate.applicationId.trim().length === 0
  ) {
    throw new ResourceLoadError(
      'resources.json must contain a non-empty applicationId.',
    );
  }

  if (
    !Array.isArray(candidate.customData) ||
    !candidate.customData.every(isCustomDataEntry)
  ) {
    throw new ResourceLoadError(
      'resources.json customData must be an array of string key/value entries.',
    );
  }

  return {
    applicationId: candidate.applicationId,
    customData: candidate.customData,
  };
}

export async function loadResources(): Promise<ResourceDocument> {
  const resourceUrl = `${import.meta.env.BASE_URL}resources.json`;
  const response = await fetch(resourceUrl, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ResourceLoadError(
      `Unable to load resources.json (${response.status}).`,
    );
  }

  let value: unknown;

  try {
    value = await response.json();
  } catch {
    throw new ResourceLoadError('resources.json is not valid JSON.');
  }

  return parseResourceDocument(value);
}
