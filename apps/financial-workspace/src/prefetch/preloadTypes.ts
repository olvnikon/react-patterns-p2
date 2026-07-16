export type PreloadStatus = 'idle' | 'loading' | 'ready' | 'failed';

export type PreloadSnapshot = Readonly<{
  id: string;
  label: string;
  status: PreloadStatus;
  attempts: number;
  durationMilliseconds?: number;
  errorMessage?: string;
}>;

export type PreloadRegistrySnapshot = readonly PreloadSnapshot[];

export type PreloadRegistry = {
  register(input: {
    id: string;
    label: string;
    load(): Promise<unknown>;
  }): void;
  preload(id: string): Promise<unknown>;
  getEntry(id: string): PreloadSnapshot | undefined;
  getSnapshot(): PreloadRegistrySnapshot;
  subscribe(listener: () => void): () => void;
};
