import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseEpisodePack, type Challenge, type Players } from "@manse/schema";

import { PlayerTracker } from "../src/player-tracker.js";
import { EpisodeSession, type RuntimeSessionEvent } from "../src/session.js";
import {
  synthesizeMultiPoseFrames,
  synthesizePoseFrames,
  type MotionScript,
} from "../src/testing.js";

/** Scene enters after the intro story's passive duration. */
const SCENE_START_MS = 2_500;

interface ReplayFixture {
  readonly success: MotionScript;
  readonly failure: MotionScript;
  readonly boundary: MotionScript;
}

function loadReplay(name: string): ReplayFixture {
  const url = new URL(`../fixtures/replay/${name}.json`, import.meta.url);
  return JSON.parse(readFileSync(url, "utf8")) as ReplayFixture;
}

function makePack(challenge: unknown, players?: Players) {
  return parseEpisodePack({
    schemaVersion: 2,
    meta: {
      id: "manse.test.motion",
      title: [{ locale: "en", text: "Motion Test" }],
      summary: [{ locale: "en", text: "Deterministic replay harness pack." }],
      theme: "test",
      locales: ["en"],
      ageBands: ["6-7"],
      estMinutes: 2,
      engine: { minimumVersion: "0.2.0", maximumVersion: null },
      compiler: null,
      ...(players === undefined ? {} : { players }),
    },
    permissions: { camera: true, deviceLocalStorage: false },
    cast: [{
      id: "guide",
      name: [{ locale: "en", text: "Mansi" }],
      artAssetId: null,
      description: "Test guide",
    }],
    entrySceneId: "intro",
    scenes: [
      {
        id: "intro",
        kind: "story",
        narration: { items: [{ locale: "en", text: "Get ready", audioAssetId: null }], captionDefaultOn: true },
        demo: null,
        challenge: null,
        learning: null,
        artAssetId: null,
        energy: "calm",
        terminal: false,
        transitions: [{ on: "always", to: "trial", adapt: null }],
      },
      {
        id: "trial",
        kind: "challenge",
        narration: { items: [{ locale: "en", text: "Go!", audioAssetId: null }], captionDefaultOn: true },
        demo: null,
        challenge,
        learning: null,
        artAssetId: null,
        energy: "medium",
        terminal: false,
        transitions: [
          { on: "success", to: "finish", adapt: null },
          { on: "struggle", to: "finish", adapt: null },
        ],
      },
      {
        id: "finish",
        kind: "celebration",
        narration: { items: [{ locale: "en", text: "Done", audioAssetId: null }], captionDefaultOn: true },
        demo: null,
        challenge: null,
        learning: null,
        artAssetId: null,
        energy: "calm",
        terminal: true,
        transitions: [],
      },
    ],
    adaptPolicy: { targetSuccessBand: [0.65, 0.85], maxStruggleStreak: 2, maxHighEnergyMs: 120_000 },
    assets: {
      images: [],
      audio: [{
        id: "cue-sfx",
        path: "assets/audio/cue.wav",
        mediaType: "audio/wav",
        locale: null,
        transcript: "",
        license: { spdxId: "CC0-1.0", name: "CC0 1.0 Universal", url: null, attribution: null },
        provenance: { kind: "original", creator: "Test", createdAt: "2026-07-21T00:00:00.000Z" },
      }],
      music: [],
    },
  });
}

const CHALLENGE_BASE = { successAudioId: "cue-sfx", encourageAudioId: "cue-sfx" };

interface TimedEvent {
  readonly at: number;
  readonly event: RuntimeSessionEvent;
}

/** Run a replay through a full session; returns every event with its time. */
function driveSession(
  challenge: unknown,
  frames: ReturnType<typeof synthesizePoseFrames>,
  players?: Players,
): TimedEvent[] {
  const events: TimedEvent[] = [];
  let now = 0;
  const session = new EpisodeSession(makePack(challenge, players), {
    locale: "en",
    tier: "S",
    onEvent: (event) => events.push({ at: now, event }),
  });
  session.start(0);
  now = SCENE_START_MS;
  session.tick(SCENE_START_MS);
  for (const frame of frames) {
    now = frame.timestampMs + SCENE_START_MS;
    session.tick(now);
    session.updatePose({ ...frame, timestampMs: now });
  }
  // Let celebration and terminal scenes resolve.
  for (const extra of [1_600, 3_200, 6_000]) session.tick(now + extra);
  return events;
}

