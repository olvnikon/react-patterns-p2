export class ResourceLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResourceLoadError';
  }
}

export async function loadResources(): Promise<unknown> {
  const resourceUrl = `${import.meta.env.BASE_URL}resources.json`;
  const response = await fetch(resourceUrl, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ResourceLoadError(
      `Unable to load resources.json (${response.status}).`,
    );
  }

  try {
    return await response.json();
  } catch {
    throw new ResourceLoadError('resources.json is not valid JSON.');
  }
}
