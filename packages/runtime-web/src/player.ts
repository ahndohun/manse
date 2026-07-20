import {
  mergeMediaPipeAssets,
  parseRuntimeOverrides,
  resolveProvider,
  resolveTier,
} from "./config.js";
import { loadEpisodePack } from "./loader.js";
import { createBrowserPlatform } from "./platform.js";
import {
  createDefaultPoseProvider,
  isPointerControllable,
} from "./pose-providers.js";
import { createDefaultRenderer } from "./renderers/index.js";
import { TouchEpisodeSession, type TouchRuntimeEvent } from "./session.js";
import type {
  CalibrationOptions,
  CalibrationResult,
  EpisodePackSource,
  LoadedEpisodePack,
  MansePlayer,
  MansePlayerOptions,
  PlayerEvent,
  PlayerPhase,
  PlayerSnapshot,
  RuntimePlatform,
  RuntimePoseFrame,
  RuntimePoseProvider,
  RuntimeRenderer,
} from "./types.js";

const DEFAULT_CALIBRATION: CalibrationResult = {
  sampleCount: 0,
  confidence: 0,
  reachBox: { x0: 0.16, y0: 0.16, x1: 0.84, y1: 0.9 },
};

export function createMansePlayer(options: MansePlayerOptions): MansePlayer {
  return new BrowserMansePlayer(options);
}

class BrowserMansePlayer implements MansePlayer {
  private readonly options: MansePlayerOptions;
  private readonly platform: RuntimePlatform;
  private readonly providerKind: PlayerSnapshot["provider"];
  private readonly tier: PlayerSnapshot["tier"];
  private readonly mirror: boolean;
  private readonly reducedStimulation: boolean;
  private readonly captions: boolean;
  private readonly listeners = new Set<(snapshot: PlayerSnapshot) => void>();
  private loaded: LoadedEpisodePack | null = null;
  private session: TouchEpisodeSession | null = null;
  private provider: RuntimePoseProvider | null = null;
  private renderer: RuntimeRenderer | null = null;
  private providerUnsubscribe: (() => void) | null = null;
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private phase: PlayerPhase = "idle";
  private error: Error | null = null;
  private calibration: CalibrationResult | null = null;
  private caption: string | null = null;
  private animationFrame: number | null = null;
  private renderWindowStartedAtMs = 0;
  private renderFramesInWindow = 0;
  private renderFps = 0;
  private inputToFeedbackMs: number | null = null;

  constructor(options: MansePlayerOptions) {
    this.options = options;
    this.platform = options.platform ?? createBrowserPlatform();
    const overrides = parseRuntimeOverrides(this.platform.location.search);
    this.providerKind = resolveProvider(options.provider ?? "auto", overrides.provider);
    this.tier = resolveTier(options.tier ?? "auto", overrides.tier, this.platform.document);
    this.mirror = options.mirror ?? true;
    this.reducedStimulation = options.reducedStimulation ?? false;
    this.captions = options.captions ?? true;
  }

  async load(source: EpisodePackSource): Promise<LoadedEpisodePack> {
    this.assertAlive();
    this.setPhase("loading");
    this.error = null;
    try {
      const loaded = await loadEpisodePack(source, this.platform);
      this.loaded = loaded;
      this.session = new TouchEpisodeSession(loaded.pack, {
        locale: this.options.locale ?? loaded.pack.meta.locales[0] ?? "en",
        tier: this.tier,
        onEvent: (event) => this.handleSessionEvent(event),
      });
      this.options.onEvent?.({ type: "pack-loaded", packId: loaded.pack.meta.id });
      this.setPhase("ready");
      return loaded;
    } catch (error) {
      throw this.fail(error, "Unable to load the Manse game pack.");
    }
  }

  async setup(): Promise<void> {
    this.assertAlive();
    this.assertLoaded();
    if (this.provider !== null) return;
    this.setPhase("setting-up");
    try {
      this.renderer = (this.options.rendererFactory ?? createDefaultRenderer)({
        container: this.options.container,
        tier: this.tier,
        mirror: this.mirror,
        reducedStimulation: this.reducedStimulation,
        document: this.platform.document,
      });
      this.provider = await (this.options.providerFactory ?? createDefaultPoseProvider)({
        kind: this.providerKind,
        tier: this.tier,
        mirror: this.mirror,
        mediaPipeAssets: mergeMediaPipeAssets(this.options.mediaPipeAssets, this.platform),
        replayFrames: this.options.replayFrames,
        document: this.platform.document,
        timing: this.platform,
      });
      this.providerUnsubscribe = this.provider.subscribe((frame) => this.handlePose(frame));
      await this.provider.initialize();
      if (this.providerKind === "mediapipe") {
        await this.startCameraProvider();
      } else {
        await this.provider.start();
      }
      this.setPhase("ready");
      this.renderNow(this.platform.now());
    } catch (error) {
      await this.releaseRuntimeResources();
      throw this.fail(error, "Unable to prepare the Manse player.");
    }
  }

