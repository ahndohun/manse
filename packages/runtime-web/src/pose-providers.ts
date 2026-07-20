import { TIER_PROFILES } from "./config.js";
import type {
  PoseFrameListener,
  PoseInputSource,
  PoseProviderMetrics,
  ProviderFactory,
  ProviderFactoryOptions,
  RuntimeLandmark,
  RuntimePose,
  RuntimePoseFrame,
  RuntimePoseProvider,
} from "./types.js";

export const POSE_LANDMARK_NAMES = [
  "nose", "left_eye_inner", "left_eye", "left_eye_outer", "right_eye_inner",
  "right_eye", "right_eye_outer", "left_ear", "right_ear", "mouth_left",
  "mouth_right", "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
  "left_wrist", "right_wrist", "left_pinky", "right_pinky", "left_index",
  "right_index", "left_thumb", "right_thumb", "left_hip", "right_hip",
  "left_knee", "right_knee", "left_ankle", "right_ankle", "left_heel",
  "right_heel", "left_foot_index", "right_foot_index",
] as const;

interface ProviderTiming {
  now(): number;
  setTimeout(callback: () => void, delayMs: number): number;
  clearTimeout(handle: number): void;
}

abstract class ScheduledPoseProvider implements RuntimePoseProvider {
  abstract readonly id: string;
  abstract readonly kind: "mediapipe" | "simulated" | "replay";

  protected stateValue: RuntimePoseProvider["state"] = "idle";
  protected latestFrame: RuntimePoseFrame | null = null;
  protected readonly listeners = new Set<PoseFrameListener>();
  protected readonly targetHz: number;
  protected readonly timing: ProviderTiming;
  protected timer: number | null = null;
  protected framesProduced = 0;
  protected inferenceErrors = 0;
  protected inferenceDurationTotal = 0;
  protected startedAtMs = 0;

  constructor(targetHz: number, timing: ProviderTiming) {
    this.targetHz = targetHz;
    this.timing = timing;
  }

  abstract initialize(): Promise<void>;
  abstract start(source?: PoseInputSource): Promise<void>;

  get state(): RuntimePoseProvider["state"] {
    return this.stateValue;
  }

  subscribe(listener: PoseFrameListener): () => void {
    this.assertAlive();
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getLatestFrame(): RuntimePoseFrame | null {
    return this.latestFrame;
  }

  getMetrics(): PoseProviderMetrics {
    const elapsedSeconds = Math.max(0.001, (this.timing.now() - this.startedAtMs) / 1000);
    return {
      inferenceHz: this.framesProduced / elapsedSeconds,
      averageInferenceMs: this.framesProduced === 0 ? 0 : this.inferenceDurationTotal / this.framesProduced,
      framesProduced: this.framesProduced,
      inferenceErrors: this.inferenceErrors,
      targetInferenceHz: this.targetHz,
    };
  }

  pause(): void {
    this.assertAlive();
    if (this.stateValue !== "running") return;
    this.cancelTimer();
    this.stateValue = "paused";
  }

  resume(): void {
    this.assertAlive();
    if (this.stateValue !== "paused") return;
    this.stateValue = "running";
    this.schedule(0);
  }

  async stop(): Promise<void> {
    if (this.stateValue === "destroyed") return;
    this.cancelTimer();
    this.stateValue = "stopped";
  }

  async destroy(): Promise<void> {
    if (this.stateValue === "destroyed") return;
    this.cancelTimer();
    this.listeners.clear();
    this.latestFrame = null;
    this.stateValue = "destroyed";
  }

  protected emit(frame: RuntimePoseFrame): void {
    this.latestFrame = frame;
    this.framesProduced += 1;
    this.inferenceDurationTotal += frame.inferenceTimeMs;
    for (const listener of this.listeners) listener(frame);
  }

  protected schedule(delayMs = 1000 / this.targetHz): void {
    if (this.timer !== null || this.stateValue !== "running") return;
    this.timer = this.timing.setTimeout(() => {
      this.timer = null;
      void this.tick().finally(() => {
        if (this.stateValue === "running") this.schedule();
      });
    }, delayMs);
  }

  protected abstract tick(): Promise<void>;

  protected cancelTimer(): void {
    if (this.timer === null) return;
    this.timing.clearTimeout(this.timer);
    this.timer = null;
  }

  protected assertAlive(): void {
    if (this.stateValue === "destroyed") throw new Error("Pose provider has been destroyed.");
  }
}

interface MediaPipeRawLandmark {
  readonly x: number;
  readonly y: number;
  readonly z?: number;
  readonly visibility?: number;
  readonly presence?: number;
}

interface MediaPipeResult {
  readonly landmarks: readonly (readonly MediaPipeRawLandmark[])[];
}

interface MediaPipeLandmarker {
  detectForVideo(source: PoseInputSource, timestampMs: number): MediaPipeResult;
  close(): void;
}

export class MediaPipePoseProvider extends ScheduledPoseProvider {
  readonly id = "mediapipe";
  readonly kind = "mediapipe" as const;