function successAt(events: readonly TimedEvent[]): number | null {
  const cue = events.find(({ event }) => event.type === "audio-cue" && event.purpose === "success");
  return cue?.at ?? null;
}

function struggled(events: readonly TimedEvent[]): boolean {
  return events.some(({ event }) => event.type === "audio-cue" && event.purpose === "encourage");
}

function progressLabels(events: readonly TimedEvent[]): string[] {
  return events
    .filter((entry): entry is TimedEvent & { event: Extract<RuntimeSessionEvent, { type: "challenge-progress" }> } =>
      entry.event.type === "challenge-progress")
    .map((entry) => entry.event.label);
}

function expectCompleted(events: readonly TimedEvent[]): void {
  expect(events.at(-1)?.event.type).toBe("complete");
}

describe("freeze evaluator", () => {
  const replay = loadReplay("freeze");
  const challenge = {
    type: "freeze", holdMs: 2_000, motionThreshold: 0.02, graceMs: 250,
    rounds: 2, minVisibleJoints: 8, timeBudgetMs: 8_000, ...CHALLENGE_BASE,
  };

  it("succeeds after two held stills separated by movement", () => {
    const events = driveSession(challenge, synthesizePoseFrames(replay.success));
    expect(successAt(events)).not.toBeNull();
    expect(progressLabels(events)).toEqual(["freeze", "freeze"]);
    expect(struggled(events)).toBe(false);
    expectCompleted(events);
  });

  it("fails to a struggle transition while the player keeps moving", () => {
    const events = driveSession(
      { ...challenge, timeBudgetMs: 4_000 },
      synthesizePoseFrames(replay.failure),
    );
    expect(successAt(events)).toBeNull();
    expect(struggled(events)).toBe(true);
    expectCompleted(events);
  });

  it("keeps the hold through a spike shorter than graceMs", () => {
    const events = driveSession(
      { ...challenge, rounds: 1, timeBudgetMs: 4_000 },
      synthesizePoseFrames(replay.boundary),
    );
    const at = successAt(events);
    expect(at).not.toBeNull();
    // A grace failure would restart the 2000ms hold after the 1200ms spike
    // and finish near 3300ms; passing through the spike finishes by ~2300ms.
    expect(at ?? Number.POSITIVE_INFINITY).toBeLessThan(SCENE_START_MS + 2_700);
  });
});

describe("body_zone evaluator", () => {
  const replay = loadReplay("body-zone");
  const challenge = {
    type: "body_zone", part: "head", mode: "enter",
    zones: [
      { id: "left-bubble", box: { x0: 0.05, y0: 0.05, x1: 0.4, y1: 0.5 } },
      { id: "right-bubble", box: { x0: 0.6, y0: 0.05, x1: 0.95, y1: 0.5 } },
    ],
    holdMs: 400, timeBudgetMs: 3_000, ...CHALLENGE_BASE,
  };

  it("completes both zones in order", () => {
    const events = driveSession(challenge, synthesizePoseFrames(replay.success));
    expect(successAt(events)).not.toBeNull();
    expect(progressLabels(events)).toEqual(["zone", "zone"]);
    expectCompleted(events);
  });

  it("times out when the head never enters a zone", () => {
    const events = driveSession(challenge, synthesizePoseFrames(replay.failure));
    expect(successAt(events)).toBeNull();
    expect(struggled(events)).toBe(true);
  });

  it("counts a hold exactly on the zone edge", () => {
    const events = driveSession(challenge, synthesizePoseFrames(replay.boundary));
    expect(successAt(events)).not.toBeNull();
  });
});

