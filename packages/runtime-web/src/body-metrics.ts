import type { RuntimeLandmark, RuntimePose } from "./types.js";

/**
 * Body-relative measurement layer shared by every challenge evaluator.
 *
 * Detectors never judge absolute pixels: thresholds are expressed as ratios of
 * the player's own torso length ("body units") and joint angles in degrees, so
 * a small child close to the camera and an adult far away meet the same
 * challenge. Landmarks below confidence are excluded, and briefly occluded
 * joints are held at their last confident position instead of failing the
 * player (hysteresis).
 */

export type JointAngleName =
  | "left_elbow" | "right_elbow"
  | "left_knee" | "right_knee"
  | "left_shoulder" | "right_shoulder"
  | "left_hip" | "right_hip";

export interface TrackedPoint {
  readonly x: number;
  readonly y: number;
  /** Confidence of the underlying landmark when last observed. */
  readonly confidence: number;
  /** True when the value is a held-over position during brief occlusion. */
  readonly held: boolean;
}

export interface LimbMotion {
  readonly x: number;
  readonly y: number;
  /** Screen-space speed in normalized units per second. */
  readonly speed: number;
  readonly vx: number;
  readonly vy: number;
}

export interface BodyMetricsSample {
  readonly timestampMs: number;
  /** Smoothed torso length in normalized units; 0 while the body is unseen. */
  readonly bodyScale: number;
  /** Shoulder/hip centroid. */
  readonly center: TrackedPoint | null;
  readonly headY: number | null;
  readonly hipY: number | null;
  /** Rolling estimate of the floor line from confident ankle positions. */
  readonly floorY: number | null;
  /** Mean confident-landmark motion in normalized units per second. */
  readonly motionPerSecond: number;
  readonly visibleJointCount: number;
  /** Confidence-gated joints, with brief occlusion held. */
  readonly joints: ReadonlyMap<string, TrackedPoint>;
  /** Joint angles in degrees (straight = 180). Missing when a vertex is unseen. */
  readonly angles: ReadonlyMap<JointAngleName, number>;
  readonly limbSpeeds: ReadonlyMap<string, LimbMotion>;
}

export interface BodyMetricsOptions {
  /** Landmark becomes visible at or above this confidence. */
  readonly enterConfidence?: number;
  /** Landmark stays visible until it falls below this confidence. */
  readonly exitConfidence?: number;
  /** How long an occluded joint keeps its last confident position. */
  readonly occlusionHoldMs?: number;
  /** EMA factor for body scale smoothing (higher = snappier). */
  readonly scaleSmoothing?: number;
}

const ANGLE_VERTICES: Readonly<Record<JointAngleName, readonly [string, string, string]>> = {
  left_elbow: ["left_shoulder", "left_elbow", "left_wrist"],
  right_elbow: ["right_shoulder", "right_elbow", "right_wrist"],
  left_knee: ["left_hip", "left_knee", "left_ankle"],
  right_knee: ["right_hip", "right_knee", "right_ankle"],
  left_shoulder: ["left_elbow", "left_shoulder", "left_hip"],
  right_shoulder: ["right_elbow", "right_shoulder", "right_hip"],
  left_hip: ["left_shoulder", "left_hip", "left_knee"],
  right_hip: ["right_shoulder", "right_hip", "right_knee"],
};

export const SPEED_TRACKED_LANDMARKS = ["left_wrist", "right_wrist", "left_ankle", "right_ankle"] as const;

interface GateState {
  visible: boolean;
  x: number;
  y: number;
  confidence: number;
  lastConfidentMs: number;
}

export class BodyMetricsTracker {
  private readonly enterConfidence: number;
  private readonly exitConfidence: number;
  private readonly occlusionHoldMs: number;
  private readonly scaleSmoothing: number;
  private readonly gates = new Map<string, GateState>();
  private readonly previousJoints = new Map<string, TrackedPoint>();
  private readonly limbHistory = new Map<string, { x: number; y: number; timestampMs: number }>();
  private previousTimestampMs: number | null = null;
  private smoothedScale = 0;
  private floorEstimate: number | null = null;

