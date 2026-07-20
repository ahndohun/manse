import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseEpisodePack } from "@manse/schema";

import { assertSameOriginRuntimeUrl, parseRuntimeOverrides } from "../src/config.js";
import { SimulatedPoseProvider } from "../src/pose-providers.js";
import { TouchEpisodeSession } from "../src/session.js";
import type { RuntimePoseFrame } from "../src/types.js";

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
    const events: string[] = [];
    const session = new TouchEpisodeSession(loadFixture(), {
      locale: "en",
      tier: "S",
      onEvent: (event) => events.push(event.type),
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
    expect(events.filter((event) => event === "target-hit")).toHaveLength(3);
    expect(events.at(-1)).toBe("complete");
  });
});