describe("squat evaluator", () => {
  const replay = loadReplay("squat");
  const challenge = {
    type: "squat", repetitions: 2, depthRatio: 0.25, kneeAngleMaxDeg: 140,
    holdMs: 0, cooldownMs: 400, timeBudgetMs: 3_200, ...CHALLENGE_BASE,
  };

  it("counts two full-depth repetitions", () => {
    const events = driveSession(challenge, synthesizePoseFrames(replay.success));
    expect(successAt(events)).not.toBeNull();
    expect(progressLabels(events)).toEqual(["squat", "squat"]);
    expectCompleted(events);
  });

  it("never counts shallow dips", () => {
    const events = driveSession(challenge, synthesizePoseFrames(replay.failure));
    expect(progressLabels(events)).toEqual([]);
    expect(successAt(events)).toBeNull();
    expect(struggled(events)).toBe(true);
  });

  it("counts a repetition just past the required depth, exactly once", () => {
    const events = driveSession(
      { ...challenge, repetitions: 1 },
      synthesizePoseFrames(replay.boundary),
    );
    expect(progressLabels(events)).toEqual(["squat"]);
    expect(successAt(events)).not.toBeNull();
  });
});

describe("pose_match evaluator", () => {
  const replay = loadReplay("pose-match");
  const challenge = {
    type: "pose_match",
    poses: [{
      id: "arms-square",
      joints: [
        { joint: "left_elbow", angleDeg: 90, toleranceDeg: 25 },
        { joint: "right_elbow", angleDeg: 90, toleranceDeg: 25 },
      ],
      holdMs: 800,
    }],
    matchRatio: 1, mirrorPolicy: "strict", timeBudgetMs: 2_400, ...CHALLENGE_BASE,
  };

  it("holds the target elbow angles to succeed", () => {
    const events = driveSession(challenge, synthesizePoseFrames(replay.success));
    expect(successAt(events)).not.toBeNull();
    expect(progressLabels(events)).toEqual(["pose"]);
    expectCompleted(events);
  });

  it("times out when arms stay straight", () => {
    const events = driveSession(challenge, synthesizePoseFrames(replay.failure));
    expect(successAt(events)).toBeNull();
    expect(struggled(events)).toBe(true);
  });

  it("accepts the mirrored pose when the pack allows either side", () => {
    const mirroredChallenge = {
      ...challenge,
      poses: [{
        id: "one-arm",
        joints: [{ joint: "left_elbow", angleDeg: 90, toleranceDeg: 25 }],
        holdMs: 800,
      }],
      mirrorPolicy: "either",
    };
    const events = driveSession(mirroredChallenge, synthesizePoseFrames(replay.boundary));
    expect(successAt(events)).not.toBeNull();

    const strictEvents = driveSession(
      { ...mirroredChallenge, mirrorPolicy: "strict" },
      synthesizePoseFrames(replay.boundary),
    );
    expect(successAt(strictEvents)).toBeNull();
  });
});

describe("jump evaluator", () => {
  const replay = loadReplay("jump");
  const challenge = {
    type: "jump", repetitions: 1, minRiseRatio: 0.15,
    landingStableMs: 250, cooldownMs: 400, timeBudgetMs: 2_200, ...CHALLENGE_BASE,
  };

  it("counts a rise-and-stable-landing as one jump", () => {
    const events = driveSession(challenge, synthesizePoseFrames(replay.success));
    expect(successAt(events)).not.toBeNull();
    expect(progressLabels(events)).toEqual(["jump"]);
    expectCompleted(events);
  });

  it("ignores a hop below the required rise", () => {
    const events = driveSession(
      { ...challenge, timeBudgetMs: 2_200 },
      synthesizePoseFrames(replay.failure),
    );
    expect(progressLabels(events)).toEqual([]);
    expect(struggled(events)).toBe(true);
  });

  it("only counts the jump after the landing stays stable", () => {
    const events = driveSession(
      { ...challenge, timeBudgetMs: 2_600 },
      synthesizePoseFrames(replay.boundary),
    );
    const jumpProgress = events.find(({ event }) => event.type === "challenge-progress");
    expect(jumpProgress).toBeDefined();
    // The landing band opens at ~1364ms on the way down; the repetition may
    // only count after the additional 250ms landing-stability window. Without
    // the stability rule it would count before ~1400ms.
    expect(jumpProgress?.at ?? 0).toBeGreaterThanOrEqual(SCENE_START_MS + 1_364 + 250 - 40);
  });
});

