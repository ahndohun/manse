import type { BodyZoneChallenge } from "@manse/schema";

import type { BodyMetricsSample, TrackedPoint } from "../body-metrics.js";
import { TIER_PROFILES } from "../config.js";
import type { ChallengeGuide, ChallengeZoneOverlay, RuntimePose, RuntimeTarget } from "../types.js";
import {
  baseGuide,
  framingHint,
  meanConfidence,
  type ChallengeEvaluator,
  type EvaluatorContext,
} from "./evaluator.js";

const PART_JOINTS: Record<BodyZoneChallenge["part"], readonly string[]> = {
  head: ["nose"],
  torso: ["left_shoulder", "right_shoulder", "left_hip", "right_hip"],
  hands: ["left_wrist", "right_wrist"],
  feet: ["left_ankle", "right_ankle"],
  any: ["nose", "left_wrist", "right_wrist", "left_ankle", "right_ankle"],
};

/**
 * Enter/avoid regions with the named body part. Zones arm one at a time in
 * pack order; `enter` demands staying inside the active zone for the hold,
 * `avoid` demands staying out of it.
 */
export class BodyZoneEvaluator implements ChallengeEvaluator {
  private readonly holdGoalMs: number;
  private cursor = 0;
  private heldMs = 0;
  private inside = false;
  private partSeen = false;
  private framing: ChallengeGuide["framing"] = null;
  private confidence = 0;

  constructor(
    private readonly challenge: BodyZoneChallenge,
    private readonly ctx: EvaluatorContext,
  ) {
    this.holdGoalMs = Math.max(1, challenge.holdMs * TIER_PROFILES[ctx.tier].dwellScale);
  }

  enter(): void {
    this.cursor = 0;
    this.heldMs = 0;
  }

  update(sample: BodyMetricsSample, _pose: RuntimePose | null, deltaMs: number): void {
    this.framing = framingHint(sample);
    this.confidence = meanConfidence(sample, PART_JOINTS[this.challenge.part]);
    if (this.isComplete()) return;

    const zone = this.challenge.zones[this.cursor];
    if (zone === undefined) return;
    const points = this.partPoints(sample);
    this.partSeen = points.length > 0;
    if (!this.partSeen) return; // Occlusion pauses judging; it never fails or rewards.

    this.inside = this.challenge.part === "torso"
      ? points.every((point) => insideBox(point, zone.box))
      : points.some((point) => insideBox(point, zone.box));

    const satisfying = this.challenge.mode === "enter" ? this.inside : !this.inside;
    this.heldMs = satisfying ? this.heldMs + deltaMs : 0;

    if (this.heldMs >= this.holdGoalMs) {
      this.cursor += 1;
      this.heldMs = 0;
      this.ctx.emit({
        type: "unit-complete",
        unit: this.cursor,
        total: this.challenge.zones.length,
        label: this.challenge.mode === "enter" ? "zone" : "dodge",
      });
    }
  }

  tick(): void {}

  isComplete(): boolean {
    return this.cursor >= this.challenge.zones.length;
  }

  targets(): readonly RuntimeTarget[] {
    return [];
  }

  guide(): ChallengeGuide {
    const zones: ChallengeZoneOverlay[] = this.challenge.zones.map((zone, index) => ({
      id: zone.id,
      box: zone.box,
      mode: this.challenge.mode,
      state: index < this.cursor
        ? "done"
        : index > this.cursor
          ? "pending"
          : this.challenge.mode === "avoid" && this.inside
            ? "danger"
            : "active",
    }));
    const done = this.isComplete();
    return {
      ...baseGuide("body_zone"),
      phase: done ? "done" : !this.partSeen ? "idle" : this.heldMs > 0 ? "holding" : "active",
      progress: done
        ? 1
        : (this.cursor + Math.min(1, this.heldMs / this.holdGoalMs)) / this.challenge.zones.length,
      completedUnits: this.cursor,
      totalUnits: this.challenge.zones.length,
      holdProgress: done ? 1 : Math.min(1, this.heldMs / this.holdGoalMs),
      confidence: this.confidence,
      zones,
      framing: this.framing,
    };
  }

  private partPoints(sample: BodyMetricsSample): readonly TrackedPoint[] {
    if (this.challenge.part === "torso") {
      return sample.center === null ? [] : [sample.center];
    }
    const points: TrackedPoint[] = [];
    for (const name of PART_JOINTS[this.challenge.part]) {
      const point = sample.joints.get(name);
      if (point !== undefined) points.push(point);
    }
    return points;
  }
}

function insideBox(
  point: { readonly x: number; readonly y: number },
  box: BodyZoneChallenge["zones"][number]["box"],
): boolean {
  return point.x >= box.x0 && point.x <= box.x1 && point.y >= box.y0 && point.y <= box.y1;
}
