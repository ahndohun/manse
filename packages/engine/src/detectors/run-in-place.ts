import { DEFAULT_ENGINE_TUNING } from "../config/tuning.js";
import type { BodyFrame, BodyJoint, DetectorSnapshot, EngineEvent } from "../types.js";
import { bodyScale, clamp01, visibleLandmark } from "./motion.js";
import {
  assertDetectorDelta,
  emptyDetectorSnapshot,
  type ChallengeDetector,
  type ChallengeOf,
  type DetectorContext,
} from "./types.js";

type Side = "left" | "right";

export class RunInPlaceDetector implements ChallengeDetector {
  readonly challengeType = "run_in_place" as const;
  private readonly tuning;
  private readonly minimumConfidence: number;
  private readonly thresholdMultiplier: number;
  private readonly movementMode: "standard" | "seated-arms";
  private readonly activeSide: "both" | Side;
  private readonly baselines: Partial<Record<Side, number>> = {};
  private readonly armed: Record<Side, boolean> = { left: true, right: true };
  private lastSide: Side | undefined;
  private lastStepAt: number | undefined;
  private stepCount = 0;
  private activeMs = 0;
  private elapsedMs = 0;
  private completed = false;
  private current: DetectorSnapshot;

  constructor(readonly challenge: ChallengeOf<"run_in_place">, options: DetectorContext = {}) {
    this.tuning = options.tuning ?? DEFAULT_ENGINE_TUNING;
    const tier = this.tuning.tiers[options.tier ?? "A"];
    this.minimumConfidence = this.tuning.input.minimumLandmarkConfidence * tier.confidenceFloorMultiplier;
    this.thresholdMultiplier = tier.motionThresholdMultiplier;
    this.movementMode = options.movementMode ?? "standard";
    this.activeSide = options.activeSide ?? "both";
    this.current = emptyDetectorSnapshot(this.challengeType, challenge.durationMs);
  }

  update(frame: BodyFrame, deltaMs: number): DetectorSnapshot {
    assertDetectorDelta(deltaMs);
    if (this.completed) return this.snapshot();
    this.elapsedMs += deltaMs;
    const scale = bodyScale(frame, this.minimumConfidence, 0.2);
    const maxGap = this.tuning.run.maximumStepGapMs[this.challenge.intensity];
    const events: EngineEvent[] = [];
    let tracked = 0;
    for (const side of ["left", "right"] as const) {
      const value = this.relativeLiftSource(frame, side);
      if (value === undefined) continue;
      tracked += 1;
      this.baselines[side] ??= value;
      const baseline = this.baselines[side];
      const liftRatio = this.movementMode === "seated-arms"
        ? this.tuning.run.armLiftBodyRatio
        : this.tuning.run.liftBodyRatio;
      const liftThreshold = liftRatio * scale * this.thresholdMultiplier;
      const releaseThreshold = this.tuning.run.releaseBodyRatio * scale;
      const lift = baseline - value;
      if (lift <= releaseThreshold) this.armed[side] = true;
      const sideAllowed = this.activeSide === "both" || this.activeSide === side;
      const gap = this.lastStepAt === undefined ? Number.POSITIVE_INFINITY : frame.timestampMs - this.lastStepAt;
      if (
        sideAllowed && this.armed[side] && lift >= liftThreshold &&
        side !== this.lastSide && gap >= this.tuning.run.minimumStepGapMs
      ) {
        this.armed[side] = false;
        this.lastSide = side;
        this.lastStepAt = frame.timestampMs;
        this.stepCount += 1;
        events.push({
          type: "step",
          challengeType: this.challengeType,
          timestampMs: frame.timestampMs,
          side,
          value: this.stepCount,
        });
      }
    }
    const cadenceActive = this.lastStepAt !== undefined && frame.timestampMs - this.lastStepAt <= maxGap;
    if (cadenceActive && tracked > 0) this.activeMs += deltaMs;
    this.completed = this.activeMs + Number.EPSILON >= this.challenge.durationMs;
    if (this.completed) {
      this.activeMs = this.challenge.durationMs;
      events.push({ type: "challenge-completed", challengeType: this.challengeType, timestampMs: frame.timestampMs });
    }
    this.current = {
      challengeType: this.challengeType,
      elapsedMs: this.elapsedMs,
      progress: clamp01(this.activeMs / this.challenge.durationMs),
      count: this.stepCount,
      targetCount: this.challenge.durationMs,
      active: cadenceActive,
      completed: this.completed,
      confidence: tracked === 0 ? 0 : frame.confidence,
      events,
    };
    return this.current;
  }

  snapshot(): DetectorSnapshot { return { ...this.current, events: [] }; }

  reset(): void {
    delete this.baselines.left;
    delete this.baselines.right;
    this.armed.left = true;
    this.armed.right = true;
    this.lastSide = undefined;
    this.lastStepAt = undefined;
    this.stepCount = 0;
    this.activeMs = 0;
    this.elapsedMs = 0;
    this.completed = false;
    this.current = emptyDetectorSnapshot(this.challengeType, this.challenge.durationMs);
  }

  private relativeLiftSource(frame: BodyFrame, side: Side): number | undefined {
    const movingJoint: BodyJoint = this.movementMode === "seated-arms" ? `${side}_wrist` : `${side}_knee`;
    const anchorJoint: BodyJoint = this.movementMode === "seated-arms" ? `${side}_shoulder` : `${side}_hip`;
    const moving = visibleLandmark(frame, movingJoint, this.minimumConfidence);
    const anchor = visibleLandmark(frame, anchorJoint, this.minimumConfidence);
    return moving === undefined || anchor === undefined ? undefined : moving.y - anchor.y;
  }
}
