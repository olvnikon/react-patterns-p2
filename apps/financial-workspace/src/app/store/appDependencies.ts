import {
  createMockClock,
  createMockLogger,
  createMockOrderApprovalRepository,
  type MockClock,
  type MockLogger,
  type OrderApprovalRepository,
} from '@demo/shared-api';

export type AppDependencies = {
  orderApprovalRepository: OrderApprovalRepository;
  logger: MockLogger;
  clock: MockClock;
};

export function createAppDependencies(): AppDependencies {
  return {
    orderApprovalRepository: createMockOrderApprovalRepository(),
    logger: createMockLogger(),
    clock: createMockClock(),
  };
}
