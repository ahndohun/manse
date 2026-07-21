import type { BodyMetricsSample } from "../body-metrics.js";
import type { RuntimeTuning } from "../session.js";
import type {
  ChallengeGuide,
  DeviceTier,
  RuntimePose,
  RuntimeTarget,
} from "../types.js";

export interface NormBox {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}

export const DEFAULT_REACH_BOX: NormBox = { x0: 0.16, y0: 0.16, x1: 0.84, y1: 0.9 };

export type EvaluatorEvent =
  | { readonly type: "target-hit"; readonly targetId: string; readonly feedbackLatencyMs: number }
  | { readonly type: "unit-complete"; readonly unit: number; readonly total: number; readonly label: string };

export interface EvaluatorContext {
  readonly sceneId: string;
  readonly tier: DeviceTier;
  readonly tuning: RuntimeTuning;
  readonly reachBox: NormBox;
  readonly emit: (event: EvaluatorEvent) => void;
  /** Wall clock for feedback-latency measurement only; never for judging. */
  readonly now: () => number;
}

/**
 * One challenge primitive = one evaluator. The session owns scenes, timing,
 * transitions, and audio; the evaluator owns detection state and reports
 * progress through the shared ChallengeGuide contract.
 */
export interface ChallengeEvaluator {
  enter(timestampMs: number): void;
  /**
   * Feed one pose frame. `pose` is the raw best-scoring pose (for contact
   * checks needing original confidence semantics); `sample` is the gated,
   * body-relative measurement set. `deltaMs` is session-clamped frame delta.
   */
  update(sample: BodyMetricsSample, pose: RuntimePose | null, deltaMs: number): void;
  /** Render-clock tick for cooldowns and grace windows between pose frames. */
  tick(timestampMs: number): void;
  isComplete(): boolean;
  targets(): readonly RuntimeTarget[];
  guide(timestampMs: number): ChallengeGuide;
}

export const TARGET_PALETTE: readonly (readonly [number, number, number, number])[] = [
  [0.98, 0.35, 0.35, 1],
  [0.22, 0.72, 0.98, 1],
  [0.98, 0.76, 0.2, 1],
  [0.35, 0.86, 0.53, 1],
];

export interface MutableTarget {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly color: readonly [number, number, number, number];
  dwellMs: number;
  hit: boolean;
}

export function createGridTargets(
  sceneId: string,
  count: number,
  zone: "upper" | "lower" | "full" | "reachable",
  scale: number,
  reachBox: NormBox,
  baseRadius: number,
): MutableTarget[] {
  const bounds = zoneBounds(zone, reachBox);
  const columns = Math.min(3, Math.ceil(Math.sqrt(count)));
  const rows = Math.ceil(count / columns);
  const radius = Math.min(0.16, baseRadius * scale);
  return Array.from({ length: count }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const xRatio = columns === 1 ? 0.5 : (column + 0.5) / columns;
    const yRatio = rows === 1 ? 0.5 : (row + 0.5) / rows;
    const color = TARGET_PALETTE[index % TARGET_PALETTE.length] ?? TARGET_PALETTE[0] ?? [1, 1, 1, 1];
    return {
      id: `${sceneId}-target-${index + 1}`,
      x: mix(bounds.x0 + radius, bounds.x1 - radius, xRatio),
      y: mix(bounds.y0 + radius, bounds.y1 - radius, yRatio),
      radius,
      color,
      dwellMs: 0,
      hit: false,
    };
  });
}

export function zoneBounds(
  zone: "upper" | "lower" | "full" | "reachable",
  reachBox: NormBox,
): NormBox {
  switch (zone) {
    case "upper": return { x0: reachBox.x0, y0: reachBox.y0, x1: reachBox.x1, y1: mix(reachBox.y0, reachBox.y1, 0.52) };
    case "lower": return { x0: reachBox.x0, y0: mix(reachBox.y0, reachBox.y1, 0.48), x1: reachBox.x1, y1: reachBox.y1 };
    case "full": return DEFAULT_REACH_BOX;
    case "reachable": return reachBox;
  }
}

export function getLimbPoints(
  pose: RuntimePose | null,
  limb: "hands" | "feet" | "any",
  confidence: number,
): readonly { readonly x: number; readonly y: number; readonly name: string }[] {
  if (pose === null) return [];
  const names = limb === "hands"
    ? new Set(["left_wrist", "right_wrist"])
    : limb === "feet"
      ? new Set(["left_ankle", "right_ankle"])
      : new Set(["left_wrist", "right_wrist", "left_ankle", "right_ankle"]);
  return pose.landmarks.filter(
    (landmark) => names.has(landmark.name) && Math.min(landmark.visibility, landmark.presence) >= confidence,
  );
}

/** Guidance when the player's torso is unusably small or large on screen. */
export function framingHint(sample: BodyMetricsSample): "closer" | "farther" | null {
  if (sample.bodyScale === 0) return null;
  if (sample.bodyScale < 0.09) return "closer";
  if (sample.bodyScale > 0.5) return "farther";
  return null;
}

export function baseGuide(kind: ChallengeGuide["kind"]): ChallengeGuide {
  return {
    kind,
    phase: "idle",
    progress: 0,
    completedUnits: 0,
    totalUnits: 1,
    holdProgress: 0,
    confidence: 0,
    repetitionCount: null,
    zones: [],
    silhouette: [],
    jointFeedback: [],
    arrow: null,
    stepLabel: null,
    framing: null,
  };
}

export function toRuntimeTarget(
  target: MutableTarget,
  dwellGoal: number,
  requiredDirection: "any" | "up" | "down" | "left" | "right" | null = null,
): RuntimeTarget {
  return {
    id: target.id,
    x: target.x,
    y: target.y,
    radius: target.radius,
    dwellProgress: target.hit ? 1 : Math.min(1, target.dwellMs / Math.max(1, dwellGoal)),
    hit: target.hit,
    color: target.color,
    requiredDirection,
  };
}

export function distanceSquared(x0: number, y0: number, x1: number, y1: number): number {
  return (x0 - x1) ** 2 + (y0 - y1) ** 2;
}

export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function meanConfidence(sample: BodyMetricsSample, names: readonly string[]): number {
  let total = 0;
  let count = 0;
  for (const name of names) {
    const point = sample.joints.get(name);
    if (point === undefined) continue;
    total += point.confidence;
    count += 1;
  }
  return count === 0 ? 0 : total / count;
}
