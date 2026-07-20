import { createDefaultFrameDriver, type FrameDriver } from "./clock.js";
import { PoseMetricsMonitor } from "./metrics.js";
import {
  AdaptiveInferenceScheduler,
  type AdaptiveInferenceSchedulerOptions,
} from "./scheduler.js";
import {
  OneEuroLandmarkSmoother,
  type OneEuroFilterOptions,
} from "./smoothing.js";
import {
  POSE_LANDMARK_NAMES,
  type Pose,
  type PoseFrame,
  type PoseFrameListener,
  type PoseInputSource,
  type PoseLandmark,
  type PosePerformanceMetrics,
  type PoseProvider,
  type PoseProviderCapabilities,
  type PoseProviderState,
} from "./types.js";

export const DEFAULT_MEDIAPIPE_WASM_BASE_URL = "/vendor/mediapipe/wasm";
export const DEFAULT_MEDIAPIPE_MODEL_ASSET_URL =
  "/models/pose_landmarker_full.task";

interface RawLandmark {
  readonly x: number;
  readonly y: number;
  readonly z?: number;
  readonly visibility?: number;
  readonly presence?: number;
}

export interface MediaPipeLandmarkerResult {
  readonly landmarks: readonly (readonly RawLandmark[])[];
  readonly worldLandmarks?: readonly (readonly RawLandmark[])[];
}

export interface MediaPipePoseLandmarkerAdapter {
  detectForVideo(source: PoseInputSource, timestampMs: number): MediaPipeLandmarkerResult;
  close(): void;
}

export interface MediaPipeCreationOptions {
  readonly baseOptions: {
    readonly modelAssetPath: string;
    readonly delegate: "GPU" | "CPU";
  };
  readonly runningMode: "VIDEO";
  readonly numPoses: number;
  readonly minPoseDetectionConfidence: number;
  readonly minPosePresenceConfidence: number;
  readonly minTrackingConfidence: number;
}

export interface MediaPipeTasksVisionAdapter {
  readonly FilesetResolver: {
    forVisionTasks(wasmBaseUrl: string): Promise<unknown>;
  };
  readonly PoseLandmarker: {
    createFromOptions(
      fileset: unknown,
      options: MediaPipeCreationOptions,
    ): Promise<MediaPipePoseLandmarkerAdapter>;
  };
}

export type MediaPipeTasksVisionLoader = () => Promise<MediaPipeTasksVisionAdapter>;

export interface MediaPipePoseProviderOptions {
  readonly id?: string;
  /** Same-origin directory containing the copied tasks-vision WASM files. */
  readonly wasmBaseUrl?: string;
  /** Same-origin .task model path bundled in the game Site. */
  readonly modelAssetUrl?: string;
  readonly delegate?: "GPU" | "CPU";
  readonly fallbackToCpu?: boolean;
  readonly numPoses?: number;
  readonly minPoseDetectionConfidence?: number;
  readonly minPosePresenceConfidence?: number;
  readonly minTrackingConfidence?: number;
  readonly mirror?: boolean;
  readonly smoothing?: false | OneEuroFilterOptions;
  readonly scheduler?: AdaptiveInferenceScheduler | AdaptiveInferenceSchedulerOptions;
  readonly frameDriver?: FrameDriver;
  readonly tasksVisionLoader?: MediaPipeTasksVisionLoader;
  /** Explicit deployment origin for non-browser validation and tests. */
  readonly assetOrigin?: string;
  readonly allowCrossOriginAssets?: boolean;
  readonly onError?: (error: unknown) => void;
}

export class MediaPipePoseProvider implements PoseProvider {
  readonly id: string;

