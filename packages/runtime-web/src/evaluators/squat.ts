import type { SequenceStep } from "@manse/schema";

import type { BodyMetricsSample } from "../body-metrics.js";
import { TIER_PROFILES } from "../config.js";
import type { ChallengeGuide, RuntimePose, RuntimeTarget } from "../types.js";
import {
  baseGuide,
  framingHint,
  meanConfidence,
  type ChallengeEvaluator,
  type EvaluatorContext,
} from "./evaluator.js";

type SquatConfig = Extract<SequenceStep, { type: "squat" }>;

const BASELINE_SAMPLES = 4;
const RISE_HYSTERESIS = 0.4;

/**
 * Repetition state machine over body-relative depth: standing hip height is a
 * rolling baseline, the bottom requires the pack's depth ratio (of the
 * player's own torso) plus a bent knee, and a cooldown rejects bounce double
 * counts. Judged joints missing → the machine pauses, it never miscounts.
 */
export class SquatEvaluator implements ChallengeEvaluator {
  private readonly holdGoalMs: number;
  private state: "calibrating" | "up" | "down" | "cooldown" = "calibrating";
  private standingHipY: number | null = null;
  private baselineCount = 0;
  private bottomHoldMs = 0;
  private cooldownRemainingMs = 0;
  private reps = 0;
  private visible = false;
  private depthNow = 0;
  private framing: ChallengeGuide["framing"] = null;
  private confidence = 0;

  constructor(
    private readonly config: SquatConfig,
    private readonly ctx: EvaluatorContext,
  ) {
    this.holdGoalMs = Math.max(0, config.holdMs * TIER_PROFILES[ctx.tier].dwellScale);
  }

  enter(): void {
    this.state = "calibrating";
    this.standingHipY = null;
    this.baselineCount = 0;
    this.reps = 0;
    this.bottomHoldMs = 0;
    this.cooldownRemainingMs = 0;
  }

  update(sample: BodyMetricsSample, _pose: RuntimePose | null, deltaMs: number): void {
    this.framing = framingHint(sample);
    this.confidence = meanConfidence(sample, ["left_hip", "right_hip", "left_knee", "right_knee"]);
    if (this.isComplete()) return;

    const hipY = sample.hipY;
    const kneeAngle = minKneeAngle(sample);
    this.visible = hipY !== null && sample.bodyScale > 0;
    if (!this.visible || hipY === null) return;

    if (this.cooldownRemainingMs > 0) {
      this.cooldownRemainingMs = Math.max(0, this.cooldownRemainingMs - deltaMs);
      this.trackBaseline(hipY, kneeAngle);
      if (this.cooldownRemainingMs === 0) this.state = "up";
      return;
    }

    if (this.state === "calibrating") {
      this.trackBaseline(hipY, kneeAngle);
      if (this.baselineCount >= BASELINE_SAMPLES) this.state = "up";
      return;
    }

    const standing = this.standingHipY;
    if (standing === null) return;
    const requiredDrop = this.config.depthRatio * sample.bodyScale;
    const drop = hipY - standing;
    this.depthNow = requiredDrop <= 0 ? 0 : Math.min(1, Math.max(0, drop / requiredDrop));

    if (this.state === "up") {
      // Freeze the baseline once the descent starts; otherwise it chases the
      // hips down and the measured drop can never reach the threshold.
      if (drop <= requiredDrop * 0.15) this.trackBaseline(hipY, kneeAngle);
      const kneeBent = kneeAngle === null || kneeAngle <= this.config.kneeAngleMaxDeg;
      if (drop >= requiredDrop && kneeBent) {
        this.state = "down";
        this.bottomHoldMs = 0;
      }
      return;
    }

    // state === "down": hold at the bottom, then rise past the hysteresis band.
    if (drop >= requiredDrop * RISE_HYSTERESIS) {
      this.bottomHoldMs += deltaMs;
      return;
    }
    if (this.bottomHoldMs >= this.holdGoalMs) {
      this.reps += 1;
      this.ctx.emit({
        type: "unit-complete",
        unit: this.reps,
        total: this.config.repetitions,
        label: "squat",
      });
      this.cooldownRemainingMs = this.config.cooldownMs;
      this.state = "cooldown";
    } else {
      this.state = "up";
    }
    this.bottomHoldMs = 0;
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
      ...baseGuide("squat"),
      phase: done
        ? "done"
        : !this.visible || this.state === "calibrating"
          ? "idle"
          : this.state === "cooldown"
            ? "cooldown"
            : this.state === "down"
              ? "holding"
              : "active",
      progress: done ? 1 : (this.reps + Math.min(1, this.depthNow)) / this.config.repetitions,
      completedUnits: this.reps,
      totalUnits: this.config.repetitions,
      holdProgress: this.state === "down" && this.holdGoalMs > 0
        ? Math.min(1, this.bottomHoldMs / this.holdGoalMs)
        : this.depthNow,
      confidence: this.confidence,
      repetitionCount: this.reps,
      arrow: this.state === "up" ? "down" : this.state === "down" ? "up" : null,
      framing: this.framing,
    };
  }

  private trackBaseline(hipY: number, kneeAngle: number | null): void {
    // Standing means knees near straight; a paused half-squat never becomes the baseline.
    if (kneeAngle !== null && kneeAngle < 150) return;
    this.standingHipY = this.standingHipY === null ? hipY : this.standingHipY + (hipY - this.standingHipY) * 0.2;
    this.baselineCount += 1;
  }
}

function minKneeAngle(sample: BodyMetricsSample): number | null {
  const left = sample.angles.get("left_knee");
  const right = sample.angles.get("right_knee");
  if (left === undefined && right === undefined) return null;
  return Math.min(left ?? Number.POSITIVE_INFINITY, right ?? Number.POSITIVE_INFINITY);
}
