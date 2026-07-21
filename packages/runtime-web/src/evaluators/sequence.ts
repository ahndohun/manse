import type { SequenceChallenge, SequenceStep } from "@manse/schema";

import type { BodyMetricsSample } from "../body-metrics.js";
import type { ChallengeGuide, RuntimePose, RuntimeTarget } from "../types.js";
import {
  baseGuide,
  type ChallengeEvaluator,
  type EvaluatorContext,
} from "./evaluator.js";

export type StepEvaluatorFactory = (step: SequenceStep, ctx: EvaluatorContext) => ChallengeEvaluator;

/**
 * Ordered combo of inner motion steps. Each inner evaluator runs unmodified;
 * between steps an interStepGraceMs window ignores input so the player can
 * reset posture (landing a jump must not instantly break the next freeze).
 */
export class SequenceEvaluator implements ChallengeEvaluator {
  private cursor = 0;
  private current: ChallengeEvaluator | null = null;
  private graceRemainingMs = 0;
  private enteredAtMs = 0;

  constructor(
    private readonly challenge: SequenceChallenge,
    private readonly ctx: EvaluatorContext,
    private readonly createStep: StepEvaluatorFactory,
  ) {}

  enter(timestampMs: number): void {
    this.cursor = 0;
    this.graceRemainingMs = 0;
    this.enteredAtMs = timestampMs;
    this.current = this.buildCurrent();
    this.current?.enter(timestampMs);
  }

  update(sample: BodyMetricsSample, pose: RuntimePose | null, deltaMs: number): void {
    if (this.isComplete() || this.current === null) return;
    if (this.graceRemainingMs > 0) {
      this.graceRemainingMs = Math.max(0, this.graceRemainingMs - deltaMs);
      if (this.graceRemainingMs > 0) return;
      this.current.enter(sample.timestampMs);
    }
    this.current.update(sample, pose, deltaMs);
    if (this.current.isComplete()) {
      this.cursor += 1;
      this.ctx.emit({
        type: "unit-complete",
        unit: this.cursor,
        total: this.challenge.steps.length,
        label: this.challenge.steps[this.cursor - 1]?.type ?? "step",
      });
      if (!this.isComplete()) {
        this.current = this.buildCurrent();
        this.graceRemainingMs = this.challenge.interStepGraceMs;
        if (this.graceRemainingMs === 0) this.current?.enter(sample.timestampMs);
      } else {
        this.current = null;
      }
    }
  }

  tick(timestampMs: number): void {
    this.current?.tick(timestampMs);
  }

  isComplete(): boolean {
    return this.cursor >= this.challenge.steps.length;
  }

  targets(): readonly RuntimeTarget[] {
    return this.graceRemainingMs > 0 ? [] : this.current?.targets() ?? [];
  }

  guide(timestampMs: number): ChallengeGuide {
    const total = this.challenge.steps.length;
    if (this.isComplete()) {
      return {
        ...baseGuide("sequence"),
        phase: "done",
        progress: 1,
        completedUnits: total,
        totalUnits: total,
        holdProgress: 1,
        confidence: 1,
      };
    }
    const stepType = this.challenge.steps[this.cursor]?.type ?? "step";
    const inner = this.graceRemainingMs > 0 ? null : this.current?.guide(timestampMs) ?? null;
    return {
      ...baseGuide("sequence"),
      ...(inner === null ? {} : {
        zones: inner.zones,
        silhouette: inner.silhouette,
        jointFeedback: inner.jointFeedback,
        arrow: inner.arrow,
        holdProgress: inner.holdProgress,
        confidence: inner.confidence,
        repetitionCount: inner.repetitionCount,
        framing: inner.framing,
      }),
      kind: "sequence",
      phase: this.graceRemainingMs > 0 ? "cooldown" : inner?.phase ?? "active",
      progress: (this.cursor + (inner?.progress ?? 0)) / total,
      completedUnits: this.cursor,
      totalUnits: total,
      stepLabel: `${this.cursor + 1}/${total} ${stepType.replace("_", " ")}`,
    };
  }

  private buildCurrent(): ChallengeEvaluator | null {
    const step = this.challenge.steps[this.cursor];
    if (step === undefined) return null;
    return this.createStep(step, this.ctx);
  }
}