  async calibrate(options: CalibrationOptions = {}): Promise<CalibrationResult> {
    this.assertAlive();
    this.assertLoaded();
    if (this.provider === null) await this.setup();
    const provider = this.provider;
    if (provider === null) throw new Error("Pose provider setup did not complete.");
    this.setPhase("calibrating");
    const minimumSamples = options.minimumSamples ?? (this.providerKind === "mediapipe" ? 8 : 1);
    const durationMs = options.durationMs ?? (this.providerKind === "mediapipe" ? 1_200 : 80);
    const frames: RuntimePoseFrame[] = [];
    const latest = provider.getLatestFrame();
    if (latest !== null) frames.push(latest);
    const unsubscribe = provider.subscribe((frame) => frames.push(frame));
    await delay(this.platform, durationMs);
    unsubscribe();
    const result = calibrationFromFrames(frames, minimumSamples);
    this.calibration = result;
    this.session?.setCalibration(result);
    this.options.onEvent?.({ type: "calibrated", result });
    this.setPhase("ready");
    return result;
  }

  async play(): Promise<void> {
    this.assertAlive();
    this.assertLoaded();
    if (this.provider === null || this.renderer === null) await this.setup();
    if (this.provider?.state === "paused") this.provider.resume();
    this.session?.start(this.platform.now());
    this.setPhase("playing");
    this.startRenderLoop();
  }

  async pause(): Promise<void> {
    this.assertAlive();
    this.stopRenderLoop();
    this.provider?.pause();
    this.setPhase("paused");
  }

  async destroy(): Promise<void> {
    if (this.phase === "destroyed") return;
    this.stopRenderLoop();
    await this.releaseRuntimeResources();
    this.loaded = null;
    this.session = null;
    this.caption = null;
    this.setPhase("destroyed");
    this.listeners.clear();
  }

  getSnapshot(): PlayerSnapshot {
    const now = this.platform.now();
    const session = this.session?.getSnapshot(now) ?? null;
    const providerMetrics = this.provider?.getMetrics();
    return {
      phase: this.phase,
      packId: this.loaded?.pack.meta.id ?? null,
      sceneId: session?.scene.id ?? null,
      sceneKind: session?.scene.kind ?? null,
      provider: this.providerKind,
      tier: this.tier,
      renderer: this.renderer?.kind ?? null,
      cameraActive: this.stream !== null,
      mirror: this.mirror,
      reducedStimulation: this.reducedStimulation,
      captions: this.captions,
      caption: this.captions ? (session?.caption ?? this.caption) : null,
      calibration: this.calibration,
      targetProgress: session === null || session.totalTargets === 0
        ? null
        : { completed: session.completedTargets, total: session.totalTargets },
      metrics: {
        renderFps: this.renderFps,
        inferenceHz: providerMetrics?.inferenceHz ?? 0,
        averageInferenceMs: providerMetrics?.averageInferenceMs ?? 0,
        inputToFeedbackMs: this.inputToFeedbackMs,
      },
      error: this.error,
    };
  }

