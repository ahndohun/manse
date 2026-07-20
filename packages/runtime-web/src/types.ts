import type { EpisodePack } from "@manse/schema";

export type DeviceTier = "S" | "A" | "B" | "C";
export type TierPreference = DeviceTier | "auto";
export type ProviderKind = "mediapipe" | "simulated" | "replay";
export type ProviderPreference = ProviderKind | "auto";
export type RendererKind = "webgl2" | "canvas2d" | "dom";

export interface RuntimeLandmark {
  readonly index: number;
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly visibility: number;
  readonly presence: number;
}

export interface RuntimePose {
  readonly landmarks: readonly RuntimeLandmark[];
  readonly score: number;
}

export interface RuntimePoseFrame {
  readonly timestampMs: number;
  readonly sequence: number;
  readonly poses: readonly RuntimePose[];
  readonly source: ProviderKind;
  /** Coordinates are already mirrored into the player's screen space. */
  readonly mirrored: boolean;
  readonly synthetic: boolean;
  readonly inferenceTimeMs: number;
}

export interface PoseProviderMetrics {
  readonly inferenceHz: number;
  readonly averageInferenceMs: number;
  readonly framesProduced: number;
  readonly inferenceErrors: number;
  readonly targetInferenceHz: number;
}

export type PoseInputSource = HTMLVideoElement | HTMLCanvasElement | ImageBitmap;
export type PoseFrameListener = (frame: RuntimePoseFrame) => void;

/**
 * Runtime-owned provider boundary. Implementations receive only a local DOM media
 * source and expose landmark data. There is intentionally no network/telemetry API.
 */
export interface RuntimePoseProvider {
  readonly id: string;
  readonly kind: ProviderKind;
  readonly state: "idle" | "ready" | "running" | "paused" | "stopped" | "destroyed" | "error";
  initialize(): Promise<void>;
  start(source?: PoseInputSource): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): Promise<void>;
  destroy(): Promise<void>;
  subscribe(listener: PoseFrameListener): () => void;
  getLatestFrame(): RuntimePoseFrame | null;
  getMetrics(): PoseProviderMetrics;
}

export interface RuntimeTarget {
  readonly id: string;
  /** Normalized screen-space center. */
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly dwellProgress: number;
  readonly hit: boolean;
  readonly color: readonly [number, number, number, number];
}

export interface CalibrationResult {
  readonly sampleCount: number;
  readonly confidence: number;
  readonly reachBox: {
    readonly x0: number;
    readonly y0: number;
    readonly x1: number;
    readonly y1: number;
  };
}

export interface RuntimeRenderFrame {
  readonly timestampMs: number;
  readonly video: HTMLVideoElement | null;
  readonly poseFrame: RuntimePoseFrame | null;
  readonly targets: readonly RuntimeTarget[];
  readonly celebrationProgress: number;
  readonly caption: string | null;
  readonly mirror: boolean;
  readonly reducedStimulation: boolean;
  readonly tier: DeviceTier;
}

export interface RuntimeRenderer {
  readonly kind: RendererKind;
  readonly element: HTMLElement;
  render(frame: RuntimeRenderFrame): void;
  destroy(): void;
}

export interface RendererFactoryOptions {
  readonly container: HTMLElement;
  readonly tier: DeviceTier;
  readonly mirror: boolean;
  readonly reducedStimulation: boolean;
  readonly document: Document;
}

export type RendererFactory = (options: RendererFactoryOptions) => RuntimeRenderer;

export interface NarrationCue {
  readonly sceneId: string;
  readonly locale: string;
  readonly text: string;
  readonly audioUrl: URL | null;
}

export interface NarrationHooks {
  play(cue: NarrationCue): void | Promise<void>;
  stop(): void | Promise<void>;
}

export type PlayerPhase =
  | "idle"
  | "loading"
  | "ready"
  | "setting-up"
  | "calibrating"
  | "paused"
  | "playing"
  | "celebrating"
  | "complete"
  | "error"
  | "destroyed";

export interface PlayerMetrics {
  readonly renderFps: number;
  readonly inferenceHz: number;
  readonly averageInferenceMs: number;
  readonly inputToFeedbackMs: number | null;
}

