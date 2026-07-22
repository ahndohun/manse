"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createMansePlayer,
  synthesizePoseFrames,
  type ChallengeGuide,
  type MansePlayer,
  type MotionScript,
  type PlayerSnapshot,
  type ProviderKind,
} from "@manse/runtime-web";

type MechanicKey =
  | "touch_targets" | "freeze" | "body_zone" | "squat" | "pose_match"
  | "jump" | "velocity_hit" | "step" | "sequence";

interface MechanicPreset {
  readonly label: string;
  readonly caption: string;
  readonly challenge: Record<string, unknown>;
  /** Pointer simulator moves the right wrist only; other mechanics replay. */
  readonly pointerDrivable: boolean;
  readonly replay: MotionScript;
}

const CHALLENGE_AUDIO = { successAudioId: "success-tone", encourageAudioId: "encourage-tone" };

const SQUAT_BOTTOM = {
  left_hip: { dy: 0.1 }, right_hip: { dy: 0.1 },
  left_shoulder: { dy: 0.1 }, right_shoulder: { dy: 0.1 }, nose: { dy: 0.1 },
  left_knee: { dx: 0.06, dy: 0.02 }, right_knee: { dx: -0.06, dy: 0.02 },
};

const MECHANICS: Readonly<Record<MechanicKey, MechanicPreset>> = {
  touch_targets: {
    label: "Touch",
    caption: "Touch all three targets.",
    pointerDrivable: true,
    challenge: {
      type: "touch_targets", count: 3, zone: "reachable", targetScale: 1.2,
      dwellMs: 120, limb: "hands", timeBudgetMs: 90_000, ...CHALLENGE_AUDIO,
    },
    replay: {
      fps: 30, durationMs: 6_000,
      keyframes: [
        { atMs: 0 },
        { atMs: 1_000, joints: { right_wrist: { dx: -0.28, dy: -0.14 } } },
        { atMs: 2_000, joints: { right_wrist: { dx: -0.28, dy: -0.14 } } },
        { atMs: 3_000, joints: { right_wrist: { dx: -0.17, dy: -0.02 } } },
        { atMs: 4_000, joints: { right_wrist: { dx: -0.17, dy: -0.02 } } },
        { atMs: 5_000, joints: { right_wrist: { dx: 0.05, dy: -0.14 } } },
        { atMs: 6_000, joints: { right_wrist: { dx: 0.05, dy: -0.14 } } },
      ],
    },
  },
  freeze: {
    label: "Freeze",
    caption: "Hold still like a statue, twice.",
    pointerDrivable: true,
    challenge: {
      type: "freeze", holdMs: 2_000, motionThreshold: 0.04, graceMs: 400,
      rounds: 2, minVisibleJoints: 8, timeBudgetMs: 90_000, ...CHALLENGE_AUDIO,
    },
    replay: {
      fps: 30, durationMs: 6_500,
      keyframes: [
        { atMs: 0 }, { atMs: 2_300 },
        { atMs: 2_500, body: { dx: 0.05 } }, { atMs: 2_700, body: { dx: -0.05 } },
        { atMs: 2_900 }, { atMs: 6_500 },
      ],
    },
  },
  body_zone: {
    label: "Zones",
    caption: "Move a hand into each glowing bubble.",
    pointerDrivable: true,
    challenge: {
      type: "body_zone", part: "hands", mode: "enter",
      zones: [
        { id: "left-bubble", box: { x0: 0.06, y0: 0.15, x1: 0.38, y1: 0.6 } },
        { id: "right-bubble", box: { x0: 0.62, y0: 0.15, x1: 0.94, y1: 0.6 } },
      ],
      holdMs: 400, timeBudgetMs: 90_000, ...CHALLENGE_AUDIO,
    },
    replay: {
      fps: 30, durationMs: 5_000,
      keyframes: [
        { atMs: 0 },
        { atMs: 900, joints: { right_wrist: { dx: -0.45, dy: -0.2 } } },
        { atMs: 2_000, joints: { right_wrist: { dx: -0.45, dy: -0.2 } } },
        { atMs: 3_000, joints: { right_wrist: { dx: 0.1, dy: -0.2 } } },
        { atMs: 5_000, joints: { right_wrist: { dx: 0.1, dy: -0.2 } } },
      ],
    },
  },
  squat: {
    label: "Squat",
    caption: "Two gentle squats. The replay demo shows the detector.",
    pointerDrivable: false,
    challenge: {
      type: "squat", repetitions: 2, depthRatio: 0.2, kneeAngleMaxDeg: 140,
      holdMs: 0, cooldownMs: 700, timeBudgetMs: 90_000, ...CHALLENGE_AUDIO,
    },
    replay: {
      fps: 30, durationMs: 4_200,
      keyframes: [
        { atMs: 0 }, { atMs: 800 },
        { atMs: 1_200, joints: SQUAT_BOTTOM }, { atMs: 1_600 },
        { atMs: 2_600, joints: SQUAT_BOTTOM }, { atMs: 3_000 }, { atMs: 4_200 },
      ],
    },
  },
  pose_match: {
    label: "Pose",
    caption: "Copy the ghost pose and hold it.",
    pointerDrivable: true,
    challenge: {
      type: "pose_match",
      poses: [{
        id: "goal-arms",
        joints: [
          { joint: "left_elbow", angleDeg: 90, toleranceDeg: 30 },
          { joint: "right_elbow", angleDeg: 90, toleranceDeg: 30 },
        ],
        holdMs: 1_200,
      }],
      matchRatio: 1, mirrorPolicy: "either", timeBudgetMs: 90_000, ...CHALLENGE_AUDIO,
    },
    replay: {
      fps: 30, durationMs: 4_000,
      keyframes: [
        { atMs: 0 }, { atMs: 600 },
        { atMs: 1_000, joints: { left_wrist: { dx: 0.15, dy: -0.08 }, right_wrist: { dx: -0.15, dy: -0.08 } } },
        { atMs: 4_000, joints: { left_wrist: { dx: 0.15, dy: -0.08 }, right_wrist: { dx: -0.15, dy: -0.08 } } },
      ],
    },
  },
  jump: {
    label: "Jump",
    caption: "One jump with a soft landing. The replay demo shows the detector.",
    pointerDrivable: false,
    challenge: {
      type: "jump", repetitions: 1, minRiseRatio: 0.12, landingStableMs: 300,
      cooldownMs: 800, timeBudgetMs: 90_000, ...CHALLENGE_AUDIO,
    },
    replay: {
      fps: 30, durationMs: 3_200,
      keyframes: [
        { atMs: 0 }, { atMs: 900 },
        { atMs: 1_050, body: { dy: -0.08 } }, { atMs: 1_250, body: { dy: -0.08 } },
        { atMs: 1_400 }, { atMs: 3_200 },
      ],
    },
  },
  velocity_hit: {
    label: "Strike",
    caption: "Hit the drums with a quick hand.",
    pointerDrivable: true,
    challenge: {
      type: "velocity_hit", count: 2, zone: "reachable", targetScale: 1.4,
      limb: "hands", minSpeed: 0.7, direction: "any", timeBudgetMs: 90_000, ...CHALLENGE_AUDIO,
    },
    replay: {
      fps: 30, durationMs: 3_000,
      keyframes: [
        { atMs: 0 },
        { atMs: 900, joints: { right_wrist: { dx: 0.05, dy: -0.02 } } },
        { atMs: 1_300, joints: { right_wrist: { dx: -0.45, dy: -0.02 } } },
        { atMs: 3_000, joints: { right_wrist: { dx: -0.45, dy: -0.02 } } },
      ],
    },
  },
  step: {
    label: "Step",
    caption: "Step left, then right. The replay demo shows the detector.",
    pointerDrivable: false,
    challenge: {
      type: "step", pattern: ["left", "right"], stepRatio: 0.25,
      holdMs: 200, timeBudgetMs: 90_000, ...CHALLENGE_AUDIO,
    },
    replay: {
      fps: 30, durationMs: 3_400,
      keyframes: [
        { atMs: 0 }, { atMs: 500 },
        { atMs: 900, joints: { left_ankle: { dx: -0.12 } } },
        { atMs: 1_400, joints: { left_ankle: { dx: -0.12 } } },
        { atMs: 1_900, joints: { left_ankle: { dx: -0.12 }, right_ankle: { dx: 0.12 } } },
        { atMs: 3_400, joints: { left_ankle: { dx: -0.12 }, right_ankle: { dx: 0.12 } } },
      ],
    },
  },
  sequence: {
    label: "Combo",
    caption: "Squat, jump, then freeze. The replay demo shows the chain.",
    pointerDrivable: false,
    challenge: {
      type: "sequence",
      steps: [
        { type: "squat", repetitions: 1, depthRatio: 0.2, kneeAngleMaxDeg: 140, holdMs: 0, cooldownMs: 700 },
        { type: "jump", repetitions: 1, minRiseRatio: 0.12, landingStableMs: 300, cooldownMs: 800 },
        { type: "freeze", holdMs: 1_500, motionThreshold: 0.04, graceMs: 400, rounds: 1, minVisibleJoints: 8 },
      ],
      interStepGraceMs: 1_500,
      timeBudgetMs: 90_000,
      ...CHALLENGE_AUDIO,
    },
    replay: {
      fps: 30, durationMs: 7_500,
      keyframes: [
        { atMs: 0 }, { atMs: 800 },
        { atMs: 1_200, joints: SQUAT_BOTTOM }, { atMs: 1_600 },
        { atMs: 2_900 },
        { atMs: 3_050, body: { dy: -0.08 } }, { atMs: 3_250, body: { dy: -0.08 } },
        { atMs: 3_400 }, { atMs: 7_500 },
      ],
    },
  },
};