  private readonly options: ProviderFactoryOptions;
  private landmarker: MediaPipeLandmarker | null = null;
  private source: PoseInputSource | null = null;
  private sequence = 0;
  private initializing: Promise<void> | null = null;

  constructor(options: ProviderFactoryOptions) {
    super(TIER_PROFILES[options.tier].inferenceHz, options.timing);
    this.options = options;
  }

  async initialize(): Promise<void> {
    this.assertAlive();
    if (this.landmarker !== null) {
      this.stateValue = "ready";
      return;
    }
    if (this.initializing !== null) return this.initializing;
    this.initializing = this.initializeLandmarker();
    return this.initializing;
  }

  async start(source?: PoseInputSource): Promise<void> {
    this.assertAlive();
    if (source !== undefined) this.source = source;
    if (this.source === null) throw new Error("MediaPipe requires a caller-owned local video or canvas source.");
    if (this.landmarker === null) await this.initialize();
    if (this.stateValue === "running") return;
    this.stateValue = "running";
    this.startedAtMs = this.timing.now();
    this.schedule(0);
  }

  override async stop(): Promise<void> {
    await super.stop();
    this.source = null;
  }

  override async destroy(): Promise<void> {
    if (this.stateValue === "destroyed") return;
    this.landmarker?.close();
    this.landmarker = null;
    this.source = null;
    await super.destroy();
  }

  protected async tick(): Promise<void> {
    if (this.landmarker === null || this.source === null || !isSourceReady(this.source)) return;
    const startedAt = this.timing.now();
    try {
      const result = this.landmarker.detectForVideo(this.source, startedAt);
      const inferenceTimeMs = Math.max(0, this.timing.now() - startedAt);
      const poses = result.landmarks.map((landmarks) => normalizePose(landmarks, this.options.mirror));
      this.emit({
        timestampMs: startedAt,
        sequence: this.sequence++,
        poses,
        source: "mediapipe",
        mirrored: this.options.mirror,
        synthetic: false,
        inferenceTimeMs,
      });
    } catch {
      this.inferenceErrors += 1;
    }
  }

  private async initializeLandmarker(): Promise<void> {
    this.stateValue = "idle";
    try {
      const vision = await import("@mediapipe/tasks-vision");
      const fileset = await vision.FilesetResolver.forVisionTasks(this.options.mediaPipeAssets.wasmBaseUrl);
      const profile = TIER_PROFILES[this.options.tier];
      const modelAssetPath = profile.model === "full"
        ? this.options.mediaPipeAssets.fullModelUrl
        : this.options.mediaPipeAssets.liteModelUrl;
      const delegate = this.options.tier === "C" ? "CPU" : "GPU";
      try {
        this.landmarker = await vision.PoseLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath, delegate },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
          outputSegmentationMasks: false,
        });
      } catch (error) {
        if (delegate === "CPU") throw error;
        this.landmarker = await vision.PoseLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath, delegate: "CPU" },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
          outputSegmentationMasks: false,
        });
      }
      this.stateValue = "ready";
    } catch (error) {
      this.stateValue = "error";
      throw new Error("Unable to initialize the local MediaPipe pose model.", { cause: error });
    } finally {
      this.initializing = null;
    }
  }
}

export class SimulatedPoseProvider extends ScheduledPoseProvider {
  readonly id = "simulated";
  readonly kind = "simulated" as const;

  private sequence = 0;
  private pose = createStandingPose();

  constructor(options: ProviderFactoryOptions) {
    super(30, options.timing);
  }

  async initialize(): Promise<void> {
    this.assertAlive();
    if (this.stateValue === "idle" || this.stateValue === "stopped") this.stateValue = "ready";
  }

  async start(): Promise<void> {
    this.assertAlive();
    if (this.stateValue === "idle" || this.stateValue === "stopped") await this.initialize();
    if (this.stateValue === "running") return;
    this.stateValue = "running";
    this.startedAtMs = this.timing.now();
    this.schedule(0);
  }

  setPointer(x: number, y: number, side: "left" | "right" = "right"): void {
    const clampedX = clamp(x, 0, 1);
    const clampedY = clamp(y, 0, 1);
    const names = new Set([`${side}_wrist`, `${side}_pinky`, `${side}_index`, `${side}_thumb`]);
    const current = this.pose.landmarks.find((landmark) => landmark.name === `${side}_wrist`);
    const dx = clampedX - (current?.x ?? clampedX);
    const dy = clampedY - (current?.y ?? clampedY);
    this.pose = {
      score: 1,
      landmarks: this.pose.landmarks.map((landmark) => names.has(landmark.name)
        ? { ...landmark, x: clamp(landmark.x + dx, 0, 1), y: clamp(landmark.y + dy, 0, 1) }
        : landmark),
    };
  }

