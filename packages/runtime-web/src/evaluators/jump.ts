import type { SequenceStep } from "@manse/schema";

import type { BodyMetricsSample } from "../body-metrics.js";
import type { ChallengeGuide, RuntimePose, RuntimeTarget } from "../types.js";
import {
  baseGuide,
  framingHint,
  meanConfidence,
  type ChallengeEvaluator,
  type EvaluatorContext,
} from "./evaluator.js";

type JumpConfig = Extract<SequenceStep, { type: "jump" }>;

const BASELINE_SAMPLES = 4;
const LANDING_BAND = 0.35;

/**
 * Jump repetitions against the player's own grounded hip baseline: take off by
 * rising minRiseRatio of torso length, then land and stay stable for
 * landingStableMs before the repetition counts. Cooldown rejects re-triggering
 * from landing wobble.
 */
export class JumpEvaluator implements ChallengeEvaluator {
  private state: "calibrating" | "grounded" | "airborne" | "landing" | "cooldown" = "calibrating";
  private groundedHipY: number | null = null;
  private baselineCount = 0;
  private landingStableMs = 0;
  private cooldownRemainingMs = 0;
  private reps = 0;
  private riseNow = 0;
  private visible = false;
  private framing: ChallengeGuide["framing"] = null;
  private confidence = 0;

  constructor(
    private readonly config: JumpConfig,
    private readonly ctx: EvaluatorContext,
  ) {}

  enter(): void {
    this.state = "calibrating";
    this.groundedHipY = null;
    this.baselineCount = 0;
    this.reps = 0;
    this.landingStableMs = 0;
    this.cooldownRemainingMs = 0;
  }

  update(sample: BodyMetricsSample, _pose: RuntimePose | null, deltaMs: number): void {
    this.framing = framingHint(sample);
    this.confidence = meanConfidence(sample, ["left_hip", "right_hip", "left_ankle", "right_ankle"]);
    if (this.isComplete()) return;

    const hipY = sample.hipY;
    this.visible = hipY !== null && sample.bodyScale > 0;
    if (!this.visible || hipY === null) return;

    if (this.cooldownRemainingMs > 0) {
      this.cooldownRemainingMs = Math.max(0, this.cooldownRemainingMs - deltaMs);
      this.trackBaseline(hipY);
      if (this.cooldownRemainingMs === 0) this.state = "grounded";
      return;
    }

    if (this.state === "calibrating") {
      this.trackBaseline(hipY);
      if (this.baselineCount >= BASELINE_SAMPLES) this.state = "grounded";
      return;
    }

    const grounded = this.groundedHipY;
    if (grounded === null) return;
    const requiredRise = this.config.minRiseRatio * sample.bodyScale;
    const rise = grounded - hipY;
    this.riseNow = requiredRise <= 0 ? 0 : Math.min(1, Math.max(0, rise / requiredRise));

    switch (this.state) {
      case "grounded": {
        // The baseline must not chase the hips during the ascent itself, or
        // the measured rise can never reach the threshold.
        if (rise <= requiredRise * 0.15) this.trackBaseline(hipY);
        if (rise >= requiredRise) this.state = "airborne";
        return;
      }
      case "airborne": {
        if (rise <= requiredRise * LANDING_BAND) {
          this.state = "landing";
          this.landingStableMs = 0;
        }
        return;
      }
      case "landing": {
        if (rise > requiredRise * LANDING_BAND) {
          // Bounced back up before settling: still the same airborne phase.
          this.state = "airborne";
          return;
        }
        this.landingStableMs += deltaMs;
        if (this.landingStableMs >= this.config.landingStableMs) {
          this.reps += 1;
          this.ctx.emit({
            type: "unit-complete",
            unit: this.reps,
            total: this.config.repetitions,
            label: "jump",
          });
          this.cooldownRemainingMs = this.config.cooldownMs;
          this.state = "cooldown";
        }
        return;
      }
      default:
        return;
    }
  }

  tick(): void {}

  isComplete(): boolean {
    return this.reps >= this.config.repetitions;
  }

  targets(): readonly RuntimeTarget[] {
    return [];
  }

  guide(): ChallengeGuide {
    const done = this.isComplete();
    return {
      ...baseGuide("jump"),
      phase: done
        ? "done"
        : !this.visible || this.state === "calibrating"
          ? "idle"
          : this.state === "cooldown"
            ? "cooldown"
            : this.state === "airborne" || this.state === "landing"
              ? "holding"
              : "active",
      progress: done ? 1 : (this.reps + Math.min(1, this.riseNow)) / this.config.repetitions,
      completedUnits: this.reps,
      totalUnits: this.config.repetitions,
      holdProgress: this.state === "landing"
        ? Math.min(1, this.landingStableMs / Math.max(1, this.config.landingStableMs))
        : Math.min(1, this.riseNow),
      confidence: this.confidence,
      repetitionCount: this.reps,
      arrow: this.state === "grounded" ? "up" : null,
      framing: this.framing,
    };
  }

  private trackBaseline(hipY: number): void {
    this.groundedHipY = this.groundedHipY === null ? hipY : this.groundedHipY + (hipY - this.groundedHipY) * 0.2;
    this.baselineCount += 1;
  }
}