  constructor(options: BodyMetricsOptions = {}) {
    this.enterConfidence = options.enterConfidence ?? 0.5;
    this.exitConfidence = options.exitConfidence ?? 0.35;
    this.occlusionHoldMs = options.occlusionHoldMs ?? 300;
    this.scaleSmoothing = options.scaleSmoothing ?? 0.25;
  }

  reset(): void {
    this.gates.clear();
    this.previousJoints.clear();
    this.limbHistory.clear();
    this.previousTimestampMs = null;
    this.smoothedScale = 0;
    this.floorEstimate = null;
  }

  update(pose: RuntimePose | null, timestampMs: number): BodyMetricsSample {
    const joints = this.gateLandmarks(pose?.landmarks ?? [], timestampMs);
    const deltaMs = this.previousTimestampMs === null ? 0 : Math.max(0, timestampMs - this.previousTimestampMs);

    const motionPerSecond = this.computeMotion(joints, deltaMs);
    const limbSpeeds = this.computeLimbSpeeds(joints, timestampMs);
    const scale = this.updateScale(joints);
    const floorY = this.updateFloor(joints);

    this.previousJoints.clear();
    for (const [name, point] of joints) this.previousJoints.set(name, point);
    this.previousTimestampMs = timestampMs;

    return {
      timestampMs,
      bodyScale: scale,
      center: centroid(joints, ["left_shoulder", "right_shoulder", "left_hip", "right_hip"]),
      headY: joints.get("nose")?.y ?? null,
      hipY: averageY(joints, ["left_hip", "right_hip"]),
      floorY,
      motionPerSecond,
      visibleJointCount: joints.size,
      joints,
      angles: this.computeAngles(joints),
      limbSpeeds,
    };
  }

  private gateLandmarks(
    landmarks: readonly RuntimeLandmark[],
    timestampMs: number,
  ): Map<string, TrackedPoint> {
    const seen = new Set<string>();
    for (const landmark of landmarks) {
      seen.add(landmark.name);
      const confidence = Math.min(landmark.visibility, landmark.presence);
      const gate = this.gates.get(landmark.name);
      if (gate === undefined) {
        if (confidence >= this.enterConfidence) {
          this.gates.set(landmark.name, {
            visible: true,
            x: landmark.x,
            y: landmark.y,
            confidence,
            lastConfidentMs: timestampMs,
          });
        }
        continue;
      }
      const threshold = gate.visible ? this.exitConfidence : this.enterConfidence;
      if (confidence >= threshold) {
        gate.visible = true;
        gate.x = landmark.x;
        gate.y = landmark.y;
        gate.confidence = confidence;
        gate.lastConfidentMs = timestampMs;
      } else if (gate.visible && timestampMs - gate.lastConfidentMs > this.occlusionHoldMs) {
        gate.visible = false;
      }
    }
    for (const [name, gate] of this.gates) {
      if (!seen.has(name) && gate.visible && timestampMs - gate.lastConfidentMs > this.occlusionHoldMs) {
        gate.visible = false;
      }
    }

    const result = new Map<string, TrackedPoint>();
    for (const [name, gate] of this.gates) {
      if (!gate.visible) continue;
      result.set(name, {
        x: gate.x,
        y: gate.y,
        confidence: gate.confidence,
        held: timestampMs - gate.lastConfidentMs > 0,
      });
    }
    return result;
  }

  private computeMotion(joints: ReadonlyMap<string, TrackedPoint>, deltaMs: number): number {
    if (deltaMs <= 0 || this.previousJoints.size === 0) return 0;
    let total = 0;
    let counted = 0;
    for (const [name, point] of joints) {
      const previous = this.previousJoints.get(name);
      if (previous === undefined || point.held) continue;
      total += Math.hypot(point.x - previous.x, point.y - previous.y);
      counted += 1;
    }
    if (counted === 0) return 0;
    return (total / counted) * (1000 / deltaMs);
  }