  protected async tick(): Promise<void> {
    this.emit({
      timestampMs: this.timing.now(),
      sequence: this.sequence++,
      poses: [this.pose],
      source: "simulated",
      mirrored: true,
      synthetic: true,
      inferenceTimeMs: 0,
    });
  }
}

export class ReplayPoseProvider extends ScheduledPoseProvider {
  readonly id = "replay";
  readonly kind = "replay" as const;

  private readonly frames: readonly RuntimePoseFrame[];
  private cursor = 0;

  constructor(options: ProviderFactoryOptions) {
    super(TIER_PROFILES[options.tier].inferenceHz, options.timing);
    this.frames = options.replayFrames ?? [];
  }

  async initialize(): Promise<void> {
    this.assertAlive();
    this.stateValue = "ready";
  }

  async start(): Promise<void> {
    this.assertAlive();
    if (this.frames.length === 0) throw new Error("Replay provider requires at least one pose frame.");
    if (this.stateValue === "idle" || this.stateValue === "stopped") await this.initialize();
    this.stateValue = "running";
    this.startedAtMs = this.timing.now();
    this.schedule(0);
  }

  protected async tick(): Promise<void> {
    const template = this.frames[this.cursor % this.frames.length];
    if (template === undefined) return;
    this.cursor += 1;
    this.emit({ ...template, timestampMs: this.timing.now(), sequence: this.cursor - 1, source: "replay", synthetic: true });
  }
}

export const createDefaultPoseProvider: ProviderFactory = (options) => {
  switch (options.kind) {
    case "mediapipe": return new MediaPipePoseProvider(options);
    case "simulated": return new SimulatedPoseProvider(options);
    case "replay": return new ReplayPoseProvider(options);
  }
};

export function isPointerControllable(
  provider: RuntimePoseProvider,
): provider is RuntimePoseProvider & { setPointer(x: number, y: number, side?: "left" | "right"): void } {
  return "setPointer" in provider && typeof provider.setPointer === "function";
}

function normalizePose(raw: readonly MediaPipeRawLandmark[], mirror: boolean): RuntimePose {
  const landmarks: RuntimeLandmark[] = raw.map((landmark, index) => ({
    index,
    name: POSE_LANDMARK_NAMES[index] ?? `landmark_${index}`,
    x: clamp(mirror ? 1 - landmark.x : landmark.x, 0, 1),
    y: clamp(landmark.y, 0, 1),
    z: finiteOr(landmark.z, 0),
    visibility: clamp(finiteOr(landmark.visibility, 1), 0, 1),
    presence: clamp(finiteOr(landmark.presence, 1), 0, 1),
  }));
  const score = landmarks.length === 0
    ? 0
    : landmarks.reduce((sum, landmark) => sum + Math.min(landmark.visibility, landmark.presence), 0) / landmarks.length;
  return { landmarks, score };
}

function createStandingPose(): RuntimePose {
  const coordinates: readonly (readonly [number, number, number])[] = [
    [.5, .14, -.1], [.47, .13, -.1], [.46, .13, -.1], [.45, .14, -.1],
    [.53, .13, -.1], [.54, .13, -.1], [.55, .14, -.1], [.42, .16, 0],
    [.58, .16, 0], [.47, .19, -.08], [.53, .19, -.08], [.40, .31, 0],
    [.60, .31, 0], [.36, .43, 0], [.64, .43, 0], [.33, .55, 0],
    [.67, .55, 0], [.31, .56, 0], [.69, .56, 0], [.32, .55, 0],
    [.68, .55, 0], [.34, .54, 0], [.66, .54, 0], [.44, .58, 0],
    [.56, .58, 0], [.43, .76, 0], [.57, .76, 0], [.42, .94, 0],
    [.58, .94, 0], [.41, .96, .03], [.59, .96, .03], [.43, .98, -.04],
    [.57, .98, -.04],
  ];
  return {
    score: 1,
    landmarks: POSE_LANDMARK_NAMES.map((name, index) => {
      const coordinate = coordinates[index] ?? [.5, .5, 0];
      return {
        index,
        name,
        x: coordinate[0],
        y: coordinate[1],
        z: coordinate[2],
        visibility: 1,
        presence: 1,
      };
    }),
  };
}

function isSourceReady(source: PoseInputSource): boolean {
  return !(source instanceof HTMLVideoElement) || source.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
}

function finiteOr(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
