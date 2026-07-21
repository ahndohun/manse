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

type StepConfig = Extract<SequenceStep, { type: "step" }>;

const BASELINE_SAMPLES = 3;

/**
 * Dance-step pattern: each entry names the foot that must travel sideways by
 * stepRatio of the player's torso length, in that foot's own direction, and
 * settle for holdMs. Pose frames arrive mirrored into screen space, so the
 * player's left foot moving to their left is a decrease in x.
 */
export class StepEvaluator implements ChallengeEvaluator {
  private readonly holdGoalMs: number;
  private cursor = 0;
  private baseline: { left: number; right: number } | null = null;
  private baselineCount = 0;
  private settleMs = 0;
  private travelNow = 0;
  private visible = false;
  private framing: ChallengeGuide["framing"] = null;
  private confidence = 0;

  constructor(
    private readonly config: StepConfig,
    private readonly ctx: EvaluatorContext,
  ) {
    this.holdGoalMs = Math.max(0, config.holdMs * TIER_PROFILES[ctx.tier].dwellScale);
  }

  enter(): void {
    this.cursor = 0;
    this.baseline = null;
    this.baselineCount = 0;
    this.settleMs = 0;
  }

  update(sample: BodyMetricsSample, _pose: RuntimePose | null, deltaMs: number): void {
    this.framing = framingHint(sample);
    this.confidence = meanConfidence(sample, ["left_ankle", "right_ankle"]);
    if (this.isComplete()) return;

    const left = sample.joints.get("left_ankle");
    const right = sample.joints.get("right_ankle");
    this.visible = left !== undefined && right !== undefined && sample.bodyScale > 0;
    if (!this.visible || left === undefined || right === undefined) return;

    if (this.baseline === null || this.baselineCount < BASELINE_SAMPLES) {
      this.baseline = this.baseline === null
        ? { left: left.x, right: right.x }
        : {
            left: this.baseline.left + (left.x - this.baseline.left) * 0.3,
            right: this.baseline.right + (right.x - this.baseline.right) * 0.3,
          };
      this.baselineCount += 1;
      return;
    }

    const direction = this.config.pattern[this.cursor];
    if (direction === undefined) return;
    const foot = direction === "left" ? left : right;
    const start = direction === "left" ? this.baseline.left : this.baseline.right;
    // Mirrored screen space: the player's left is smaller x.
    const travel = direction === "left" ? start - foot.x : foot.x - start;
    const required = this.config.stepRatio * sample.bodyScale;
    this.travelNow = required <= 0 ? 0 : Math.min(1, Math.max(0, travel / required));

    if (travel >= required) {
      this.settleMs += deltaMs;
      if (this.settleMs >= this.holdGoalMs) {
        this.cursor += 1;
        this.settleMs = 0;
        // The new stance becomes the reference for the next pattern entry.
        this.baseline = { left: left.x, right: right.x };
        this.ctx.emit({
          type: "unit-complete",
          unit: this.cursor,
          total: this.config.pattern.length,
          label: "step",
        });
      }
    } else {
      this.settleMs = 0;
    }
  }

  tick(): void {}

  isComplete(): boolean {
    return this.cursor >= this.config.pattern.length;
  }

  targets(): readonly RuntimeTarget[] {
    return [];
  }

  guide(): ChallengeGuide {
    const done = this.isComplete();
    const direction = this.config.pattern[Math.min(this.cursor, this.config.pattern.length - 1)] ?? null;
    return {
      ...baseGuide("step"),
      phase: done ? "done" : !this.visible ? "idle" : this.settleMs > 0 ? "holding" : "active",
      progress: done ? 1 : (this.cursor + Math.min(1, this.travelNow)) / this.config.pattern.length,
      completedUnits: this.cursor,
      totalUnits: this.config.pattern.length,
      holdProgress: this.holdGoalMs === 0
        ? Math.min(1, this.travelNow)
        : Math.min(1, this.settleMs / this.holdGoalMs),
      confidence: this.confidence,
      arrow: done ? null : direction,
      stepLabel: done ? null : `${this.cursor + 1}/${this.config.pattern.length}`,
      framing: this.framing,
    };
  }
}