export interface PlayerSnapshot {
  readonly phase: PlayerPhase;
  readonly packId: string | null;
  readonly sceneId: string | null;
  readonly sceneKind: string | null;
  readonly provider: ProviderKind;
  readonly tier: DeviceTier;
  readonly renderer: RendererKind | null;
  readonly cameraActive: boolean;
  readonly mirror: boolean;
  readonly reducedStimulation: boolean;
  readonly captions: boolean;
  readonly caption: string | null;
  readonly calibration: CalibrationResult | null;
  readonly targetProgress: {
    readonly completed: number;
    readonly total: number;
  } | null;
  readonly metrics: PlayerMetrics;
  readonly error: Error | null;
}

export type PlayerEvent =
  | { readonly type: "phase"; readonly phase: PlayerPhase }
  | { readonly type: "pack-loaded"; readonly packId: string }
  | { readonly type: "camera-started" }
  | { readonly type: "camera-stopped" }
  | { readonly type: "calibrated"; readonly result: CalibrationResult }
  | { readonly type: "target-hit"; readonly sceneId: string; readonly targetId: string }
  | { readonly type: "scene-changed"; readonly sceneId: string }
  | { readonly type: "complete" }
  | { readonly type: "error"; readonly error: Error };

export interface LoadedEpisodePack {
  readonly pack: EpisodePack;
  /** Directory used to resolve pack-relative assets. */
  readonly baseUrl: URL;
}

export type EpisodePackSource =
  | EpisodePack
  | URL
  | string
  | { readonly pack: unknown; readonly baseUrl?: URL | string };

export interface CameraOptions {
  readonly width?: number;
  readonly height?: number;
  readonly facingMode?: "user" | "environment";
}

export interface MediaPipeAssetOptions {
  /** Same-origin folder containing tasks-vision WASM files. */
  readonly wasmBaseUrl: string;
  /** Same-origin PoseLandmarker .task file. */
  readonly fullModelUrl: string;
  /** Same-origin PoseLandmarker lite .task file. */
  readonly liteModelUrl: string;
}

export interface ProviderFactoryOptions {
  readonly kind: ProviderKind;
  readonly tier: DeviceTier;
  readonly mirror: boolean;
  readonly mediaPipeAssets: MediaPipeAssetOptions;
  readonly replayFrames?: readonly RuntimePoseFrame[];
  readonly document: Document;
  readonly timing: Pick<RuntimePlatform, "now" | "setTimeout" | "clearTimeout">;
}

export type ProviderFactory = (
  options: ProviderFactoryOptions,
) => RuntimePoseProvider | Promise<RuntimePoseProvider>;

export interface RuntimePlatform {
  readonly document: Document;
  readonly location: Pick<Location, "href" | "origin" | "search">;
  now(): number;
  requestAnimationFrame(callback: FrameRequestCallback): number;
  cancelAnimationFrame(handle: number): void;
  setTimeout(callback: () => void, delayMs: number): number;
  clearTimeout(handle: number): void;
  fetch(input: URL, init?: RequestInit): Promise<Response>;
  getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
}

export interface MansePlayerOptions {
  readonly container: HTMLElement;
  readonly locale?: string;
  readonly provider?: ProviderPreference;
  readonly tier?: TierPreference;
  readonly mirror?: boolean;
  readonly reducedStimulation?: boolean;
  readonly captions?: boolean;
  readonly camera?: CameraOptions;
  readonly mediaPipeAssets?: Partial<MediaPipeAssetOptions>;
  readonly replayFrames?: readonly RuntimePoseFrame[];
  readonly providerFactory?: ProviderFactory;
  readonly rendererFactory?: RendererFactory;
  readonly narration?: NarrationHooks;
  readonly onCaption?: (caption: string | null) => void;
  readonly onEvent?: (event: PlayerEvent) => void;
  /** Dependency injection seam for deterministic tests. */
  readonly platform?: RuntimePlatform;
}

export interface CalibrationOptions {
  readonly durationMs?: number;
  readonly minimumSamples?: number;
}

export interface MansePlayer {
  load(source: EpisodePackSource): Promise<LoadedEpisodePack>;
  /** The only method that may request camera permission. Call it from a user action. */
  setup(): Promise<void>;
  calibrate(options?: CalibrationOptions): Promise<CalibrationResult>;
  play(): Promise<void>;
  pause(): Promise<void>;
  destroy(): Promise<void>;
  getSnapshot(): PlayerSnapshot;
  subscribe(listener: (snapshot: PlayerSnapshot) => void): () => void;
  /** Simulator-only pointer control in normalized screen coordinates. */
  setPointer(x: number, y: number, side?: "left" | "right"): void;
}
