import type { RuntimeConfig } from '../runtime';
import type { BootstrapRuntime } from '../bootstrap';
import type { PreloadRegistry } from '../prefetch';

export type ApplicationDiagnostics = Readonly<{
  runtimeConfig: RuntimeConfig;
  bootstrap: BootstrapRuntime;
  prefetch: PreloadRegistry;
  wiring: ReadonlyArray<{
    capability: string;
    implementation: string;
    lifetime: string;
  }>;
}>;

export type ApplicationRuntime = {
  diagnostics: ApplicationDiagnostics;
  start(): Promise<void>;
  mount(rootElement: HTMLElement): void;
  stop(): void;
};
