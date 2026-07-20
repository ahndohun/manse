import { createDefaultFrameDriver, type FrameDriver } from "./clock.js";
import { PoseMetricsMonitor } from "./metrics.js";
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
  type SyntheticAction,
} from "./types.js";

export const SIMULATION_KEY_BINDINGS: Readonly<Record<string, SyntheticAction>> = {
  j: "jump",
  arrowup: "jump",
  s: "squat",
  arrowdown: "squat",
  f: "freeze",
  r: "run",
  b: "balance",
};

const DEFAULT_ACTION_DURATIONS: Readonly<Record<SyntheticAction, number>> = {
  jump: 700,
  squat: 900,
  freeze: 1500,
  run: 1800,
  balance: 1800,
};

export interface SimulatedPoseProviderOptions {
  readonly id?: string;
  readonly framesPerSecond?: number;
  readonly autoTick?: boolean;
  readonly frameDriver?: FrameDriver;
  readonly actionDurationsMs?: Partial<Record<SyntheticAction, number>>;
}

interface ActiveAction {
  readonly name: SyntheticAction;
  readonly startedAtMs: number;
  readonly durationMs: number;
  readonly initialPose: Pose;
}

export class SimulatedPoseProvider implements PoseProvider {
  readonly id: string;
  readonly capabilities: PoseProviderCapabilities = {
    provider: "simulated",
    normalizedLandmarks: true,
    worldLandmarks: false,
    multiplePoses: false,
    maxPoses: 1,
    delegate: "synthetic",
    model: "deterministic-33-landmark-simulator",
    mirrored: true,
    synthetic: true,
    supportedSyntheticActions: ["jump", "squat", "freeze", "run", "balance"],
  };

  private stateValue: PoseProviderState = "idle";
  private readonly listeners = new Set<PoseFrameListener>();
  private readonly frameDriver: FrameDriver;
  private readonly autoTick: boolean;
  private readonly frameIntervalMs: number;
  private readonly actionDurations: Readonly<Record<SyntheticAction, number>>;
  private readonly metrics: PoseMetricsMonitor;
  private latestFrame: PoseFrame | null = null;
  private sequence = 0;
  private frameHandle: number | null = null;
  private pose = createStandingPose();
  private activeAction: ActiveAction | null = null;

  constructor(options: SimulatedPoseProviderOptions = {}) {
    this.id = options.id ?? "simulated";
    const framesPerSecond = options.framesPerSecond ?? 30;
    if (!Number.isFinite(framesPerSecond) || framesPerSecond <= 0 || framesPerSecond > 240) {
      throw new RangeError("Simulator framesPerSecond must be in the range (0, 240].");
    }
    this.frameDriver = options.frameDriver ?? createDefaultFrameDriver();
    this.autoTick = options.autoTick ?? true;
    this.frameIntervalMs = 1000 / framesPerSecond;
    this.actionDurations = { ...DEFAULT_ACTION_DURATIONS, ...options.actionDurationsMs };
    for (const duration of Object.values(this.actionDurations)) {
      if (!Number.isFinite(duration) || duration <= 0) {
        throw new RangeError("Synthetic action durations must be positive finite numbers.");
      }
    }
    this.metrics = new PoseMetricsMonitor({ now: () => this.frameDriver.now() });
  }

  get state(): PoseProviderState {
    return this.stateValue;
  }

  async initialize(): Promise<void> {
    this.assertNotDestroyed();
    if (this.stateValue === "idle") this.stateValue = "ready";
  }

  async start(_source?: PoseInputSource): Promise<void> {
    this.assertNotDestroyed();
    if (this.stateValue === "idle") await this.initialize();
    if (this.stateValue === "running") return;
    this.stateValue = "running";
    if (this.autoTick) this.scheduleNextFrame();
  }

  pause(): void {
    this.assertNotDestroyed();
    if (this.stateValue !== "running") return;
    this.stateValue = "paused";
    this.cancelFrame();
  }

  resume(): void {
    this.assertNotDestroyed();
    if (this.stateValue !== "paused") return;
    this.stateValue = "running";
    if (this.autoTick) this.scheduleNextFrame();
  }

  async stop(): Promise<void> {
    if (this.stateValue === "destroyed") return;
    this.cancelFrame();
    this.activeAction = null;
    this.stateValue = "stopped";
  }

  async destroy(): Promise<void> {
    if (this.stateValue === "destroyed") return;
    this.cancelFrame();
    this.listeners.clear();
    this.activeAction = null;
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
    return this.metrics.snapshot({ targetHz: 1000 / this.frameIntervalMs, dutyCycle: 1 });
  }