function buildPlaygroundPack(mechanic: MechanicKey) {
  const preset = MECHANICS[mechanic];
  const isTouch = mechanic === "touch_targets";
  return {
    schemaVersion: isTouch ? 1 : 2,
    meta: {
      id: "manse.engine-playground",
      title: [{ locale: "en", text: "Manse Engine Playground" }],
      summary: [{ locale: "en", text: "A content-neutral runtime check for every motion primitive." }],
      theme: "Neutral runtime diagnostics",
      locales: ["en"],
      ageBands: ["8+"],
      estMinutes: 1,
      engine: { minimumVersion: isTouch ? "0.1.0" : "0.2.0", maximumVersion: null },
      compiler: null,
    },
    permissions: { camera: true, deviceLocalStorage: false },
    cast: [{
      id: "runtime-guide",
      name: [{ locale: "en", text: "Runtime Guide" }],
      artAssetId: null,
      description: "A neutral system guide rendered without a character asset.",
    }],
    entrySceneId: "ready",
    scenes: [
      {
        id: "ready",
        kind: "story",
        narration: { items: [{ locale: "en", text: "Move your pointer or body to play.", audioAssetId: null }], captionDefaultOn: true },
        demo: null,
        challenge: null,
        learning: null,
        artAssetId: null,
        energy: "calm",
        terminal: false,
        transitions: [{ on: "always", to: "check", adapt: null }],
      },
      {
        id: "check",
        kind: "challenge",
        narration: { items: [{ locale: "en", text: preset.caption, audioAssetId: null }], captionDefaultOn: true },
        demo: null,
        challenge: preset.challenge,
        learning: { kind: "none", payload: [] },
        artAssetId: null,
        energy: "medium",
        terminal: false,
        transitions: [
          { on: "success", to: "complete", adapt: null },
          { on: "struggle", to: "complete", adapt: null },
        ],
      },
      {
        id: "complete",
        kind: "celebration",
        narration: { items: [{ locale: "en", text: "Runtime check complete.", audioAssetId: null }], captionDefaultOn: true },
        demo: null,
        challenge: null,
        learning: null,
        artAssetId: null,
        energy: "calm",
        terminal: true,
        transitions: [],
      },
    ],
    adaptPolicy: { targetSuccessBand: [0.65, 0.85], maxStruggleStreak: 2, maxHighEnergyMs: 60_000 },
    assets: {
      images: [],
      audio: [
        {
          id: "success-tone",
          path: "playground/success.wav",
          mediaType: "audio/wav",
          locale: null,
          transcript: "",
          license: { spdxId: "MIT", name: "MIT License", url: null, attribution: null },
          provenance: { kind: "original", creator: "Manse contributors", createdAt: "2026-07-21T00:00:00.000Z" },
        },
        {
          id: "encourage-tone",
          path: "playground/encourage.wav",
          mediaType: "audio/wav",
          locale: null,
          transcript: "",
          license: { spdxId: "MIT", name: "MIT License", url: null, attribution: null },
          provenance: { kind: "original", creator: "Manse contributors", createdAt: "2026-07-21T00:00:00.000Z" },
        },
      ],
      music: [],
    },
  };
}

