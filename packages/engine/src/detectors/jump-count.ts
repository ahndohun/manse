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

type JumpPhase = "ready" | "crouched" | "airborne" | "cooldown";

export class JumpCountDetector implements ChallengeDetector {
  readonly challengeType = "jump_count" as const;
  private readonly tuning;
  private readonly minimumConfidence: number;
  private readonly thresholdMultiplier: number;
  private phase: JumpPhase = "ready";
  private baselineHipY: number | undefined;
  private count = 0;
  private elapsedMs = 0;
  private cooldownMs = 0;
  private completed = false;
  private current: DetectorSnapshot;

  constructor(
    readonly challenge: ChallengeOf<"jump_count">,
    options: DetectorContext = {},
  ) {
    this.tuning = options.tuning ?? DEFAULT_ENGINE_TUNING;
    const tier = this.tuning.tiers[options.tier ?? "A"];
    this.minimumConfidence = this.tuning.input.minimumLandmarkConfidence * tier.confidenceFloorMultiplier;
    this.thresholdMultiplier = tier.motionThresholdMultiplier;
    this.current = emptyDetectorSnapshot(this.challengeType, challenge.count);
  }

  update(frame: BodyFrame, deltaMs: number): DetectorSnapshot {
    assertDetectorDelta(deltaMs);
    if (this.completed) return this.snapshot();
    this.elapsedMs += deltaMs;
    this.cooldownMs = Math.max(0, this.cooldownMs - deltaMs);
    const hip = hipCenter(frame, this.minimumConfidence);
    const events: EngineEvent[] = [];

    if (hip !== undefined) {
      const scale = bodyScale(frame, this.minimumConfidence, this.tuning.jump.minimumBodyScale);
      this.baselineHipY ??= hip.y;
      const baseline = this.baselineHipY;
      const crouchDepth = this.tuning.jump.crouchDepthBodyRatio * scale * this.thresholdMultiplier;
      const airborneHeight = this.tuning.jump.airborneHeightBodyRatio * scale * this.thresholdMultiplier;
      const landingHeight = this.tuning.jump.landingHeightBodyRatio * scale;

      if (this.phase === "ready" && this.cooldownMs === 0) {
        if (hip.y - baseline >= crouchDepth) {
          this.phase = "crouched";
        } else {
          const alpha = Math.min(1, this.tuning.jump.baselineAdaptationPerSecond * deltaMs / 1000);
          this.baselineHipY += (hip.y - this.baselineHipY) * alpha;
        }
      } else if (this.phase === "crouched" && hip.y <= baseline - airborneHeight) {
        this.phase = "airborne";
        this.count += 1;
        events.push({
          type: "rep",
          challengeType: this.challengeType,
          timestampMs: frame.timestampMs,
          value: this.count,
        });
      } else if (this.phase === "airborne" && hip.y >= baseline - landingHeight) {
        this.phase = "cooldown";
        this.cooldownMs = this.tuning.jump.cooldownMs;
      } else if (this.phase === "cooldown" && this.cooldownMs === 0) {
        this.phase = "ready";
        this.baselineHipY = hip.y;
      }
    }

    this.completed = this.count >= this.challenge.count;
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
      progress: clamp01(this.count / this.challenge.count),
      count: this.count,
      targetCount: this.challenge.count,
      active: this.phase === "crouched" || this.phase === "airborne",
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
    this.phase = "ready";
    this.baselineHipY = undefined;
    this.count = 0;
    this.elapsedMs = 0;
    this.cooldownMs = 0;
    this.completed = false;
    this.current = emptyDetectorSnapshot(this.challengeType, this.challenge.count);
  }
}
