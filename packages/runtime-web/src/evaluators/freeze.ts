import type { FreezeChallenge } from "@manse/schema";

import type { BodyMetricsSample } from "../body-metrics.js";
import { TIER_PROFILES } from "../config.js";
import type { ChallengeGuide, RuntimePose, RuntimeTarget } from "../types.js";
import {
  baseGuide,
  framingHint,
  type ChallengeEvaluator,
  type EvaluatorContext,
} from "./evaluator.js";

const REARM_MS = 1_000;

/**
 * Statue mechanic: whole-body motion must stay under the pack's threshold for
 * the hold window. Short spikes inside graceMs pause the hold instead of
 * resetting it, and losing joints below minVisibleJoints pauses judging
 * entirely — occlusion never fails the player.
 */
export class FreezeEvaluator implements ChallengeEvaluator {
  private readonly holdGoalMs: number;
  private readonly noiseScaledThreshold: number;
  private heldMs = 0;
  private spikeMs = 0;
  private roundsDone = 0;
  private paused = false;
  private armed = true;
  private rearmMs = 0;
  private framing: ChallengeGuide["framing"] = null;
  private confidence = 0;

  constructor(
    private readonly challenge: FreezeChallenge,
    private readonly ctx: EvaluatorContext,
  ) {
    const profile = TIER_PROFILES[ctx.tier];
    this.holdGoalMs = Math.max(1, challenge.holdMs * profile.dwellScale);
    this.noiseScaledThreshold = challenge.motionThreshold * profile.noiseScale;
  }

  enter(): void {
    this.heldMs = 0;
    this.spikeMs = 0;
    this.roundsDone = 0;
    this.armed = true;
    this.rearmMs = 0;
  }

  update(sample: BodyMetricsSample, _pose: RuntimePose | null, deltaMs: number): void {
    this.framing = framingHint(sample);
    this.confidence = Math.min(1, sample.visibleJointCount / Math.max(1, this.challenge.minVisibleJoints));
    if (this.isComplete()) return;

    this.paused = sample.visibleJointCount < this.challenge.minVisibleJoints;
    if (this.paused) return;

    const still = sample.motionPerSecond < this.noiseScaledThreshold;

    if (!this.armed) {
      // Between rounds the player must move once (or wait) so continued
      // stillness cannot double-count a single freeze.
      this.rearmMs += deltaMs;
      if (!still || this.rearmMs >= REARM_MS) {
        this.armed = true;
        this.heldMs = 0;
        this.spikeMs = 0;
      }
      return;
    }

    if (still) {
      this.heldMs += deltaMs;
      this.spikeMs = 0;
    } else {
      this.spikeMs += deltaMs;
      if (this.spikeMs > this.challenge.graceMs) {
        this.heldMs = 0;
        this.spikeMs = 0;
      }
    }

    if (this.heldMs >= this.holdGoalMs) {
      this.roundsDone += 1;
      this.ctx.emit({
        type: "unit-complete",
        unit: this.roundsDone,
        total: this.challenge.rounds,
        label: "freeze",
      });
      this.armed = false;
      this.rearmMs = 0;
      this.heldMs = 0;
      this.spikeMs = 0;
    }
  }

  tick(): void {}

  isComplete(): boolean {
    return this.roundsDone >= this.challenge.rounds;
  }

  targets(): readonly RuntimeTarget[] {
    return [];
  }

  guide(): ChallengeGuide {
    const done = this.isComplete();
    return {
      ...baseGuide("freeze"),
      phase: done ? "done" : this.paused ? "idle" : !this.armed ? "cooldown" : this.heldMs > 0 ? "holding" : "active",
      progress: done ? 1 : (this.roundsDone + Math.min(1, this.heldMs / this.holdGoalMs)) / this.challenge.rounds,
      completedUnits: this.roundsDone,
      totalUnits: this.challenge.rounds,
      holdProgress: done ? 1 : Math.min(1, this.heldMs / this.holdGoalMs),
      confidence: this.confidence,
      repetitionCount: this.challenge.rounds > 1 ? this.roundsDone : null,
      framing: this.framing,
    };
  }
}