  /** Set a normalized wrist position as a mouse or pointer adapter would. */
  setWristPosition(side: "left" | "right", x: number, y: number): void {
    this.assertNotDestroyed();
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new TypeError("Wrist coordinates must be finite numbers.");
    }
    const wristName = `${side}_wrist` as const;
    const detailNames = new Set([
      wristName,
      `${side}_pinky`,
      `${side}_index`,
      `${side}_thumb`,
    ]);
    const clampedX = clamp(x, 0, 1);
    const clampedY = clamp(y, 0, 1);
    const wrist = this.pose.landmarks.find((landmark) => landmark.name === wristName);
    const deltaX = clampedX - (wrist?.x ?? clampedX);
    const deltaY = clampedY - (wrist?.y ?? clampedY);
    this.pose = {
      ...this.pose,
      landmarks: this.pose.landmarks.map((landmark) =>
        detailNames.has(landmark.name)
          ? {
              ...landmark,
              x: clamp(landmark.x + deltaX, 0, 1),
              y: clamp(landmark.y + deltaY, 0, 1),
            }
          : landmark,
      ),
    };
  }

  setPointerPosition(x: number, y: number, wrist: "left" | "right" = "right"): void {
    this.setWristPosition(wrist, x, y);
  }

  trigger(action: SyntheticAction, timestampMs = this.frameDriver.now()): void {
    this.assertNotDestroyed();
    const durationMs = this.actionDurations[action];
    this.activeAction = {
      name: action,
      startedAtMs: timestampMs,
      durationMs,
      initialPose: clonePose(this.pose),
    };
  }

  handleKey(input: string | { readonly key: string }, timestampMs = this.frameDriver.now()): boolean {
    const key = (typeof input === "string" ? input : input.key).toLowerCase();
    const action = SIMULATION_KEY_BINDINGS[key];
    if (action === undefined) return false;
    this.trigger(action, timestampMs);
    return true;
  }

  /** Produce one deterministic frame when autoTick is disabled or for tests. */
  advance(timestampMs = this.frameDriver.now()): PoseFrame {
    this.assertNotDestroyed();
    if (this.stateValue !== "running") {
      throw new Error("SimulatedPoseProvider must be running before advance().");
    }
    const startedAt = this.frameDriver.now();
    const pose = this.poseForTimestamp(timestampMs);
    const inferenceTimeMs = Math.max(0, this.frameDriver.now() - startedAt);
    const frame: PoseFrame = {
      timestampMs,
      sequence: this.sequence,
      poses: [pose],
      source: "simulated",
      mirrored: true,
      synthetic: true,
      inferenceTimeMs,
    };
    this.sequence += 1;
    this.latestFrame = frame;
    this.metrics.recordInference(timestampMs, inferenceTimeMs, true);
    this.metrics.recordOutput(timestampMs);
    for (const listener of this.listeners) listener(frame);
    return frame;
  }

  private poseForTimestamp(timestampMs: number): Pose {
    const action = this.activeAction;
    if (action === null) return clonePose(this.pose);
    const elapsed = Math.max(0, timestampMs - action.startedAtMs);
    if (elapsed >= action.durationMs) {
      this.activeAction = null;
      return clonePose(this.pose);
    }
    return transformAction(action, elapsed / action.durationMs);
  }

  private scheduleNextFrame(): void {
    if (this.frameHandle !== null || this.stateValue !== "running") return;
    this.frameHandle = this.frameDriver.request((timestampMs) => {
      this.frameHandle = null;
      if (this.stateValue !== "running") return;
      this.advance(timestampMs);
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

function createStandingPose(): Pose {
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
      } satisfies PoseLandmark;
    }),
  };
}

function transformAction(action: ActiveAction, progress: number): Pose {
  const wave = Math.sin(Math.PI * progress);
  const runWave = Math.sin(Math.PI * 4 * progress);
  return {
    ...action.initialPose,
    landmarks: action.initialPose.landmarks.map((landmark) => {
      switch (action.name) {
        case "jump":
          return { ...landmark, y: landmark.y - 0.16 * wave };
        case "squat":
          return squatLandmark(landmark, wave);
        case "freeze":
          return landmark;
        case "run":
          return runLandmark(landmark, runWave, Math.abs(runWave) * 0.018);
        case "balance":
          return balanceLandmark(landmark, wave);
      }
    }),
  };
}

function squatLandmark(landmark: PoseLandmark, wave: number): PoseLandmark {
  if (landmark.name.includes("ankle") || landmark.name.includes("heel") || landmark.name.includes("foot")) {
    return landmark;
  }
  const isKnee = landmark.name.includes("knee");
  const isHip = landmark.name.includes("hip");
  const yOffset = (isHip ? .16 : isKnee ? .09 : .12) * wave;
  const xDirection = landmark.name.startsWith("left") ? -1 : 1;
  return {
    ...landmark,
    x: isKnee ? landmark.x + xDirection * .07 * wave : landmark.x,
    y: landmark.y + yOffset,
  };
}

function runLandmark(landmark: PoseLandmark, wave: number, bounce: number): PoseLandmark {
  const left = landmark.name.startsWith("left");
  const alternating = (left ? wave : -wave);
  if (landmark.name.includes("wrist") || landmark.name.includes("elbow")) {
    return { ...landmark, y: landmark.y + alternating * .11 - bounce };
  }
  if (landmark.name.includes("knee") || landmark.name.includes("ankle") || landmark.name.includes("heel") || landmark.name.includes("foot")) {
    return { ...landmark, y: landmark.y - Math.max(0, alternating) * .12 - bounce };
  }
  return { ...landmark, y: landmark.y - bounce };
}

function balanceLandmark(landmark: PoseLandmark, wave: number): PoseLandmark {
  if (landmark.name === "left_wrist" || landmark.name === "right_wrist") {
    return { ...landmark, y: landmark.y + (.31 - landmark.y) * wave };
  }
  if (landmark.name.startsWith("left_") &&
      (landmark.name.includes("knee") || landmark.name.includes("ankle") ||
       landmark.name.includes("heel") || landmark.name.includes("foot"))) {
    return { ...landmark, x: landmark.x - .05 * wave, y: landmark.y - .18 * wave };
  }
  return landmark;
}

function clonePose(pose: Pose): Pose {
  return {
    ...pose,
    landmarks: pose.landmarks.map((landmark) => ({ ...landmark })),
    worldLandmarks: pose.worldLandmarks?.map((landmark) => ({ ...landmark })),
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