  subscribe(listener: (snapshot: PlayerSnapshot) => void): () => void {
    this.assertAlive();
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  setPointer(x: number, y: number, side: "left" | "right" = "right"): void {
    this.assertAlive();
    if (this.provider === null || !isPointerControllable(this.provider)) {
      throw new Error("Pointer control is available only in simulator mode after setup.");
    }
    this.provider.setPointer(clamp(x, 0, 1), clamp(y, 0, 1), side);
  }

  private async startCameraProvider(): Promise<void> {
    const provider = this.provider;
    if (provider === null) return;
    const video = this.platform.document.createElement("video");
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("aria-hidden", "true");
    const stream = await this.platform.getUserMedia({
      audio: false,
      video: {
        facingMode: this.options.camera?.facingMode ?? "user",
        width: { ideal: this.options.camera?.width ?? 1280 },
        height: { ideal: this.options.camera?.height ?? 720 },
      },
    });
    video.srcObject = stream;
    await video.play();
    this.video = video;
    this.stream = stream;
    this.options.onEvent?.({ type: "camera-started" });
    await provider.start(video);
  }

  private handlePose(frame: RuntimePoseFrame): void {
    this.session?.updatePose(frame);
  }

  private handleSessionEvent(event: TouchRuntimeEvent): void {
    switch (event.type) {
      case "target-hit":
        this.inputToFeedbackMs = event.feedbackLatencyMs ?? null;
        if (event.targetId !== undefined) {
          this.options.onEvent?.({ type: "target-hit", sceneId: event.sceneId, targetId: event.targetId });
        }
        break;
      case "scene-changed":
        this.options.onEvent?.({ type: "scene-changed", sceneId: event.sceneId });
        break;
      case "complete":
        this.setPhase("complete");
        this.options.onEvent?.({ type: "complete" });
        this.stopRenderLoop();
        break;
    }
  }

  private startRenderLoop(): void {
    if (this.animationFrame !== null) return;
    this.renderWindowStartedAtMs = this.platform.now();
    this.renderFramesInWindow = 0;
    const update = (timestampMs: number): void => {
      this.animationFrame = null;
      this.renderNow(timestampMs);
      if (this.phase === "playing" || this.phase === "celebrating") {
        this.animationFrame = this.platform.requestAnimationFrame(update);
      }
    };
    this.animationFrame = this.platform.requestAnimationFrame(update);
  }

  private stopRenderLoop(): void {
    if (this.animationFrame === null) return;
    this.platform.cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
  }

  private renderNow(timestampMs: number): void {
    const session = this.session;
    const renderer = this.renderer;
    if (session === null || renderer === null) return;
    session.tick(timestampMs);
    const state = session.getSnapshot(timestampMs);
    if (state.status === "celebrating" && this.phase !== "celebrating") this.setPhase("celebrating");
    if (state.status === "playing" && this.phase === "celebrating") this.setPhase("playing");
    if (state.status === "complete" && this.phase !== "complete") this.setPhase("complete");
    const caption = this.captions ? state.caption : null;
    if (caption !== this.caption) {
      this.caption = caption;
      this.options.onCaption?.(caption);
    }
    renderer.render({
      timestampMs,
      video: this.video,
      poseFrame: this.provider?.getLatestFrame() ?? null,
      targets: state.targets,
      celebrationProgress: state.celebrationProgress,
      caption,
      mirror: this.mirror,
      reducedStimulation: this.reducedStimulation,
      tier: this.tier,
    });
    this.trackRenderRate(timestampMs);
    this.emitSnapshot();
  }

  private trackRenderRate(timestampMs: number): void {
    this.renderFramesInWindow += 1;
    const elapsed = timestampMs - this.renderWindowStartedAtMs;
    if (elapsed < 500) return;
    this.renderFps = this.renderFramesInWindow * 1000 / Math.max(1, elapsed);
    this.renderFramesInWindow = 0;
    this.renderWindowStartedAtMs = timestampMs;
  }

  private setPhase(phase: PlayerPhase): void {
    if (this.phase === phase) return;
    this.phase = phase;
    const event: PlayerEvent = { type: "phase", phase };
    this.options.onEvent?.(event);
    this.emitSnapshot();
  }

  private emitSnapshot(): void {
    if (this.listeners.size === 0) return;
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) listener(snapshot);
  }

  private fail(error: unknown, fallback: string): Error {
    const normalized = error instanceof Error ? error : new Error(fallback, { cause: error });
    this.error = normalized;
    this.phase = "error";
    this.options.onEvent?.({ type: "error", error: normalized });
    this.emitSnapshot();
    return normalized;
  }

  private assertLoaded(): void {
    if (this.loaded === null || this.session === null) throw new Error("Load a Manse pack before starting the player.");
  }

  private assertAlive(): void {
    if (this.phase === "destroyed") throw new Error("This Manse player has been destroyed.");
  }

  private async releaseRuntimeResources(): Promise<void> {
    this.providerUnsubscribe?.();
    this.providerUnsubscribe = null;
    await this.provider?.destroy();
    this.provider = null;
    if (this.stream !== null) {
      for (const track of this.stream.getTracks()) track.stop();
      this.options.onEvent?.({ type: "camera-stopped" });
    }
    this.stream = null;
    if (this.video !== null) {
      this.video.pause();
      this.video.srcObject = null;
      this.video.remove();
    }
    this.video = null;
    this.renderer?.destroy();
    this.renderer = null;
  }
}

function calibrationFromFrames(frames: readonly RuntimePoseFrame[], minimumSamples: number): CalibrationResult {
  const points: Array<{ readonly x: number; readonly y: number }> = [];
  for (const frame of frames) {
    const pose = frame.poses.reduce<RuntimePoseFrame["poses"][number] | undefined>(
      (best, candidate) => best === undefined || candidate.score > best.score ? candidate : best,
      undefined,
    );
    for (const landmark of pose?.landmarks ?? []) {
      if (!["left_wrist", "right_wrist", "left_ankle", "right_ankle"].includes(landmark.name)) continue;
      if (Math.min(landmark.visibility, landmark.presence) < 0.35) continue;
      points.push({ x: landmark.x, y: landmark.y });
    }
  }
  if (points.length === 0) return { ...DEFAULT_CALIBRATION, sampleCount: frames.length };
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const x0 = clamp(Math.min(...xs) - 0.14, 0.03, 0.45);
  const x1 = clamp(Math.max(...xs) + 0.14, 0.55, 0.97);
  const y0 = clamp(Math.min(...ys) - 0.14, 0.03, 0.45);
  const y1 = clamp(Math.max(...ys) + 0.08, 0.55, 0.97);
  return {
    sampleCount: frames.length,
    confidence: clamp(frames.length / Math.max(1, minimumSamples), 0, 1),
    reachBox: { x0, y0, x1, y1 },
  };
}

function delay(platform: RuntimePlatform, durationMs: number): Promise<void> {
  return new Promise((resolve) => platform.setTimeout(resolve, Math.max(0, durationMs)));
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
