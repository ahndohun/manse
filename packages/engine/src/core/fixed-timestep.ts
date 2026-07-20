import { DEFAULT_ENGINE_TUNING, type EngineTuning } from "../config/tuning.js";

export interface FixedStep {
  readonly deltaMs: number;
  readonly simulationTimeMs: number;
  readonly step: number;
}

export interface FixedTimestepResult {
  readonly steps: number;
  readonly interpolationAlpha: number;
  readonly simulationTimeMs: number;
  readonly droppedMs: number;
}

export type FixedStepCallback = (step: FixedStep) => void;

/**
 * A wall-clock-independent fixed timestep accumulator. Rendering adapters call
 * `advance(timestampMs)`; deterministic tests and replays call `advanceBy(deltaMs)`.
 */
export class FixedTimestepEngine {
  readonly stepMs: number;
  readonly maxFrameDeltaMs: number;
  readonly maxSubSteps: number;

  private accumulatorMs = 0;
  private lastTimestampMs: number | undefined;
  private simulationTimeMs = 0;
  private stepCount = 0;
  private paused = false;

  constructor(
    private readonly update: FixedStepCallback,
    config: EngineTuning["fixedStep"] = DEFAULT_ENGINE_TUNING.fixedStep,
  ) {
    if (!Number.isFinite(config.stepMs) || config.stepMs <= 0) {
      throw new RangeError("fixedStep.stepMs must be positive and finite");
    }
    if (!Number.isFinite(config.maxFrameDeltaMs) || config.maxFrameDeltaMs < config.stepMs) {
      throw new RangeError("fixedStep.maxFrameDeltaMs must be finite and at least stepMs");
    }
    if (!Number.isInteger(config.maxSubSteps) || config.maxSubSteps < 1) {
      throw new RangeError("fixedStep.maxSubSteps must be a positive integer");
    }
    this.stepMs = config.stepMs;
    this.maxFrameDeltaMs = config.maxFrameDeltaMs;
    this.maxSubSteps = config.maxSubSteps;
  }

  advance(timestampMs: number): FixedTimestepResult {
    assertFiniteNonNegative(timestampMs, "timestampMs");
    if (this.paused) {
      this.lastTimestampMs = timestampMs;
      return this.result(0, 0);
    }
    if (this.lastTimestampMs === undefined) {
      this.lastTimestampMs = timestampMs;
      return this.result(0, 0);
    }
    const elapsedMs = Math.max(0, timestampMs - this.lastTimestampMs);
    this.lastTimestampMs = timestampMs;
    return this.advanceBy(elapsedMs);
  }

  advanceBy(elapsedMs: number): FixedTimestepResult {
    assertFiniteNonNegative(elapsedMs, "elapsedMs");
    if (this.paused) return this.result(0, 0);

    const acceptedMs = Math.min(elapsedMs, this.maxFrameDeltaMs);
    let droppedMs = elapsedMs - acceptedMs;
    this.accumulatorMs += acceptedMs;
    let steps = 0;

    while (this.accumulatorMs + Number.EPSILON >= this.stepMs && steps < this.maxSubSteps) {
      this.accumulatorMs -= this.stepMs;
      this.simulationTimeMs += this.stepMs;
      this.stepCount += 1;
      steps += 1;
      this.update({
        deltaMs: this.stepMs,
        simulationTimeMs: this.simulationTimeMs,
        step: this.stepCount,
      });
    }

    if (this.accumulatorMs >= this.stepMs) {
      const retainedMs = this.accumulatorMs % this.stepMs;
      droppedMs += this.accumulatorMs - retainedMs;
      this.accumulatorMs = retainedMs;
    }
    return this.result(steps, droppedMs);
  }

  pause(): void {
    this.paused = true;
    this.accumulatorMs = 0;
  }

  resume(timestampMs?: number): void {
    if (timestampMs !== undefined) assertFiniteNonNegative(timestampMs, "timestampMs");
    this.paused = false;
    this.accumulatorMs = 0;
    this.lastTimestampMs = timestampMs;
  }

  reset(simulationTimeMs = 0): void {
    assertFiniteNonNegative(simulationTimeMs, "simulationTimeMs");
    this.accumulatorMs = 0;
    this.lastTimestampMs = undefined;
    this.simulationTimeMs = simulationTimeMs;
    this.stepCount = 0;
    this.paused = false;
  }

  private result(steps: number, droppedMs: number): FixedTimestepResult {
    return {
      steps,
      interpolationAlpha: this.accumulatorMs / this.stepMs,
      simulationTimeMs: this.simulationTimeMs,
      droppedMs,
    };
  }
}

function assertFiniteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be finite and non-negative`);
  }
}
