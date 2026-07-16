import type {
  ScenarioInput,
  ScenarioResult,
} from './analyticsTypes';

export type ScenarioAccumulator = {
  baselineScore: number;
  stressedScore: number;
  checksum: number;
};

export function createScenarioAccumulator(): ScenarioAccumulator {
  return {
    baselineScore: 0,
    stressedScore: 0,
    checksum: 0,
  };
}

export function calculateScenarioRange(
  input: ScenarioInput,
  startIndex: number,
  endIndex: number,
  accumulator: ScenarioAccumulator,
): void {
  const shock = input.shockPercent / 100;

  for (let index = startIndex; index < endIndex; index += 1) {
    const baseline = 500 + ((index * 37) % 4_500);
    const sensitivity = 0.25 + ((index * 17) % 75) / 100;
    let syntheticAdjustment = 0;

    for (let iteration = 0; iteration < input.iterations; iteration += 1) {
      syntheticAdjustment += Math.sin(
        (index + 1) * (iteration + 1) * 0.000_013,
      );
    }

    const stressed =
      baseline * (1 + shock * sensitivity) +
      syntheticAdjustment * shock * 0.05;

    accumulator.baselineScore += baseline;
    accumulator.stressedScore += stressed;
    accumulator.checksum += syntheticAdjustment;
  }
}

export function completeScenarioResult(
  input: ScenarioInput,
  accumulator: ScenarioAccumulator,
): ScenarioResult {
  return {
    positionCount: input.positionCount,
    baselineScore: accumulator.baselineScore,
    stressedScore: accumulator.stressedScore,
    changeScore: accumulator.stressedScore - accumulator.baselineScore,
    checksum: accumulator.checksum,
  };
}

export function calculateScenario(input: ScenarioInput): ScenarioResult {
  const accumulator = createScenarioAccumulator();

  calculateScenarioRange(input, 0, input.positionCount, accumulator);

  return completeScenarioResult(input, accumulator);
}