describe("velocity_hit evaluator", () => {
  const replay = loadReplay("velocity-hit");
  const challenge = {
    type: "velocity_hit", count: 2, zone: "reachable", targetScale: 1.4,
    limb: "hands", minSpeed: 0.8, direction: "any", timeBudgetMs: 2_000, ...CHALLENGE_BASE,
  };

  it("hits both targets with one fast sweep", () => {
    const events = driveSession(challenge, synthesizePoseFrames(replay.success));
    expect(successAt(events)).not.toBeNull();
    expect(events.filter(({ event }) => event.type === "target-hit")).toHaveLength(2);
    expectCompleted(events);
  });

  it("never hits with a slow sweep through the same path", () => {
    const events = driveSession(challenge, synthesizePoseFrames(replay.failure));
    expect(events.filter(({ event }) => event.type === "target-hit")).toHaveLength(0);
    expect(struggled(events)).toBe(true);
  });

  it("requires the declared strike direction", () => {
    const directional = { ...challenge, count: 1, direction: "left", timeBudgetMs: 2_400 };
    const events = driveSession(directional, synthesizePoseFrames(replay.boundary));
    const hits = events.filter(({ event }) => event.type === "target-hit");
    expect(hits).toHaveLength(1);
    // The rightward sweep crosses the target around 600-1000ms and must not
    // count; the leftward sweep starts at 1400ms.
    expect(hits[0]?.at ?? 0).toBeGreaterThanOrEqual(SCENE_START_MS + 1_400);
  });
});

describe("step evaluator", () => {
  const replay = loadReplay("step");
  const challenge = {
    type: "step", pattern: ["left", "right"], stepRatio: 0.3,
    holdMs: 150, timeBudgetMs: 2_000, ...CHALLENGE_BASE,
  };

  it("follows the left-right pattern", () => {
    const events = driveSession(challenge, synthesizePoseFrames(replay.success));
    expect(successAt(events)).not.toBeNull();
    expect(progressLabels(events)).toEqual(["step", "step"]);
    expectCompleted(events);
  });

  it("ignores shuffles below the step ratio", () => {
    const events = driveSession(challenge, synthesizePoseFrames(replay.failure));
    expect(progressLabels(events)).toEqual([]);
    expect(struggled(events)).toBe(true);
  });

  it("counts a step just past the required travel", () => {
    const events = driveSession(
      { ...challenge, timeBudgetMs: 2_400 },
      synthesizePoseFrames(replay.boundary),
    );
    expect(successAt(events)).not.toBeNull();
  });
});

describe("sequence evaluator", () => {
  const replay = loadReplay("sequence");
  const challenge = {
    type: "sequence",
    steps: [
      { type: "squat", repetitions: 1, depthRatio: 0.25, kneeAngleMaxDeg: 140, holdMs: 0, cooldownMs: 400 },
      { type: "jump", repetitions: 1, minRiseRatio: 0.15, landingStableMs: 250, cooldownMs: 400 },
      { type: "freeze", holdMs: 1_000, motionThreshold: 0.02, graceMs: 200, rounds: 1, minVisibleJoints: 8 },
    ],
    interStepGraceMs: 500,
    timeBudgetMs: 6_000,
    ...CHALLENGE_BASE,
  };

  it("completes squat, then jump, then freeze in order", () => {
    const events = driveSession(challenge, synthesizePoseFrames(replay.success));
    expect(successAt(events)).not.toBeNull();
    expect(progressLabels(events)).toEqual(["squat", "squat", "jump", "jump", "freeze", "freeze"]);
    expectCompleted(events);
  });

  it("stalls at the jump step when the player never jumps", () => {
    const events = driveSession(
      { ...challenge, timeBudgetMs: 4_000 },
      synthesizePoseFrames(replay.failure),
    );
    const labels = progressLabels(events);
    expect(labels).toContain("squat");
    expect(labels).not.toContain("jump");
    expect(struggled(events)).toBe(true);
  });

  it("shields the next step during the inter-step grace window", () => {
    const events = driveSession(challenge, synthesizePoseFrames(replay.boundary));
    expect(successAt(events)).not.toBeNull();
  });
});

