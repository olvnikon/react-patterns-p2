export type MockClock = {
  now(): string;
};

export function createMockClock(): MockClock {
  return {
    now() {
      return '2026-01-01T00:00:00.000Z';
    },
  };
}
