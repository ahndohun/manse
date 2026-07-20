import { DEFAULT_ENGINE_TUNING } from "../config/tuning.js";
import type { BodyFrame, DetectorSnapshot, EngineEvent } from "../types.js";
import { bodyScale, clamp01, hipCenter } from "./motion.js";
import {
  assertDetectorDelta,
  emptyDetectorSnapshot,
  type ChallengeDetector,
  type ChallengeOf,
  type DetectorContext,
} from "./types.js";

type SquatPhase = "up" | "down" | "cooldown";

export class SquatDetector implements ChallengeDetector {
  readonly challengeType = "squat" as const;
  private readonly tuning;
  private readonly minimumConfidence: number;
  private readonly thresholdMultiplier: number;
  private phase: SquatPhase = "up";
  private baselineHipY: number | undefined;
  private count = 0;
  private elapsedMs = 0;
  private cooldownMs = 0;
  private completed = false;
  private current: DetectorSnapshot;

  constructor(readonly challenge: ChallengeOf<"squat">, options: DetectorContext = {}) {
    this.tuning = options.tuning ?? DEFAULT_ENGINE_TUNING;
    const tier = this.tuning.tiers[options.tier ?? "A"];
    this.minimumConfidence = this.tuning.input.minimumLandmarkConfidence * tier.confidenceFloorMultiplier;
    this.thresholdMultiplier = tier.motionThresholdMultiplier;
    this.current = emptyDetectorSnapshot(this.challengeType, challenge.reps);
  }

  update(frame: BodyFrame, deltaMs: number): DetectorSnapshot {
    assertDetectorDelta(deltaMs);
    if (this.completed) return this.snapshot();
    this.elapsedMs += deltaMs;
    this.cooldownMs = Math.max(0, this.cooldownMs - deltaMs);
    const hip = hipCenter(frame, this.minimumConfidence);
    const events: EngineEvent[] = [];
    if (hip !== undefined) {
      const scale = bodyScale(frame, this.minimumConfidence, this.tuning.squat.minimumBodyScale);
      this.baselineHipY ??= hip.y;
      const baseline = this.baselineHipY;
      const downDepth = this.tuning.squat.downDepthBodyRatio * scale * this.thresholdMultiplier;
      const upDepth = this.tuning.squat.upDepthBodyRatio * scale;

      if (this.phase === "up" && this.cooldownMs === 0) {
        if (hip.y - baseline >= downDepth) {
          this.phase = "down";
        } else {
          const alpha = Math.min(1, this.tuning.squat.baselineAdaptationPerSecond * deltaMs / 1000);
          this.baselineHipY += (hip.y - this.baselineHipY) * alpha;
        }
      } else if (this.phase === "down" && hip.y - baseline <= upDepth) {
        this.count += 1;
        this.phase = "cooldown";
        this.cooldownMs = this.tuning.squat.cooldownMs;
        events.push({
          type: "rep",
          challengeType: this.challengeType,
          timestampMs: frame.timestampMs,
          value: this.count,
        });
      } else if (this.phase === "cooldown" && this.cooldownMs === 0) {
        this.phase = "up";
        this.baselineHipY = hip.y;
      }
    }
    this.completed = this.count >= this.challenge.reps;
    if (this.completed) {
      events.push({
        type: "challenge-completed",
        challengeType: this.challengeType,
        timestampMs: frame.timestampMs,
        value: this.count,
      });
    }
    this.current = {
      challengeType: this.challengeType,
      elapsedMs: this.elapsedMs,
      progress: clamp01(this.count / this.challenge.reps),
      count: this.count,
      targetCount: this.challenge.reps,
      active: this.phase === "down",
      completed: this.completed,
      confidence: hip === undefined ? 0 : frame.confidence,
      events,
    };
    return this.current;
  }

  snapshot(): DetectorSnapshot {
    return { ...this.current, events: [] };
  }

  reset(): void {
    this.phase = "up";
    this.baselineHipY = undefined;
    this.count = 0;
    this.elapsedMs = 0;
    this.cooldownMs = 0;
    this.completed = false;
    this.current = emptyDetectorSnapshot(this.challengeType, this.challenge.reps);
  }
}
