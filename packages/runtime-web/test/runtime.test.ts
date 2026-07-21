import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseEpisodePack } from "@manse/schema";

import { assertSameOriginRuntimeUrl, parseRuntimeOverrides } from "../src/config.js";
import { createMansePlayer } from "../src/player.js";
import { SimulatedPoseProvider } from "../src/pose-providers.js";
import { TouchEpisodeSession, type TouchRuntimeEvent } from "../src/session.js";
import type {
  NarrationCue,
  PlayerEvent,
  PoseFrameListener,
  ProviderKind,
  RuntimePlatform,
  RuntimePoseFrame,
  RuntimePoseProvider,
  RuntimeRenderFrame,
  RuntimeRenderer,
} from "../src/types.js";

function loadFixture() {
  const url = new URL("../../schema/fixtures/valid/manse.pack.json", import.meta.url);
  return parseEpisodePack(JSON.parse(readFileSync(url, "utf8")) as unknown);
}

function frameAt(x: number, y: number, timestampMs: number, sequence: number): RuntimePoseFrame {
  return {
    timestampMs,
    sequence,
    source: "simulated",
    mirrored: true,
    synthetic: true,
    inferenceTimeMs: 0,
    poses: [{
      score: 1,
      landmarks: [{
        index: 16,
        name: "right_wrist",
        x,
        y,
        z: 0,
        visibility: 1,
        presence: 1,
      }],
    }],
  };
}

class ManualTiming {
  nowValue = 0;
  nextHandle = 1;
  readonly callbacks = new Map<number, () => void>();

  now = () => this.nowValue;

  setTimeout = (callback: () => void): number => {
    const handle = this.nextHandle++;
    this.callbacks.set(handle, callback);
    return handle;
  };

  clearTimeout = (handle: number): void => {
    this.callbacks.delete(handle);
  };

  async runNext(atMs: number): Promise<void> {
    this.nowValue = atMs;
    const entry = this.callbacks.entries().next().value as [number, () => void] | undefined;
    if (entry === undefined) throw new Error("No scheduled provider frame.");
    this.callbacks.delete(entry[0]);
    entry[1]();
    await Promise.resolve();
    await Promise.resolve();
  }
}

