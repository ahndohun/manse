export const POSE_LANDMARK_NAMES = [
  "nose", "left_eye_inner", "left_eye", "left_eye_outer", "right_eye_inner",
  "right_eye", "right_eye_outer", "left_ear", "right_ear", "mouth_left",
  "mouth_right", "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
  "left_wrist", "right_wrist", "left_pinky", "right_pinky", "left_index",
  "right_index", "left_thumb", "right_thumb", "left_hip", "right_hip",
  "left_knee", "right_knee", "left_ankle", "right_ankle", "left_heel",
  "right_heel", "left_foot_index", "right_foot_index",
] as const;

export type PoseLandmarkName = (typeof POSE_LANDMARK_NAMES)[number];

export interface PoseLandmark {
  readonly index: number;
  readonly name: PoseLandmarkName;
  /** Mirrored normalized horizontal coordinate for screen-space landmarks. */
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly visibility: number;
  readonly presence: number;
}

export interface Pose {
  /** MediaPipe landmark order. */
  readonly landmarks: readonly PoseLandmark[];
  readonly worldLandmarks?: readonly PoseLandmark[];
  /** Conservative aggregate confidence in [0, 1]. */
  readonly score: number;
}

export interface PoseFrame {
  /** Monotonic source timestamp in milliseconds. */
  readonly timestampMs: number;
  readonly sequence: number;
  readonly poses: readonly Pose[];
  readonly source: "mediapipe" | "simulated";
  readonly mirrored: boolean;
  readonly synthetic: boolean;
  readonly inferenceTimeMs: number;
  readonly predictionHorizonMs?: number;
}

export type PoseProviderState =
  | "idle" | "initializing" | "ready" | "running" | "paused"
  | "stopped" | "error" | "destroyed";

export type PoseDelegate = "GPU" | "CPU" | "synthetic";
export type SyntheticAction = "jump" | "squat" | "freeze" | "run" | "balance";

export interface PoseProviderCapabilities {
  readonly provider: "mediapipe" | "simulated";
  readonly normalizedLandmarks: true;
  readonly worldLandmarks: boolean;
  readonly multiplePoses: boolean;
  readonly maxPoses: number;
  readonly delegate: PoseDelegate;
  readonly model: string;
  readonly mirrored: boolean;
  readonly synthetic: boolean;
  readonly supportedSyntheticActions: readonly SyntheticAction[];
}

export interface PosePerformanceMetrics {
  readonly sampleWindowMs: number;
  readonly framesProduced: number;
  readonly inferenceAttempts: number;
  readonly inferenceErrors: number;
  readonly schedulerSkips: number;
  readonly averageInferenceMs: number;
  readonly p95InferenceMs: number;
  readonly inferenceHz: number;
  readonly outputHz: number;
  readonly targetInferenceHz: number;
  /** Fraction of render opportunities currently used for inference. */
  readonly dutyCycle: number;
}

export type PoseFrameListener = (frame: PoseFrame) => void;
export type PoseInputSource = HTMLVideoElement | HTMLCanvasElement | ImageBitmap;

export interface PoseProvider {
  readonly id: string;
  readonly state: PoseProviderState;
  readonly capabilities: PoseProviderCapabilities;
  initialize(): Promise<void>;
  start(source?: PoseInputSource): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): Promise<void>;
  destroy(): Promise<void>;
  subscribe(listener: PoseFrameListener): () => void;
  getLatestFrame(): PoseFrame | null;
  getMetrics(): PosePerformanceMetrics;
}

export function landmarkByName(
  pose: Pose,
  name: PoseLandmarkName,
): PoseLandmark | undefined {
  return pose.landmarks[POSE_LANDMARK_NAMES.indexOf(name)];
}
