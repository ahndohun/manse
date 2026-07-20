import { DEFAULT_ENGINE_TUNING } from "../config/tuning.js";
import type { BodyFrame, DetectorSnapshot, EngineEvent } from "../types.js";
import { bodyScale, clamp01, visibleLandmark } from "./motion.js";
import { assertDetectorDelta, emptyDetectorSnapshot, type DetectorContext } from "./types.js";

/** Brand completion gesture: both wrists above the head for a configured hold. */
export class MansePoseDetector {
  readonly challengeType = "manse_pose" as const;
  private readonly tuning;
  private readonly minimumConfidence: number;
  private readonly thresholdMultiplier: number;
  private readonly dropoutGraceMs: number;
  private elapsedMs = 0;
  private holdMs = 0;
  private dropoutMs = 0;
  private active = false;
  private completed = false;
  private current = emptyDetectorSnapshot(this.challengeType, DEFAULT_ENGINE_TUNING.mansePose.holdMs);

  constructor(options: DetectorContext = {}) {
    this.tuning = options.tuning ?? DEFAULT_ENGINE_TUNING;
    const tier = this.tuning.tiers[options.tier ?? "A"];
    this.minimumConfidence = this.tuning.input.minimumLandmarkConfidence * tier.confidenceFloorMultiplier;
    this.thresholdMultiplier = tier.motionThresholdMultiplier;
    this.dropoutGraceMs = this.tuning.targets.dropoutGraceMs * tier.dropoutGraceMultiplier;
    this.current = emptyDetectorSnapshot(this.challengeType, this.tuning.mansePose.holdMs);
  }

  update(frame: BodyFrame, deltaMs: number): DetectorSnapshot {
    assertDetectorDelta(deltaMs);
    if (this.completed) return this.snapshot();
    this.elapsedMs += deltaMs;
    const nose = visibleLandmark(frame, "nose", this.minimumConfidence);
    const left = visibleLandmark(frame, "left_wrist", this.minimumConfidence);
    const right = visibleLandmark(frame, "right_wrist", this.minimumConfidence);
    const scale = bodyScale(frame, this.minimumConfidence, 0.2);
    const requiredMargin = this.tuning.mansePose.wristAboveHeadBodyRatio * scale * this.thresholdMultiplier;
    const releaseMargin = this.tuning.mansePose.releaseMarginBodyRatio * scale;
    const limit = nose === undefined ? undefined : nose.y - (this.active ? -releaseMargin : requiredMargin);
    const matches = limit !== undefined && left !== undefined && right !== undefined &&
      left.y <= limit && right.y <= limit;
    const events: EngineEvent[] = [];
    if (matches) {
      this.dropoutMs = 0;
      if (!this.active) {
        this.active = true;
        events.push({ type: "hold-started", challengeType: this.challengeType, timestampMs: frame.timestampMs });
      }
      this.holdMs += deltaMs;
    } else if (this.active) {
      this.dropoutMs += deltaMs;
      if (this.dropoutMs > this.dropoutGraceMs) {
        this.active = false;
        this.holdMs = 0;
        this.dropoutMs = 0;
        events.push({ type: "hold-lost", challengeType: this.challengeType, timestampMs: frame.timestampMs });
      }
    }
    this.completed = this.holdMs + Number.EPSILON >= this.tuning.mansePose.holdMs;
    if (this.completed) {
      this.holdMs = this.tuning.mansePose.holdMs;
      events.push({ type: "manse-pose-completed", challengeType: this.challengeType, timestampMs: frame.timestampMs });
    }
    this.current = {
      challengeType: this.challengeType,
      elapsedMs: this.elapsedMs,
      progress: clamp01(this.holdMs / this.tuning.mansePose.holdMs),
      count: Math.round(this.holdMs),
      targetCount: this.tuning.mansePose.holdMs,
      active: this.active,
      completed: this.completed,
      confidence: matches ? frame.confidence : 0,
      events,
    };
    return this.current;
  }

  snapshot(): DetectorSnapshot { return { ...this.current, events: [] }; }

  reset(): void {
    this.elapsedMs = 0;
    this.holdMs = 0;
    this.dropoutMs = 0;
    this.active = false;
    this.completed = false;
    this.current = emptyDetectorSnapshot(this.challengeType, this.tuning.mansePose.holdMs);
  }
}
