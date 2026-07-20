import type { Challenge } from "@manse/schema";
import type { EngineTuning } from "../config/tuning.js";
import type { GameSpace, NormalizedBox } from "../core/game-space.js";
import type { BodyFrame, DetectorSnapshot, DeviceTier } from "../types.js";

export type ChallengeType = Challenge["type"];

export interface DetectorContext {
  readonly tuning?: EngineTuning;
  readonly tier?: DeviceTier;
  readonly gameSpace?: GameSpace;
  readonly reachBox?: NormalizedBox;
  readonly activeSide?: "both" | "left" | "right";
  readonly movementMode?: "standard" | "seated-arms";
}

export interface ChallengeDetector {
  readonly challengeType: ChallengeType;
  update(frame: BodyFrame, deltaMs: number): DetectorSnapshot;
  snapshot(): DetectorSnapshot;
  reset(): void;
}

export type ChallengeOf<T extends ChallengeType> = Extract<Challenge, { type: T }>;

export function emptyDetectorSnapshot(
  challengeType: string,
  targetCount: number,
): DetectorSnapshot {
  return {
    challengeType,
    elapsedMs: 0,
    progress: 0,
    count: 0,
    targetCount,
    active: false,
    completed: false,
    confidence: 0,
    events: [],
  };
}

export function assertDetectorDelta(deltaMs: number): void {
  if (!Number.isFinite(deltaMs) || deltaMs < 0) {
    throw new RangeError("deltaMs must be finite and non-negative");
  }
}
