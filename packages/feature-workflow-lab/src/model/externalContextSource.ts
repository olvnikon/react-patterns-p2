export type ExternalContextSource = {
  publishInstrument(instrumentId: string): void;
  subscribeInstrument(listener: (instrumentId: string) => void): () => void;
};

export function createMockExternalContextSource(): ExternalContextSource {
  const listeners = new Set<(instrumentId: string) => void>();

  return {
    publishInstrument(instrumentId) {
      for (const listener of listeners) {
        listener(instrumentId);
      }
    },
    subscribeInstrument(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}
