export type MockLogger = {
  info(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
};

export function createMockLogger(): MockLogger {
  return {
    info() {},
    error() {},
  };
}