  private stateValue: PoseProviderState = "idle";
  private readonly options: Required<Pick<
    MediaPipePoseProviderOptions,
    | "wasmBaseUrl"
    | "modelAssetUrl"
    | "fallbackToCpu"
    | "numPoses"
    | "minPoseDetectionConfidence"
    | "minPosePresenceConfidence"
    | "minTrackingConfidence"
    | "mirror"
    | "allowCrossOriginAssets"
  >> & MediaPipePoseProviderOptions;
  private readonly listeners = new Set<PoseFrameListener>();
  private readonly frameDriver: FrameDriver;
  private readonly loader: MediaPipeTasksVisionLoader;
  private readonly scheduler: AdaptiveInferenceScheduler;
  private readonly metrics: PoseMetricsMonitor;
  private readonly smoother: OneEuroLandmarkSmoother | null;
  private activeDelegate: "GPU" | "CPU";
  private landmarker: MediaPipePoseLandmarkerAdapter | null = null;
  private source: PoseInputSource | null = null;
  private latestFrame: PoseFrame | null = null;
  private sequence = 0;
  private frameHandle: number | null = null;
  private lastInferenceTimestampMs = -Infinity;

  constructor(options: MediaPipePoseProviderOptions = {}) {
    this.id = options.id ?? "mediapipe";
    this.options = {
      ...options,
      wasmBaseUrl: options.wasmBaseUrl ?? DEFAULT_MEDIAPIPE_WASM_BASE_URL,
      modelAssetUrl: options.modelAssetUrl ?? DEFAULT_MEDIAPIPE_MODEL_ASSET_URL,
      fallbackToCpu: options.fallbackToCpu ?? true,
      numPoses: options.numPoses ?? 1,
      minPoseDetectionConfidence: options.minPoseDetectionConfidence ?? 0.5,
      minPosePresenceConfidence: options.minPosePresenceConfidence ?? 0.5,
      minTrackingConfidence: options.minTrackingConfidence ?? 0.5,
      mirror: options.mirror ?? true,
      allowCrossOriginAssets: options.allowCrossOriginAssets ?? false,
    };
    validateUnitInterval(this.options.minPoseDetectionConfidence, "detection confidence");
    validateUnitInterval(this.options.minPosePresenceConfidence, "presence confidence");
    validateUnitInterval(this.options.minTrackingConfidence, "tracking confidence");
    if (!Number.isInteger(this.options.numPoses) || this.options.numPoses < 1 || this.options.numPoses > 8) {
      throw new RangeError("MediaPipe numPoses must be an integer from 1 through 8.");
    }
    validateSelfHostedAssetUrl(
      this.options.wasmBaseUrl,
      this.options.assetOrigin,
      this.options.allowCrossOriginAssets,
    );
    validateSelfHostedAssetUrl(
      this.options.modelAssetUrl,
      this.options.assetOrigin,
      this.options.allowCrossOriginAssets,
    );
    this.activeDelegate = options.delegate ?? "GPU";
    this.frameDriver = options.frameDriver ?? createDefaultFrameDriver();
    this.loader = options.tasksVisionLoader ?? loadMediaPipeTasksVision;
    this.scheduler = options.scheduler instanceof AdaptiveInferenceScheduler
      ? options.scheduler
      : new AdaptiveInferenceScheduler(options.scheduler);
    this.metrics = new PoseMetricsMonitor({ now: () => this.frameDriver.now() });
    this.smoother = options.smoothing === false
      ? null
      : new OneEuroLandmarkSmoother(options.smoothing);
  }

  get state(): PoseProviderState {
    return this.stateValue;
  }

  get capabilities(): PoseProviderCapabilities {
    return {
      provider: "mediapipe",
      normalizedLandmarks: true,
      worldLandmarks: true,
      multiplePoses: this.options.numPoses > 1,
      maxPoses: this.options.numPoses,
      delegate: this.activeDelegate,
      model: this.options.modelAssetUrl,
      mirrored: this.options.mirror,
      synthetic: false,
      supportedSyntheticActions: [],
    };
  }

  async initialize(): Promise<void> {
    this.assertNotDestroyed();
    if (this.landmarker !== null) {
      if (this.stateValue !== "running" && this.stateValue !== "paused") this.stateValue = "ready";
      return;
    }
    if (this.stateValue === "initializing") {
      throw new Error("MediaPipePoseProvider initialization is already in progress.");
    }
    this.stateValue = "initializing";
    try {
      const vision = await this.loader();
      const fileset = await vision.FilesetResolver.forVisionTasks(this.options.wasmBaseUrl);
      try {
        this.landmarker = await this.createLandmarker(vision, fileset, this.activeDelegate);
      } catch (error) {
        if (this.activeDelegate !== "GPU" || !this.options.fallbackToCpu) throw error;
        this.options.onError?.(error);
        this.activeDelegate = "CPU";
        this.landmarker = await this.createLandmarker(vision, fileset, "CPU");
      }
      this.stateValue = "ready";
    } catch (error) {
      this.stateValue = "error";
      this.options.onError?.(error);
      throw error;
    }
  }