const EMPTY_SNAPSHOT: Pick<PlayerSnapshot, "phase" | "provider" | "tier" | "renderer" | "cameraActive" | "targetProgress" | "caption" | "challenge"> = {
  phase: "idle",
  provider: "simulated",
  tier: "A",
  renderer: null,
  cameraActive: false,
  targetProgress: null,
  caption: null,
  challenge: null,
};

function describeGuide(guide: ChallengeGuide | null): ReadonlyArray<readonly [string, string]> {
  if (guide === null) return [];
  const rows: Array<readonly [string, string]> = [
    ["mechanic", guide.kind.replace("_", " ")],
    ["phase", guide.phase],
    ["progress", `${guide.completedUnits}/${guide.totalUnits} (${Math.round(guide.progress * 100)}%)`],
    ["hold", `${Math.round(guide.holdProgress * 100)}%`],
    ["confidence", `${Math.round(guide.confidence * 100)}%`],
  ];
  if (guide.repetitionCount !== null) rows.push(["repetitions", String(guide.repetitionCount)]);
  if (guide.stepLabel !== null) rows.push(["step", guide.stepLabel]);
  if (guide.arrow !== null) rows.push(["cue", guide.arrow]);
  if (guide.framing !== null) rows.push(["framing", guide.framing]);
  return rows;
}