describe("multiplayer sessions", () => {
  const stillScript = (dx: number, durationMs: number): MotionScript => ({
    fps: 30,
    durationMs,
    keyframes: [{ atMs: 0, body: { dx } }, { atMs: durationMs, body: { dx } }],
  });
  const wiggleThenStill = (dx: number, wiggleUntilMs: number, durationMs: number): MotionScript => ({
    fps: 30,
    durationMs,
    keyframes: [
      ...Array.from({ length: Math.floor(wiggleUntilMs / 200) + 1 }, (_, index) => ({
        atMs: index * 200,
        body: { dx: dx + (index % 2 === 0 ? 0.03 : -0.03) },
      })),
      { atMs: wiggleUntilMs + 1, body: { dx } },
      { atMs: durationMs, body: { dx } },
    ],
  });
  const freezeChallenge = {
    type: "freeze", holdMs: 1_000, motionThreshold: 0.02, graceMs: 250,
    rounds: 1, minVisibleJoints: 8, timeBudgetMs: 6_000, ...CHALLENGE_BASE,
  };

  it("co-op succeeds only when every present player finishes", () => {
    const frames = synthesizeMultiPoseFrames(
      [stillScript(-0.18, 4_000), wiggleThenStill(0.18, 1_600, 4_000)],
      30,
      4_000,
    );
    const events = driveSession(freezeChallenge, frames, { min: 1, max: 2, mode: "coop" });
    const at = successAt(events);
    expect(at).not.toBeNull();
    // Player 0 finishes near 1000ms; success may only fire once player 1's
    // hold (starting after 1600ms of movement) completes.
    expect(at ?? 0).toBeGreaterThanOrEqual(SCENE_START_MS + 2_400);
    const playerIds = new Set(
      events
        .filter((entry) => entry.event.type === "challenge-progress")
        .map((entry) => (entry.event as { playerId?: number }).playerId),
    );
    expect(playerIds).toEqual(new Set([0, 1]));
    expectCompleted(events);
  });

  it("versus succeeds as soon as the first player finishes", () => {
    const frames = synthesizeMultiPoseFrames(
      [stillScript(-0.18, 4_000), wiggleThenStill(0.18, 2_600, 4_000)],
      30,
      4_000,
    );
    const events = driveSession(freezeChallenge, frames, { min: 1, max: 2, mode: "versus" });
    const at = successAt(events);
    expect(at).not.toBeNull();
    expect(at ?? Number.POSITIVE_INFINITY).toBeLessThan(SCENE_START_MS + 2_000);
  });

  it("keeps a multiplayer pack playable when only one body is tracked", () => {
    const frames = synthesizePoseFrames(stillScript(0, 3_000));
    const events = driveSession(freezeChallenge, frames, { min: 1, max: 2, mode: "coop" });
    expect(successAt(events)).not.toBeNull();
    expectCompleted(events);
  });
});

describe("canonical v2 pack", () => {
  it("reaches the terminal scene through struggle transitions without any pose input", () => {
    const url = new URL("../../schema/fixtures/valid/manse.pack.v2.json", import.meta.url);
    const pack = parseEpisodePack(JSON.parse(readFileSync(url, "utf8")) as unknown);
    const events: RuntimeSessionEvent[] = [];
    const session = new EpisodeSession(pack, {
      locale: "en",
      tier: "S",
      onEvent: (event) => events.push(event),
    });
    session.start(0);
    let now = 0;
    // 500ms virtual ticks; every challenge times out into its struggle path.
    for (let step = 0; step < 1_000 && session.getSnapshot(now).status !== "complete"; step += 1) {
      now += 500;
      session.tick(now);
    }
    expect(session.getSnapshot(now).status).toBe("complete");
    const visited = events
      .filter((event): event is Extract<RuntimeSessionEvent, { type: "scene-changed" }> => event.type === "scene-changed")
      .map((event) => event.sceneId);
    expect(visited).toEqual([
      "intro", "statue", "dodge", "frog", "tree", "hop", "drum", "dance", "finale", "finish",
    ]);
  });
});

