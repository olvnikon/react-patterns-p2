import type { RuntimeConfig } from '../runtime';

export type ApplicationDiagnostics = Readonly<{
  runtimeConfig: RuntimeConfig;
  wiring: ReadonlyArray<{
    capability: string;
    implementation: string;
    lifetime: string;
  }>;
}>;

export type ApplicationRuntime = {
  diagnostics: ApplicationDiagnostics;
  mount(rootElement: HTMLElement): void;
  stop(): void;
};