export function PlaygroundClient() {
  const stageRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<MansePlayer | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const bootIdRef = useRef(0);
  const [snapshot, setSnapshot] = useState(EMPTY_SNAPSHOT);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [mechanic, setMechanic] = useState<MechanicKey>("touch_targets");

  const boot = useCallback(async (provider: ProviderKind, nextMechanic: MechanicKey) => {
    const container = stageRef.current;
    if (container === null) return;
    const bootId = ++bootIdRef.current;
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    await playerRef.current?.destroy();
    if (bootId !== bootIdRef.current) return;
    const preset = MECHANICS[nextMechanic];
    const player = createMansePlayer({
      container,
      provider,
      tier: "A",
      captions: true,
      reducedStimulation: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ...(provider === "replay" ? { replayFrames: synthesizePoseFrames(preset.replay) } : {}),
      onEvent: (event) => {
        if (bootId === bootIdRef.current && event.type === "error") setError(event.error.message);
      },
    });
    playerRef.current = player;
    unsubscribeRef.current = player.subscribe((next) => {
      if (bootId === bootIdRef.current) setSnapshot(next);
    });
    try {
      await player.load({ pack: buildPlaygroundPack(nextMechanic) });
      await player.setup();
      await player.play();
    } catch (cause) {
      if (bootId === bootIdRef.current) {
        setError(cause instanceof Error ? cause.message : "The engine could not start.");
      }
    } finally {
      if (bootId === bootIdRef.current) setBusy(false);
    }
  }, []);

  useEffect(() => {
    void boot("simulated", "touch_targets");
    return () => {
      bootIdRef.current += 1;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      void playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [boot]);

  const restart = (provider: ProviderKind, nextMechanic: MechanicKey = mechanic) => {
    setBusy(true);
    setError(null);
    setMechanic(nextMechanic);
    void boot(provider, nextMechanic);
  };

  const selectMechanic = (nextMechanic: MechanicKey) => {
    if (nextMechanic === mechanic && !busy) return;
    // Pointer-drivable mechanics start in the simulator; body mechanics start
    // in deterministic replay so the detector is visible without a camera.
    restart(MECHANICS[nextMechanic].pointerDrivable ? "simulated" : "replay", nextMechanic);
  };

  const movePointer = (clientX: number, clientY: number) => {
    if (busy || snapshot.provider !== "simulated") return;
    const bounds = stageRef.current?.getBoundingClientRect();
    if (bounds === undefined || bounds.width === 0 || bounds.height === 0) return;
    try {
      playerRef.current?.setPointer(
        (clientX - bounds.left) / bounds.width,
        (clientY - bounds.top) / bounds.height,
      );
    } catch {
      // Pointer input can arrive during a mode switch before the provider is ready.
    }
  };

  const progress = snapshot.targetProgress;
  const guideRows = describeGuide(snapshot.challenge ?? null);
  const status = error !== null
    ? "Needs attention"
    : busy
      ? "Starting engine"
      : snapshot.phase === "complete"
        ? "Check complete"
        : snapshot.phase === "celebrating"
          ? "Cleared"
          : snapshot.provider === "simulated"
            ? "Simulator live"
            : snapshot.provider === "replay"
              ? "Replay demo"
              : "Camera stays on device";

  return (
    <section className="playground-section">
      <div className="shell playground-layout">
        <div className="playground-console">
          <div className="playground-console-bar">
            <span><i className={error === null ? "status-dot" : "status-dot status-dot-error"} aria-hidden="true" /> {status}</span>
            <span>{snapshot.renderer ?? "detecting renderer"} · tier {snapshot.tier}</span>
          </div>
          <div
            role="tablist"
            aria-label="Motion mechanic"
            style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "10px 12px" }}
          >
            {(Object.keys(MECHANICS) as MechanicKey[]).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mechanic === key}
                className={mechanic === key ? "button button-coral" : "button button-ghost"}
                style={{ padding: "6px 12px", fontSize: "0.82rem" }}
                onClick={() => selectMechanic(key)}
                disabled={busy}
              >
                {MECHANICS[key].label}
              </button>
            ))}
          </div>
          <div
            className="playground-stage"
            ref={stageRef}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              movePointer(event.clientX, event.clientY);
            }}
            onPointerMove={(event) => movePointer(event.clientX, event.clientY)}
            aria-label="Interactive Manse engine playground"
          />
          <div className="playground-progress" aria-live="polite">
            <span>{snapshot.caption ?? "Loading the declarative pack…"}</span>
            <strong>{progress === null ? "-" : `${progress.completed} / ${progress.total}`}</strong>
          </div>
          {guideRows.length > 0 && (
            <dl
              aria-label="Evaluator diagnostics"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                gap: "4px 14px",
                margin: 0,
                padding: "8px 14px 14px",
                fontSize: "0.78rem",
                opacity: 0.85,
              }}
            >
              {guideRows.map(([term, value]) => (
                <div key={term} style={{ display: "flex", gap: "6px" }}>
                  <dt style={{ fontWeight: 700 }}>{term}</dt>
                  <dd style={{ margin: 0 }}>{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <aside className="playground-panel">
          <p className="eyebrow">Judge path</p>
          <h2>Nine mechanics. One engine.</h2>
          <p>Simulator mode is intentionally first: no permission prompt, account, API key, installation, or rebuild. Body mechanics run a deterministic replay so every detector is inspectable without a camera.</p>
          <ol className="playground-instructions">
            <li><span>1</span><p>Pick a mechanic above the stage.</p></li>
            <li><span>2</span><p>Drive it with your pointer, or watch the replay demo.</p></li>
            <li><span>3</span><p>Read the live evaluator diagnostics under the stage.</p></li>
          </ol>
          {error !== null && <div className="playground-error" role="alert"><strong>Engine message</strong><p>{error}</p></div>}
          <div className="playground-actions">
            <button className="button button-coral button-full" type="button" onClick={() => restart(MECHANICS[mechanic].pointerDrivable ? "simulated" : "replay")} disabled={busy}>
              Restart {MECHANICS[mechanic].pointerDrivable ? "simulator" : "replay demo"}
            </button>
            <button className="button button-ghost button-full" type="button" onClick={() => restart("mediapipe")} disabled={busy}>
              Use my camera
            </button>
          </div>
          <p className="playground-privacy">Camera frames are processed in this browser. Manse has no upload or analytics endpoint.</p>
        </aside>
      </div>
    </section>
  );
}
