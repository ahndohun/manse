import type { BodyFrame, BodyJoint, BodyLandmark, Point2 } from "../types.js";

export function visibleLandmark(
  frame: BodyFrame,
  joint: BodyJoint,
  minimumConfidence: number,
): BodyLandmark | undefined {
  const value = frame.landmarks[joint];
  if (value === undefined) return undefined;
  return value.visibility >= minimumConfidence && value.presence >= minimumConfidence ? value : undefined;
}

export function midpoint(a: Point2, b: Point2): Point2 {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function distance(a: Point2, b: Point2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function bodyScale(frame: BodyFrame, minimumConfidence: number, minimum: number): number {
  const leftShoulder = visibleLandmark(frame, "left_shoulder", minimumConfidence);
  const rightShoulder = visibleLandmark(frame, "right_shoulder", minimumConfidence);
  const leftAnkle = visibleLandmark(frame, "left_ankle", minimumConfidence);
  const rightAnkle = visibleLandmark(frame, "right_ankle", minimumConfidence);
  if (leftShoulder === undefined || rightShoulder === undefined || leftAnkle === undefined || rightAnkle === undefined) {
    return minimum;
  }
  return Math.max(minimum, distance(midpoint(leftShoulder, rightShoulder), midpoint(leftAnkle, rightAnkle)));
}

export function averageJointSpeed(
  current: BodyFrame,
  previous: BodyFrame | undefined,
  joints: readonly BodyJoint[],
  minimumConfidence: number,
): number | undefined {
  if (previous === undefined) return 0;
  const elapsedSeconds = (current.timestampMs - previous.timestampMs) / 1000;
  if (elapsedSeconds <= 0 || !Number.isFinite(elapsedSeconds)) return undefined;
  let total = 0;
  let count = 0;
  for (const joint of joints) {
    const next = visibleLandmark(current, joint, minimumConfidence);
    const prior = visibleLandmark(previous, joint, minimumConfidence);
    if (next === undefined || prior === undefined) continue;
    total += distance(next, prior) / elapsedSeconds;
    count += 1;
  }
  return count === 0 ? undefined : total / count;
}

export function hipCenter(frame: BodyFrame, minimumConfidence: number): Point2 | undefined {
  const left = visibleLandmark(frame, "left_hip", minimumConfidence);
  const right = visibleLandmark(frame, "right_hip", minimumConfidence);
  return left !== undefined && right !== undefined ? midpoint(left, right) : undefined;
}

export function shoulderCenter(frame: BodyFrame, minimumConfidence: number): Point2 | undefined {
  const left = visibleLandmark(frame, "left_shoulder", minimumConfidence);
  const right = visibleLandmark(frame, "right_shoulder", minimumConfidence);
  return left !== undefined && right !== undefined ? midpoint(left, right) : undefined;
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
