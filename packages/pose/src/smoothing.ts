import type { PoseFrame, PoseLandmark } from "./types.js";

export interface OneEuroFilterOptions {
  /** Lower values smooth more at low speed. */
  readonly minCutoff?: number;
  /** Higher values reduce lag during fast movement. */
  readonly beta?: number;
  readonly derivativeCutoff?: number;
  readonly minimumDeltaSeconds?: number;
}

const DEFAULT_OPTIONS: Required<OneEuroFilterOptions> = {
  minCutoff: 1,
  beta: 0.02,
  derivativeCutoff: 1,
  minimumDeltaSeconds: 1 / 240,
};

class LowPassFilter {
  private initialized = false;
  private value = 0;

  filter(value: number, alpha: number): number {
    if (!this.initialized) {
      this.initialized = true;
      this.value = value;
      return value;
    }
    this.value = alpha * value + (1 - alpha) * this.value;
    return this.value;
  }

  reset(): void {
    this.initialized = false;
    this.value = 0;
  }
}

export class OneEuroFilter {
  private readonly options: Required<OneEuroFilterOptions>;
  private readonly signal = new LowPassFilter();
  private readonly derivative = new LowPassFilter();
  private previousRaw: number | null = null;
  private previousTimestampMs: number | null = null;

  constructor(options: OneEuroFilterOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    if (this.options.minCutoff <= 0 || this.options.derivativeCutoff <= 0) {
      throw new RangeError("One Euro cutoff frequencies must be greater than zero.");
    }
    if (this.options.beta < 0 || this.options.minimumDeltaSeconds <= 0) {
      throw new RangeError("One Euro beta must be non-negative and delta must be positive.");
    }
  }

  filter(value: number, timestampMs: number): number {
    if (!Number.isFinite(value) || !Number.isFinite(timestampMs)) {
      throw new TypeError("One Euro filter inputs must be finite numbers.");
    }
    if (this.previousRaw === null || this.previousTimestampMs === null) {
      this.previousRaw = value;
      this.previousTimestampMs = timestampMs;
      return this.signal.filter(value, 1);
    }
    const deltaSeconds = Math.max(
      (timestampMs - this.previousTimestampMs) / 1000,
      this.options.minimumDeltaSeconds,
    );
    const rawDerivative = (value - this.previousRaw) / deltaSeconds;
    const smoothedDerivative = this.derivative.filter(
      rawDerivative,
      smoothingAlpha(this.options.derivativeCutoff, deltaSeconds),
    );
    const cutoff = this.options.minCutoff + this.options.beta * Math.abs(smoothedDerivative);
    const filtered = this.signal.filter(
      value,
      smoothingAlpha(cutoff, deltaSeconds),
    );
    this.previousRaw = value;
    this.previousTimestampMs = Math.max(timestampMs, this.previousTimestampMs);
    return filtered;
  }

  reset(): void {
    this.signal.reset();
    this.derivative.reset();
    this.previousRaw = null;
    this.previousTimestampMs = null;
  }
}

function smoothingAlpha(cutoff: number, deltaSeconds: number): number {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / deltaSeconds);
}

interface LandmarkFilters {
  readonly x: OneEuroFilter;
  readonly y: OneEuroFilter;
  readonly z: OneEuroFilter;
}

export class OneEuroLandmarkSmoother {
  private readonly filters = new Map<string, LandmarkFilters>();

  constructor(private readonly options: OneEuroFilterOptions = {}) {}

  smooth(frame: PoseFrame): PoseFrame {
    return {
      ...frame,
      poses: frame.poses.map((pose, poseIndex) => ({
        ...pose,
        landmarks: pose.landmarks.map((landmark) =>
          this.smoothLandmark(landmark, poseIndex, "screen", frame.timestampMs),
        ),
        worldLandmarks: pose.worldLandmarks?.map((landmark) =>
          this.smoothLandmark(landmark, poseIndex, "world", frame.timestampMs),
        ),
      })),
    };
  }

  reset(): void {
    this.filters.clear();
  }

  private smoothLandmark(
    landmark: PoseLandmark,
    poseIndex: number,
    space: "screen" | "world",
    timestampMs: number,
  ): PoseLandmark {
    const key = `${space}:${poseIndex}:${landmark.index}`;
    let filters = this.filters.get(key);
    if (filters === undefined) {
      filters = {
        x: new OneEuroFilter(this.options),
        y: new OneEuroFilter(this.options),
        z: new OneEuroFilter(this.options),
      };
      this.filters.set(key, filters);
    }
    return {
      ...landmark,
      x: filters.x.filter(landmark.x, timestampMs),
      y: filters.y.filter(landmark.y, timestampMs),
      z: filters.z.filter(landmark.z, timestampMs),
    };
  }
}