  async start(source?: PoseInputSource): Promise<void> {
    this.assertNotDestroyed();
    if (source !== undefined) this.source = source;
    if (this.source === null) {
      throw new Error("MediaPipePoseProvider.start() requires a local video or canvas source.");
    }
    if (this.landmarker === null) await this.initialize();
    if (this.stateValue === "running") return;
    this.stateValue = "running";
    this.scheduler.setPaused(false);
    this.scheduleNextFrame();
  }

  pause(): void {
    this.assertNotDestroyed();
    if (this.stateValue !== "running") return;
    this.stateValue = "paused";
    this.scheduler.setPaused(true);
    this.cancelFrame();
  }

  resume(): void {
    this.assertNotDestroyed();
    if (this.stateValue !== "paused") return;
    this.stateValue = "running";
    this.scheduler.setPaused(false);
    this.scheduleNextFrame();
  }

  async stop(): Promise<void> {
    if (this.stateValue === "destroyed") return;
    this.cancelFrame();
    this.scheduler.setPaused(true);
    this.source = null;
    this.stateValue = "stopped";
  }

  async destroy(): Promise<void> {
    if (this.stateValue === "destroyed") return;
    this.cancelFrame();
    this.scheduler.setPaused(true);
    this.landmarker?.close();
    this.landmarker = null;
    this.source = null;
    this.listeners.clear();
    this.smoother?.reset();
    this.latestFrame = null;
    this.stateValue = "destroyed";
  }

  subscribe(listener: PoseFrameListener): () => void {
    this.assertNotDestroyed();
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getLatestFrame(): PoseFrame | null {
    return this.latestFrame;
  }

  getMetrics(): PosePerformanceMetrics {
    return this.metrics.snapshot(this.scheduler.snapshot());
  }

  /** Run a single inference without consulting the adaptive scheduler. */
  inferOnce(timestampMs = this.frameDriver.now(), source = this.source): PoseFrame {
    this.assertNotDestroyed();
    if (this.landmarker === null) throw new Error("MediaPipePoseProvider is not initialized.");
    if (source === null) throw new Error("A local pose input source is required.");
    const monotonicTimestampMs = Math.max(timestampMs, this.lastInferenceTimestampMs + 0.001);
    const startedAtMs = this.frameDriver.now();
    try {
      const result = this.landmarker.detectForVideo(source, monotonicTimestampMs);
      const inferenceTimeMs = Math.max(0, this.frameDriver.now() - startedAtMs);
      this.lastInferenceTimestampMs = monotonicTimestampMs;
      this.scheduler.recordInference(inferenceTimeMs, true);
      this.metrics.recordInference(monotonicTimestampMs, inferenceTimeMs, true);
      let frame: PoseFrame = {
        timestampMs: monotonicTimestampMs,
        sequence: this.sequence,
        poses: convertResult(result, this.options.mirror),
        source: "mediapipe",
        mirrored: this.options.mirror,
        synthetic: false,
        inferenceTimeMs,
      };
      this.sequence += 1;
      if (this.smoother !== null) frame = this.smoother.smooth(frame);
      this.latestFrame = frame;
      this.metrics.recordOutput(monotonicTimestampMs);
      for (const listener of this.listeners) listener(frame);
      return frame;
    } catch (error) {
      const inferenceTimeMs = Math.max(0, this.frameDriver.now() - startedAtMs);
      this.scheduler.recordInference(inferenceTimeMs, false);
      this.metrics.recordInference(monotonicTimestampMs, inferenceTimeMs, false);
      this.options.onError?.(error);
      throw error;
    }
  }

  private async createLandmarker(
    vision: MediaPipeTasksVisionAdapter,
    fileset: unknown,
    delegate: "GPU" | "CPU",
  ): Promise<MediaPipePoseLandmarkerAdapter> {
    return vision.PoseLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: this.options.modelAssetUrl,
        delegate,
      },
      runningMode: "VIDEO",
      numPoses: this.options.numPoses,
      minPoseDetectionConfidence: this.options.minPoseDetectionConfidence,
      minPosePresenceConfidence: this.options.minPosePresenceConfidence,
      minTrackingConfidence: this.options.minTrackingConfidence,
    });
  }

  private scheduleNextFrame(): void {
    if (this.frameHandle !== null || this.stateValue !== "running") return;
    this.frameHandle = this.frameDriver.request((timestampMs) => {
      this.frameHandle = null;
      if (this.stateValue !== "running") return;
      const decision = this.scheduler.consider(timestampMs);
      this.metrics.recordScheduleOpportunity(decision.shouldInfer);
      if (decision.shouldInfer && this.source !== null && isSourceReady(this.source)) {
        try {
          this.inferOnce(timestampMs);
        } catch {
          // Error is reported through onError; future frames may recover.
        }
      }
      this.scheduleNextFrame();
    });
  }

  private cancelFrame(): void {
    if (this.frameHandle === null) return;
    this.frameDriver.cancel(this.frameHandle);
    this.frameHandle = null;
  }

  private assertNotDestroyed(): void {
    if (this.stateValue === "destroyed") throw new Error("Pose provider has been destroyed.");
  }
}

