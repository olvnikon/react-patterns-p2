import type { ContextProviderName } from '../runtime';

export type DemoSession = Readonly<{
  userId: string;
  deskId: string;
}>;

export type BootstrapReferenceData = Readonly<{
  instruments: readonly string[];
  portfolios: readonly string[];
}>;

export type RestoredWorkspace = Readonly<{
  selectedPortfolioId: string;
  layout: string;
}>;

export type PlatformContext = Readonly<{
  provider: ContextProviderName;
  instrumentId: string;
}>;

export type MarketDataConnection = Readonly<{
  status: 'connected';
  connectedAt: string;
}>;

export type BootstrapServices = {
  initializePlatformContext(
    provider: ContextProviderName,
    signal: AbortSignal,
  ): Promise<PlatformContext>;
  loadSession(signal: AbortSignal): Promise<DemoSession>;
  loadReferenceData(
    session: DemoSession,
    signal: AbortSignal,
  ): Promise<BootstrapReferenceData>;
  restoreWorkspace(
    session: DemoSession,
    signal: AbortSignal,
  ): Promise<RestoredWorkspace>;
  connectMarketData(signal: AbortSignal): Promise<MarketDataConnection>;
};
