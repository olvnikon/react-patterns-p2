import type { RuntimeConfig } from '../runtime';
import type { BootstrapRuntime } from '../bootstrap';

export type ApplicationDiagnostics = Readonly<{
  runtimeConfig: RuntimeConfig;
  bootstrap: BootstrapRuntime;
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
