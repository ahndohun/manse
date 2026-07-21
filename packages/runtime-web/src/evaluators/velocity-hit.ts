import type { SequenceStep } from "@manse/schema";

import type { BodyMetricsSample } from "../body-metrics.js";
import { TIER_PROFILES } from "../config.js";
import type { ChallengeGuide, RuntimePose, RuntimeTarget } from "../types.js";
import {
  baseGuide,
  createGridTargets,
  distanceSquared,
  framingHint,
  meanConfidence,
  toRuntimeTarget,
  type ChallengeEvaluator,
  type EvaluatorContext,
  type MutableTarget,
} from "./evaluator.js";

type VelocityHitConfig = Extract<SequenceStep, { type: "velocity_hit" }>;

const LIMB_JOINTS: Record<VelocityHitConfig["limb"], readonly string[]> = {
  hands: ["left_wrist", "right_wrist"],
  feet: ["left_ankle", "right_ankle"],
  any: ["left_wrist", "right_wrist", "left_ankle", "right_ankle"],
};

/**
 * Strike targets: contact only counts when the limb arrives at or above the
 * pack's on-screen speed, optionally from a required direction. Copy shown to
 * players must call this screen speed — the engine cannot measure real-world
 * force and never claims to.
 */
export class VelocityHitEvaluator implements ChallengeEvaluator {
  private targetList: MutableTarget[] = [];
  private lastSpeed = 0;
  private framing: ChallengeGuide["framing"] = null;
  private confidence = 0;

  constructor(
    private readonly config: VelocityHitConfig,
    private readonly ctx: EvaluatorContext,
  ) {}

  enter(): void {
    this.targetList = createGridTargets(
      this.ctx.sceneId,
      this.config.count,
      this.config.zone,
      this.config.targetScale * TIER_PROFILES[this.ctx.tier].targetScale,
      this.ctx.reachBox,
      this.ctx.tuning.baseTargetRadius,
    );
  }

  update(sample: BodyMetricsSample, _pose: RuntimePose | null, _deltaMs: number): void {
    this.framing = framingHint(sample);
    this.confidence = meanConfidence(sample, LIMB_JOINTS[this.config.limb]);
    if (this.isComplete()) return;

    let bestSpeed = 0;
    const strikes: Array<{ x: number; y: number }> = [];
    for (const name of LIMB_JOINTS[this.config.limb]) {
      const motion = sample.limbSpeeds.get(name);
      if (motion === undefined) continue;
      bestSpeed = Math.max(bestSpeed, motion.speed);
      if (motion.speed < this.config.minSpeed) continue;
      if (!directionMatches(this.config.direction, motion.vx, motion.vy)) continue;
      strikes.push({ x: motion.x, y: motion.y });
    }
    this.lastSpeed = bestSpeed;

    for (const target of this.targetList) {
      if (target.hit) continue;
      const struck = strikes.some(
        (point) => distanceSquared(point.x, point.y, target.x, target.y) <= target.radius ** 2,
      );
      if (!struck) continue;
      target.hit = true;
      this.ctx.emit({
        type: "target-hit",
        targetId: target.id,
        feedbackLatencyMs: Math.max(0, this.ctx.now() - sample.timestampMs),
      });
      this.ctx.emit({
        type: "unit-complete",
        unit: this.completedCount(),
        total: this.targetList.length,
        label: "strike",
      });
      break; // One strike per pose sample keeps overlapping layouts deterministic.
    }
  }

  tick(): void {}

  isComplete(): boolean {
    return this.targetList.length > 0 && this.targetList.every((target) => target.hit);
  }

  targets(): readonly RuntimeTarget[] {
    return this.targetList.map((target) => toRuntimeTarget(target, 1, this.config.direction));
  }

  guide(): ChallengeGuide {
    const completed = this.completedCount();
    return {
      ...baseGuide("velocity_hit"),
      phase: this.isComplete() ? "done" : "active",
      progress: this.targetList.length === 0 ? 0 : completed / this.targetList.length,
      completedUnits: completed,
      totalUnits: this.targetList.length,
      holdProgress: Math.min(1, this.lastSpeed / this.config.minSpeed),
      confidence: this.confidence,
      arrow: this.config.direction === "any" ? null : this.config.direction,
      framing: this.framing,
    };
  }

  private completedCount(): number {
    return this.targetList.filter((target) => target.hit).length;
  }
}

function directionMatches(
  direction: VelocityHitConfig["direction"],
  vx: number,
  vy: number,
): boolean {
  switch (direction) {
    case "any": return true;
    case "up": return vy < 0 && Math.abs(vy) >= Math.abs(vx);
    case "down": return vy > 0 && Math.abs(vy) >= Math.abs(vx);
    case "left": return vx < 0 && Math.abs(vx) >= Math.abs(vy);
    case "right": return vx > 0 && Math.abs(vx) >= Math.abs(vy);
  }
}