export async function loadMediaPipeTasksVision(): Promise<MediaPipeTasksVisionAdapter> {
  const module = await import("@mediapipe/tasks-vision");
  return module as unknown as MediaPipeTasksVisionAdapter;
}

export function validateSelfHostedAssetUrl(
  value: string,
  assetOrigin = typeof location === "undefined" ? undefined : location.origin,
  allowCrossOrigin = false,
): void {
  if (value.trim() === "" || /^(?:data|blob|javascript):/i.test(value)) {
    throw new Error("MediaPipe assets must use non-empty bundled Site paths.");
  }
  const isAbsolute = /^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith("//");
  if (!isAbsolute || allowCrossOrigin) return;
  if (assetOrigin === undefined) {
    throw new Error("An assetOrigin is required to verify an absolute MediaPipe asset URL.");
  }
  const resolved = new URL(value, assetOrigin);
  const origin = new URL(assetOrigin).origin;
  if (resolved.origin !== origin) {
    throw new Error("Cross-origin MediaPipe runtime assets are disabled; bundle them in the game Site.");
  }
}

function convertResult(result: MediaPipeLandmarkerResult, mirror: boolean): readonly Pose[] {
  return result.landmarks.map((landmarks, poseIndex) => {
    const worldLandmarks = result.worldLandmarks?.[poseIndex];
    const converted = landmarks.slice(0, POSE_LANDMARK_NAMES.length).map((landmark, index) =>
      convertLandmark(landmark, index, mirror, false),
    );
    return {
      landmarks: converted,
      worldLandmarks: worldLandmarks?.slice(0, POSE_LANDMARK_NAMES.length).map(
        (landmark, index) => convertLandmark(landmark, index, mirror, true),
      ),
      score: aggregateScore(converted),
    };
  });
}

function convertLandmark(
  landmark: RawLandmark,
  index: number,
  mirror: boolean,
  world: boolean,
): PoseLandmark {
  const name = POSE_LANDMARK_NAMES[index];
  if (name === undefined) throw new RangeError(`Unsupported pose landmark index ${index}.`);
  return {
    index,
    name,
    x: mirror ? (world ? -landmark.x : 1 - landmark.x) : landmark.x,
    y: landmark.y,
    z: landmark.z ?? 0,
    visibility: clamp01(landmark.visibility ?? 1),
    presence: clamp01(landmark.presence ?? landmark.visibility ?? 1),
  };
}

function aggregateScore(landmarks: readonly PoseLandmark[]): number {
  if (landmarks.length === 0) return 0;
  return landmarks.reduce(
    (total, landmark) => total + Math.min(landmark.visibility, landmark.presence),
    0,
  ) / landmarks.length;
}

function isSourceReady(source: PoseInputSource): boolean {
  return !("readyState" in source) || source.readyState >= 2;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

function validateUnitInterval(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`MediaPipe ${label} must be in the inclusive range [0, 1].`);
  }
}