  private computeLimbSpeeds(
    joints: ReadonlyMap<string, TrackedPoint>,
    timestampMs: number,
  ): Map<string, LimbMotion> {
    const speeds = new Map<string, LimbMotion>();
    for (const name of SPEED_TRACKED_LANDMARKS) {
      const point = joints.get(name);
      if (point === undefined) {
        // Tracking loss must not preserve stale velocity: a re-appearing limb
        // starts from rest instead of registering a phantom strike.
        this.limbHistory.delete(name);
        continue;
      }
      const history = this.limbHistory.get(name);
      if (history !== undefined && timestampMs > history.timestampMs) {
        const deltaSeconds = (timestampMs - history.timestampMs) / 1000;
        const vx = (point.x - history.x) / deltaSeconds;
        const vy = (point.y - history.y) / deltaSeconds;
        speeds.set(name, { x: point.x, y: point.y, speed: Math.hypot(vx, vy), vx, vy });
      } else {
        speeds.set(name, { x: point.x, y: point.y, speed: 0, vx: 0, vy: 0 });
      }
      if (!point.held) this.limbHistory.set(name, { x: point.x, y: point.y, timestampMs });
    }
    return speeds;
  }

  private updateScale(joints: ReadonlyMap<string, TrackedPoint>): number {
    const shoulders = centroid(joints, ["left_shoulder", "right_shoulder"]);
    const hips = centroid(joints, ["left_hip", "right_hip"]);
    if (shoulders !== null && hips !== null) {
      const torso = Math.hypot(shoulders.x - hips.x, shoulders.y - hips.y);
      if (torso > 0.01) {
        this.smoothedScale = this.smoothedScale === 0
          ? torso
          : this.smoothedScale + (torso - this.smoothedScale) * this.scaleSmoothing;
      }
    }
    return this.smoothedScale;
  }

  private updateFloor(joints: ReadonlyMap<string, TrackedPoint>): number | null {
    const ankleY = averageY(joints, ["left_ankle", "right_ankle"]);
    if (ankleY !== null) {
      // The floor line only creeps upward slowly but adopts lower (larger y)
      // evidence quickly, so stepping closer to the camera re-calibrates fast.
      this.floorEstimate = this.floorEstimate === null
        ? ankleY
        : ankleY > this.floorEstimate
          ? this.floorEstimate + (ankleY - this.floorEstimate) * 0.5
          : this.floorEstimate + (ankleY - this.floorEstimate) * 0.02;
    }
    return this.floorEstimate;
  }

  private computeAngles(joints: ReadonlyMap<string, TrackedPoint>): Map<JointAngleName, number> {
    const angles = new Map<JointAngleName, number>();
    for (const [name, [a, b, c]] of Object.entries(ANGLE_VERTICES) as Array<[JointAngleName, readonly [string, string, string]]>) {
      const pa = joints.get(a);
      const pb = joints.get(b);
      const pc = joints.get(c);
      if (pa === undefined || pb === undefined || pc === undefined) continue;
      angles.set(name, angleDegrees(pa, pb, pc));
    }
    return angles;
  }
}

/** Interior angle at vertex b, in degrees. Straight limb = 180. */
export function angleDegrees(
  a: { readonly x: number; readonly y: number },
  b: { readonly x: number; readonly y: number },
  c: { readonly x: number; readonly y: number },
): number {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const magnitude = Math.hypot(abx, aby) * Math.hypot(cbx, cby);
  if (magnitude === 0) return 180;
  const cosine = Math.min(1, Math.max(-1, dot / magnitude));
  return (Math.acos(cosine) * 180) / Math.PI;
}

export function mirrorJointName(name: JointAngleName): JointAngleName {
  return (name.startsWith("left_")
    ? name.replace("left_", "right_")
    : name.replace("right_", "left_")) as JointAngleName;
}

function centroid(
  joints: ReadonlyMap<string, TrackedPoint>,
  names: readonly string[],
): TrackedPoint | null {
  let x = 0;
  let y = 0;
  let confidence = 0;
  let count = 0;
  let held = false;
  for (const name of names) {
    const point = joints.get(name);
    if (point === undefined) continue;
    x += point.x;
    y += point.y;
    confidence += point.confidence;
    held = held || point.held;
    count += 1;
  }
  if (count === 0) return null;
  return { x: x / count, y: y / count, confidence: confidence / count, held };
}

function averageY(joints: ReadonlyMap<string, TrackedPoint>, names: readonly string[]): number | null {
  let total = 0;
  let count = 0;
  for (const name of names) {
    const point = joints.get(name);
    if (point === undefined) continue;
    total += point.y;
    count += 1;
  }
  return count === 0 ? null : total / count;
}