function createProviderHarness(kind: ProviderKind) {
  let state: RuntimePoseProvider["state"] = "idle";
  const listeners = new Set<PoseFrameListener>();
  const provider: RuntimePoseProvider = {
    id: `test-${kind}`,
    kind,
    get state() { return state; },
    async initialize() { state = "ready"; },
    async start() { state = "running"; },
    pause() { state = "paused"; },
    resume() { state = "running"; },
    async stop() { state = "stopped"; },
    async destroy() {
      state = "destroyed";
      listeners.clear();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getLatestFrame() { return null; },
    getMetrics() {
      return {
        inferenceHz: 0,
        averageInferenceMs: 0,
        framesProduced: 0,
        inferenceErrors: 0,
        targetInferenceHz: 30,
      };
    },
  };
  return {
    provider,
    emit(frame: RuntimePoseFrame) {
      for (const listener of listeners) listener(frame);
    },
  };
}

function createBrowserHarness() {
  let nowValue = 0;
  let nextHandle = 1;
  let mediaRequests = 0;
  let stoppedTracks = 0;
  let rendererDestroyed = false;
  const animationFrames = new Map<number, FrameRequestCallback>();
  const timers = new Map<number, () => void>();
  const audioElements: Array<{ src: string; playCount: number; pauseCount: number; removed: boolean }> = [];
  let renderedFrame: RuntimeRenderFrame | null = null;

  const document = {
    createElement(tagName: string) {
      if (tagName === "video") {
        return {
          autoplay: false,
          muted: false,
          playsInline: false,
          srcObject: null,
          setAttribute() {},
          async play() {},
          pause() {},
          remove() {},
        };
      }
      if (tagName === "audio") {
        const state = { src: "", playCount: 0, pauseCount: 0, removed: false };
        audioElements.push(state);
        return {
          preload: "",
          get src() { return state.src; },
          set src(value: string) { state.src = value; },
          async play() { state.playCount += 1; },
          pause() { state.pauseCount += 1; },
          remove() { state.removed = true; },
        };
      }
      throw new Error(`Unexpected element '${tagName}'.`);
    },
  } as unknown as Document;

  const platform: RuntimePlatform = {
    document,
    location: { href: "https://game.example/play", origin: "https://game.example", search: "" },
    now: () => nowValue,
    requestAnimationFrame(callback) {
      const handle = nextHandle++;
      animationFrames.set(handle, callback);
      return handle;
    },
    cancelAnimationFrame(handle) { animationFrames.delete(handle); },
    setTimeout(callback) {
      const handle = nextHandle++;
      timers.set(handle, callback);
      return handle;
    },
    clearTimeout(handle) { timers.delete(handle); },
    async fetch() { throw new Error("Unexpected fetch."); },
    async getUserMedia() {
      mediaRequests += 1;
      return {
        getTracks() {
          return [{ stop() { stoppedTracks += 1; } }];
        },
      } as unknown as MediaStream;
    },
  };

  const renderer: RuntimeRenderer = {
    kind: "dom",
    element: {} as HTMLElement,
    render(frame) { renderedFrame = frame; },
    destroy() { rendererDestroyed = true; },
  };

  return {
    platform,
    renderer,
    audioElements,
    get renderedFrame() { return renderedFrame; },
    get mediaRequests() { return mediaRequests; },
    get stoppedTracks() { return stoppedTracks; },
    get rendererDestroyed() { return rendererDestroyed; },
    async runAnimationFrame(atMs: number) {
      nowValue = atMs;
      const entry = animationFrames.entries().next().value as [number, FrameRequestCallback] | undefined;
      if (entry === undefined) throw new Error("No scheduled render frame.");
      animationFrames.delete(entry[0]);
      entry[1](atMs);
      await Promise.resolve();
      await Promise.resolve();
    },
    async flush() {
      await Promise.resolve();
      await Promise.resolve();
    },
  };
}

describe("runtime configuration", () => {
  it("treats mouse mode as the simulator judge path", () => {
    expect(parseRuntimeOverrides("?provider=mouse&tier=c")).toEqual({ provider: "simulated", tier: "C" });
  });

  it("rejects credentialed or cross-origin runtime assets", () => {
    const location = { href: "https://game.example/play", origin: "https://game.example" };
    expect(() => assertSameOriginRuntimeUrl("/models/lite.task", location)).not.toThrow();
    expect(() => assertSameOriginRuntimeUrl("https://user:secret@game.example/model.task", location)).toThrow(/credentials/u);
    expect(() => assertSameOriginRuntimeUrl("https://cdn.example/model.task", location)).toThrow(/cross-origin/u);
  });
});

describe("simulated pose provider", () => {
  it("moves a wrist from pointer input without camera or network access", async () => {
    const timing = new ManualTiming();
    const provider = new SimulatedPoseProvider({
      kind: "simulated",
      tier: "A",
      mirror: true,
      mediaPipeAssets: { wasmBaseUrl: "/wasm", fullModelUrl: "/full.task", liteModelUrl: "/lite.task" },
      document: {} as Document,
      timing,
    });
    const frames: RuntimePoseFrame[] = [];
    provider.subscribe((frame) => frames.push(frame));
    await provider.initialize();
    await provider.start();
    await timing.runNext(10);
    provider.setPointer(0.2, 0.3, "right");
    await timing.runNext(43);
    const wrist = frames.at(-1)?.poses[0]?.landmarks.find((landmark) => landmark.name === "right_wrist");
    expect(wrist).toMatchObject({ x: 0.2, y: 0.3 });
    expect(frames.at(-1)?.synthetic).toBe(true);
    await provider.destroy();
  });
});

describe("touch target episode", () => {
  it("runs story to targets to celebration to explicit terminal completion", () => {
    const events: TouchRuntimeEvent[] = [];
    const session = new TouchEpisodeSession(loadFixture(), {
      locale: "en",
      tier: "S",
      onEvent: (event) => events.push(event),
    });
    session.start(0);
    session.tick(2_500);
    let timestamp = 2_500;
    let sequence = 0;
    for (const [index, target] of session.getSnapshot(timestamp).targets.entries()) {
      session.updatePose(frameAt(target.x, target.y, timestamp += 10, sequence++));
      session.updatePose(frameAt(target.x, target.y, timestamp += 75, sequence++));
      session.updatePose(frameAt(target.x, target.y, timestamp += 75, sequence++));
      expect(session.getSnapshot(timestamp).completedTargets).toBe(index + 1);
    }
    expect(session.getSnapshot(timestamp).status).toBe("celebrating");
    expect(session.getSnapshot(timestamp).completedTargets).toBe(3);
    session.tick(timestamp + 1_500);
    expect(session.getSnapshot(timestamp + 1_500).scene.id).toBe("finish");
    session.tick(timestamp + 3_000);
    expect(session.getSnapshot(timestamp + 3_000).status).toBe("complete");
    expect(events.filter((event) => event.type === "target-hit")).toHaveLength(3);
    expect(events).toContainEqual({
      type: "audio-cue",
      sceneId: "reach",
      assetId: "cue-sfx",
      purpose: "success",
    });
    expect(events.at(-1)?.type).toBe("complete");
  });

  it("applies a struggle transition delta to the next executable challenge", () => {
    const source = loadFixture();
    const reach = source.scenes.find((scene) => scene.id === "reach");
    if (reach?.challenge === null || reach?.challenge === undefined) throw new Error("Fixture reach scene is missing.");
    const retry = {
      ...reach,
      id: "retry",
      transitions: [
        { on: "success", to: "finish", adapt: null },
        { on: "struggle", to: "finish", adapt: null },
      ],
    };
    const pack = parseEpisodePack({
      ...source,
      scenes: source.scenes.flatMap((scene) => scene.id === "reach"
        ? [
            {
              ...scene,
              transitions: [
                scene.transitions[0],
                {
                  on: "struggle",
                  to: "retry",
                  adapt: { targetScaleMul: 1.2, dwellMsMul: 0.8, countDelta: -1, timeBudgetMul: 1.2 },
                },
              ],
            },
            retry,
          ]
        : [scene]),
    });
    const events: TouchRuntimeEvent[] = [];
    const session = new TouchEpisodeSession(pack, { locale: "en", tier: "S", onEvent: (event) => events.push(event) });

    session.start(0);
    session.tick(2_500);
    const originalRadius = session.getSnapshot(2_500).targets[0]?.radius;
    session.tick(17_500);
    const adapted = session.getSnapshot(17_500);

    expect(adapted.scene.id).toBe("retry");
    expect(adapted.totalTargets).toBe(2);
    expect(adapted.targets[0]?.radius).toBeCloseTo((originalRadius ?? 0) * 1.2, 6);
    expect(events).toContainEqual({
      type: "audio-cue",
      sceneId: "reach",
      assetId: "cue-sfx",
      purpose: "encourage",
    });

    session.tick(32_500);
    expect(session.getSnapshot(32_500).scene.id).toBe("retry");
    session.tick(35_500);
    expect(session.getSnapshot(35_500).scene.id).toBe("finish");
  });
});

describe("browser player lifecycle", () => {
  it("requests camera only during setup and stops every track during destroy", async () => {
    const harness = createBrowserHarness();
    const provider = createProviderHarness("mediapipe");
    const events: PlayerEvent[] = [];
    const player = createMansePlayer({
      container: {} as HTMLElement,
      provider: "mediapipe",
      tier: "S",
      platform: harness.platform,
      providerFactory: () => provider.provider,
      rendererFactory: () => harness.renderer,
      onEvent: (event) => events.push(event),
    });

    await player.load(loadFixture());
    expect(harness.mediaRequests).toBe(0);
    expect(player.getSnapshot().cameraActive).toBe(false);

    await player.setup();
    expect(harness.mediaRequests).toBe(1);
    expect(player.getSnapshot().cameraActive).toBe(true);
    expect(events.filter((event) => event.type === "camera-started")).toHaveLength(1);

    await player.destroy();
    expect(harness.stoppedTracks).toBe(1);
    expect(harness.rendererDestroyed).toBe(true);
    expect(player.getSnapshot().cameraActive).toBe(false);
    expect(events.filter((event) => event.type === "camera-stopped")).toHaveLength(1);
  });

  it("resolves pack-local narration and challenge effects through the runtime", async () => {
    const harness = createBrowserHarness();
    const provider = createProviderHarness("simulated");
    const narration: NarrationCue[] = [];
    let narrationStops = 0;
    const player = createMansePlayer({
      container: {} as HTMLElement,
      locale: "en",
      provider: "simulated",
      tier: "S",
      platform: harness.platform,
      providerFactory: () => provider.provider,
      rendererFactory: () => harness.renderer,
      narration: {
        play(cue) { narration.push(cue); },
        stop() { narrationStops += 1; },
      },
    });

    await player.load({ pack: loadFixture(), baseUrl: "https://game.example/packs/example/" });
    await player.setup();
    await player.play();
    await harness.flush();
    expect(narration[0]).toMatchObject({
      sceneId: "intro",
      locale: "en",
      text: "Reach up and meet the stars!",
    });
    expect(narration[0]?.audioUrl?.toString()).toBe("https://game.example/packs/example/assets/audio/intro-en.mp3");

    await harness.runAnimationFrame(2_500);
    const targets = harness.renderedFrame?.targets ?? [];
    let timestamp = 2_500;
    let sequence = 0;
    for (const target of targets) {
      provider.emit(frameAt(target.x, target.y, timestamp += 10, sequence++));
      provider.emit(frameAt(target.x, target.y, timestamp += 75, sequence++));
      provider.emit(frameAt(target.x, target.y, timestamp += 75, sequence++));
    }
    await harness.flush();

    expect(harness.audioElements).toHaveLength(1);
    expect(harness.audioElements[0]).toMatchObject({
      src: "https://game.example/packs/example/assets/audio/cue.wav",
      playCount: 1,
    });

    await player.destroy();
    expect(narrationStops).toBeGreaterThanOrEqual(2);
    expect(harness.audioElements[0]?.pauseCount).toBe(1);
    expect(harness.audioElements[0]?.removed).toBe(true);
  });
});
