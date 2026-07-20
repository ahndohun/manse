import type { Pose, PoseFrame, PoseLandmark } from "./types.js";

export interface VelocityExtrapolationOptions {
  readonly maxHorizonMs?: number;
  /** Maximum 3D landmark velocity in coordinate units per second. */
  readonly maxSpeedPerSecond?: number;
  /** Bounds predicted normalized x and y values. */
  readonly normalizedMargin?: number;
}

const DEFAULT_OPTIONS: Required<VelocityExtrapolationOptions> = {
  maxHorizonMs: 50,
  maxSpeedPerSecond: 2.5,
  normalizedMargin: 0.05,
};

export function extrapolatePoseFrame(
  previous: PoseFrame,
  current: PoseFrame,
  targetTimestampMs: number,
  options: VelocityExtrapolationOptions = {},
): PoseFrame {
  const resolved = { ...DEFAULT_OPTIONS, ...options };
  validateOptions(resolved);
  const observedDeltaMs = current.timestampMs - previous.timestampMs;
  const requestedHorizonMs = Math.max(0, targetTimestampMs - current.timestampMs);
  const horizonMs = Math.min(requestedHorizonMs, resolved.maxHorizonMs);
  if (observedDeltaMs <= 0 || horizonMs === 0) {
    return {
      ...current,
      timestampMs: current.timestampMs + horizonMs,
      predictionHorizonMs: horizonMs,
    };
  }
  return {
    ...current,
    timestampMs: current.timestampMs + horizonMs,
    predictionHorizonMs: horizonMs,
    poses: current.poses.map((pose, poseIndex) =>
      extrapolatePose(previous.poses[poseIndex], pose, observedDeltaMs, horizonMs, resolved),
    ),
  };
}

function extrapolatePose(
  previous: Pose | undefined,
  current: Pose,
  observedDeltaMs: number,
  horizonMs: number,
  options: Required<VelocityExtrapolationOptions>,
): Pose {
  if (previous === undefined) return current;
  return {
    ...current,
    landmarks: current.landmarks.map((landmark, index) =>
      extrapolateLandmark(
        previous.landmarks[index], landmark, observedDeltaMs, horizonMs, options, true,
      ),
    ),
    worldLandmarks: current.worldLandmarks?.map((landmark, index) =>
      extrapolateLandmark(
        previous.worldLandmarks?.[index], landmark, observedDeltaMs, horizonMs, options, false,
      ),
    ),
  };
}

function extrapolateLandmark(
  previous: PoseLandmark | undefined,
  current: PoseLandmark,
  observedDeltaMs: number,
  horizonMs: number,
  options: Required<VelocityExtrapolationOptions>,
  normalized: boolean,
): PoseLandmark {
  if (previous === undefined || previous.name !== current.name) return current;
  const seconds = observedDeltaMs / 1000;
  const velocity = {
    x: (current.x - previous.x) / seconds,
    y: (current.y - previous.y) / seconds,
    z: (current.z - previous.z) / seconds,
  };
  const speed = Math.hypot(velocity.x, velocity.y, velocity.z);
  const scale = speed > options.maxSpeedPerSecond ? options.maxSpeedPerSecond / speed : 1;
  const horizonSeconds = horizonMs / 1000;
  const x = current.x + velocity.x * scale * horizonSeconds;
  const y = current.y + velocity.y * scale * horizonSeconds;
  return {
    ...current,
    x: normalized ? clamp(x, -options.normalizedMargin, 1 + options.normalizedMargin) : x,
    y: normalized ? clamp(y, -options.normalizedMargin, 1 + options.normalizedMargin) : y,
    z: current.z + velocity.z * scale * horizonSeconds,
  };
}

function validateOptions(options: Required<VelocityExtrapolationOptions>): void {
  if (options.maxHorizonMs < 0 || options.maxSpeedPerSecond <= 0 || options.normalizedMargin < 0) {
    throw new RangeError("Invalid velocity extrapolation bounds.");
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export class BoundedVelocityExtrapolator {
  private previous: PoseFrame | null = null;
  private current: PoseFrame | null = null;

  constructor(private readonly options: VelocityExtrapolationOptions = {}) {}

  push(frame: PoseFrame): void {
    if (this.current !== null && frame.timestampMs < this.current.timestampMs) return;
    this.previous = this.current;
    this.current = frame;
  }

  predict(targetTimestampMs: number): PoseFrame | null {
    if (this.current === null) return null;
    if (this.previous === null) return this.current;
    return extrapolatePoseFrame(this.previous, this.current, targetTimestampMs, this.options);
  }

  reset(): void {
    this.previous = null;
    this.current = null;
  }
}
