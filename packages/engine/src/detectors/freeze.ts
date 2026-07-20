import { DEFAULT_ENGINE_TUNING } from "../config/tuning.js";
import type { BodyFrame, BodyJoint, DetectorSnapshot, EngineEvent } from "../types.js";
import { averageJointSpeed, clamp01 } from "./motion.js";
import {
  assertDetectorDelta,
  emptyDetectorSnapshot,
  type ChallengeDetector,
  type ChallengeOf,
  type DetectorContext,
} from "./types.js";

export class FreezeDetector implements ChallengeDetector {
  readonly challengeType = "freeze" as const;
  private readonly tuning;
  private readonly minimumConfidence: number;
  private readonly velocityThreshold: number;
  private readonly movementGraceMs: number;
  private previous: BodyFrame | undefined;
  private elapsedMs = 0;
  private holdMs = 0;
  private movementMs = 0;
  private active = false;
  private completed = false;
  private current: DetectorSnapshot;

  constructor(readonly challenge: ChallengeOf<"freeze">, options: DetectorContext = {}) {
    this.tuning = options.tuning ?? DEFAULT_ENGINE_TUNING;
    const tier = this.tuning.tiers[options.tier ?? "A"];
    this.minimumConfidence = this.tuning.input.minimumLandmarkConfidence * tier.confidenceFloorMultiplier;
    this.velocityThreshold = this.tuning.freeze.velocityThresholdPerSecond * tier.stillnessThresholdMultiplier;
    this.movementGraceMs = this.tuning.freeze.movementGraceMs * tier.dropoutGraceMultiplier;
    this.current = emptyDetectorSnapshot(this.challengeType, challenge.holdMs);
  }

  update(frame: BodyFrame, deltaMs: number): DetectorSnapshot {
    assertDetectorDelta(deltaMs);
    if (this.completed) return this.snapshot();
    this.elapsedMs += deltaMs;
    const speed = averageJointSpeed(
      frame,
      this.previous,
      this.tuning.freeze.trackedJoints as readonly BodyJoint[],
      this.minimumConfidence,
    );
    this.previous = frame;
    const still = speed !== undefined && speed <= this.velocityThreshold;
    const events: EngineEvent[] = [];
    if (still) {
      this.movementMs = 0;
      if (!this.active) {
        this.active = true;
        events.push({ type: "hold-started", challengeType: this.challengeType, timestampMs: frame.timestampMs });
      }
      this.holdMs += deltaMs;
    } else if (this.active) {
      this.movementMs += deltaMs;
      if (this.movementMs > this.movementGraceMs) {
        this.active = false;
        this.holdMs = 0;
        this.movementMs = 0;
        events.push({ type: "hold-lost", challengeType: this.challengeType, timestampMs: frame.timestampMs });
      }
    }
    this.completed = this.holdMs + Number.EPSILON >= this.challenge.holdMs;
    if (this.completed) {
      this.holdMs = this.challenge.holdMs;
      events.push({ type: "challenge-completed", challengeType: this.challengeType, timestampMs: frame.timestampMs });
    }
    this.current = {
      challengeType: this.challengeType,
      elapsedMs: this.elapsedMs,
      progress: clamp01(this.holdMs / this.challenge.holdMs),
      count: Math.round(this.holdMs),
      targetCount: this.challenge.holdMs,
      active: this.active,
      completed: this.completed,
      confidence: speed === undefined ? 0 : frame.confidence,
      events,
    };
    return this.current;
  }

  snapshot(): DetectorSnapshot { return { ...this.current, events: [] }; }

  reset(): void {
    this.previous = undefined;
    this.elapsedMs = 0;
    this.holdMs = 0;
    this.movementMs = 0;
    this.active = false;
    this.completed = false;
    this.current = emptyDetectorSnapshot(this.challengeType, this.challenge.holdMs);
  }
}