describe("player tracker identity", () => {
  it("keeps IDs stable while two players cross paths", () => {
    const scriptA: MotionScript = {
      fps: 30,
      durationMs: 2_000,
      keyframes: [
        { atMs: 0, body: { dx: -0.15 } },
        { atMs: 2_000, body: { dx: 0.15 } },
      ],
    };
    const scriptB: MotionScript = {
      fps: 30,
      durationMs: 2_000,
      keyframes: [
        { atMs: 0, body: { dx: 0.15, dy: 0.03 } },
        { atMs: 2_000, body: { dx: -0.15, dy: 0.03 } },
      ],
    };
    const tracker = new PlayerTracker({ maxPlayers: 2, joinFrames: 1 });
    const trails = new Map<number, number[]>();
    for (const frame of synthesizeMultiPoseFrames([scriptA, scriptB], 30, 2_000)) {
      for (const tracked of tracker.update(frame)) {
        const trail = trails.get(tracked.playerId) ?? [];
        trail.push(tracked.centroid.x);
        trails.set(tracked.playerId, trail);
      }
    }
    expect([...trails.keys()].sort()).toEqual([0, 1]);
    const trailA = trails.get(0) ?? [];
    const trailB = trails.get(1) ?? [];
    // Player 0 started left and must end right; player 1 the opposite. An ID
    // swap at the crossing would break the monotonic trend.
    expect(trailA.at(0) ?? 0).toBeLessThan(0.45);
    expect(trailA.at(-1) ?? 0).toBeGreaterThan(0.55);
    expect(trailB.at(0) ?? 0).toBeGreaterThan(0.55);
    expect(trailB.at(-1) ?? 0).toBeLessThan(0.45);
  });

  it("drops a vanished player after the leave grace and never reuses the ID", () => {
    const tracker = new PlayerTracker({ maxPlayers: 2, joinFrames: 1, leaveGraceMs: 500 });
    const twoPlayers = synthesizeMultiPoseFrames(
      [
        { fps: 30, durationMs: 600, keyframes: [{ atMs: 0, body: { dx: -0.18 } }, { atMs: 600, body: { dx: -0.18 } }] },
        { fps: 30, durationMs: 600, keyframes: [{ atMs: 0, body: { dx: 0.18 } }, { atMs: 600, body: { dx: 0.18 } }] },
      ],
      30,
      600,
    );
    for (const frame of twoPlayers) tracker.update(frame);
    expect(tracker.activePlayerIds(600)).toEqual([0, 1]);

    // Player 1 disappears; after the grace window a newcomer gets a fresh ID.
    const soloFrames = synthesizePoseFrames({
      fps: 30,
      durationMs: 1_400,
      keyframes: [{ atMs: 0, body: { dx: -0.18 } }, { atMs: 1_400, body: { dx: -0.18 } }],
    });
    for (const frame of soloFrames) {
      tracker.update({ ...frame, timestampMs: frame.timestampMs + 633 });
    }
    expect(tracker.activePlayerIds(2_033)).toEqual([0]);

    const rejoin = synthesizeMultiPoseFrames(
      [
        { fps: 30, durationMs: 300, keyframes: [{ atMs: 0, body: { dx: -0.18 } }, { atMs: 300, body: { dx: -0.18 } }] },
        { fps: 30, durationMs: 300, keyframes: [{ atMs: 0, body: { dx: 0.18 } }, { atMs: 300, body: { dx: 0.18 } }] },
      ],
      30,
      300,
    );
    const seen = new Set<number>();
    for (const frame of rejoin) {
      for (const tracked of tracker.update({ ...frame, timestampMs: frame.timestampMs + 2_066 })) {
        seen.add(tracked.playerId);
      }
    }
    expect(seen.has(2)).toBe(true);
    expect(seen.has(1)).toBe(false);
  });
});
