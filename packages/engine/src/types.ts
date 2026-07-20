import type { PoseFrame } from "@manse/pose";

export type DeviceTier = "S" | "A" | "B" | "C";

export type BodyJoint =
  | "nose"
  | "left_eye_inner"
  | "left_eye"
  | "left_eye_outer"
  | "right_eye_inner"
  | "right_eye"
  | "right_eye_outer"
  | "left_ear"
  | "right_ear"
  | "mouth_left"
  | "mouth_right"
  | "left_shoulder"
  | "right_shoulder"
  | "left_elbow"
  | "right_elbow"
  | "left_wrist"
  | "right_wrist"
  | "left_pinky"
  | "right_pinky"
  | "left_index"
  | "right_index"
  | "left_thumb"
  | "right_thumb"
  | "left_hip"
  | "right_hip"
  | "left_knee"
  | "right_knee"
  | "left_ankle"
  | "right_ankle"
  | "left_heel"
  | "right_heel"
  | "left_foot_index"
  | "right_foot_index";

export const BODY_JOINTS: readonly BodyJoint[] = [
  "nose",
  "left_eye_inner",
  "left_eye",
  "left_eye_outer",
  "right_eye_inner",
  "right_eye",
  "right_eye_outer",
  "left_ear",
  "right_ear",
  "mouth_left",
  "mouth_right",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_pinky",
  "right_pinky",
  "left_index",
  "right_index",
  "left_thumb",
  "right_thumb",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle",
  "left_heel",
  "right_heel",
  "left_foot_index",
  "right_foot_index",
] as const;

export interface Point2 {
  readonly x: number;
  readonly y: number;
}

export interface BodyLandmark extends Point2 {
  readonly z: number;
  readonly visibility: number;
  readonly presence: number;
}

export interface BodyFrame {
  readonly timestampMs: number;
  readonly sequence: number;
  readonly confidence: number;
  readonly mirrored: boolean;
  readonly synthetic: boolean;
  readonly landmarks: Readonly<Partial<Record<BodyJoint, BodyLandmark>>>;
}

export type EngineEventType =
  | "target-entered"
  | "target-left"
  | "target-hit"
  | "rep"
  | "step"
  | "hold-started"
  | "hold-lost"
  | "challenge-completed"
  | "manse-pose-completed";

export interface EngineEvent {
  readonly type: EngineEventType;
  readonly timestampMs: number;
  readonly challengeType?: string;
  readonly targetId?: string;
  readonly side?: "left" | "right";
  readonly value?: number;
}

export interface DetectorSnapshot {
  readonly challengeType: string;
  readonly elapsedMs: number;
  readonly progress: number;
  readonly count: number;
  readonly targetCount: number;
  readonly active: boolean;
  readonly completed: boolean;
  readonly confidence: number;
  readonly events: readonly EngineEvent[];
}

/** Convert the highest-scoring `@manse/pose` pose into named engine landmarks. */
export function bodyFrameFromPoseFrame(frame: PoseFrame): BodyFrame {
  const pose = frame.poses.reduce<(typeof frame.poses)[number] | undefined>(
    (best, candidate) => (best === undefined || candidate.score > best.score ? candidate : best),
    undefined,
  );
  const landmarks: Partial<Record<BodyJoint, BodyLandmark>> = {};

  if (pose !== undefined) {
    for (const item of pose.landmarks) {
      if (!BODY_JOINTS.includes(item.name as BodyJoint)) continue;
      if (![item.x, item.y, item.z, item.visibility, item.presence].every(Number.isFinite)) continue;
      landmarks[item.name as BodyJoint] = {
        x: item.x,
        y: item.y,
        z: item.z,
        visibility: item.visibility,
        presence: item.presence,
      };
    }
  }

  return {
    timestampMs: frame.timestampMs,
    sequence: frame.sequence,
    confidence: pose?.score ?? 0,
    mirrored: frame.mirrored,
    synthetic: frame.synthetic,
    landmarks,
  };
}
