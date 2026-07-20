"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createMansePlayer,
  type MansePlayer,
  type PlayerSnapshot,
  type ProviderKind,
} from "@manse/runtime-web";

const PLAYGROUND_PACK = {
  schemaVersion: 1,
  meta: {
    id: "manse.engine-playground",
    title: [{ locale: "en", text: "Manse Engine Playground" }],
    summary: [{ locale: "en", text: "A content-neutral touch-target runtime check." }],
    theme: "Neutral runtime diagnostics",
    locales: ["en"],
    ageBands: ["8+"],
    estMinutes: 1,
    engine: { minimumVersion: "0.1.0", maximumVersion: null },
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
      narration: { items: [{ locale: "en", text: "Move your pointer or hand to the targets.", audioAssetId: null }], captionDefaultOn: true },
      demo: null,
      challenge: null,
      learning: null,
      artAssetId: null,
      energy: "calm",
      terminal: false,
      transitions: [{ on: "always", to: "touch-check", adapt: null }],
    },
    {
      id: "touch-check",
      kind: "challenge",
      narration: { items: [{ locale: "en", text: "Touch all three targets.", audioAssetId: null }], captionDefaultOn: true },
      demo: null,
      challenge: {
        type: "touch_targets",
        count: 3,
        zone: "reachable",
        targetScale: 1.2,
        dwellMs: 120,
        limb: "hands",
        timeBudgetMs: 90_000,
        successAudioId: "success-tone",
        encourageAudioId: "encourage-tone",
      },
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
} as const;

const EMPTY_SNAPSHOT: Pick<PlayerSnapshot, "phase" | "provider" | "tier" | "renderer" | "cameraActive" | "targetProgress" | "caption"> = {
  phase: "idle",
  provider: "simulated",
  tier: "A",
  renderer: null,
  cameraActive: false,
  targetProgress: null,
  caption: null,
};

export function PlaygroundClient() {
  const stageRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<MansePlayer | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const bootIdRef = useRef(0);
  const [snapshot, setSnapshot] = useState(EMPTY_SNAPSHOT);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  const boot = useCallback(async (provider: ProviderKind) => {
    const container = stageRef.current;
    if (container === null) return;
    const bootId = ++bootIdRef.current;
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    await playerRef.current?.destroy();
    if (bootId !== bootIdRef.current) return;
    const player = createMansePlayer({
      container,
      provider,
      tier: "A",
      captions: true,
      reducedStimulation: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      onEvent: (event) => {
        if (bootId === bootIdRef.current && event.type === "error") setError(event.error.message);
      },
    });
    playerRef.current = player;
    unsubscribeRef.current = player.subscribe((next) => {
      if (bootId === bootIdRef.current) setSnapshot(next);
    });
    try {
      await player.load({ pack: PLAYGROUND_PACK });
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
    void boot("simulated");
    return () => {
      bootIdRef.current += 1;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      void playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [boot]);

  const restart = (provider: ProviderKind) => {
    setBusy(true);
    setError(null);
    void boot(provider);
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
  const status = error !== null
    ? "Needs attention"
    : busy
      ? "Starting engine"
      : snapshot.phase === "complete"
        ? "Check complete"
        : snapshot.phase === "celebrating"
          ? "Targets cleared"
          : snapshot.provider === "simulated"
            ? "Simulator live"
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
            <strong>{progress === null ? "—" : `${progress.completed} / ${progress.total}`}</strong>
          </div>
        </div>

        <aside className="playground-panel">
          <p className="eyebrow">Judge path</p>
          <h2>Point. Touch. Done.</h2>
          <p>Simulator mode is intentionally first: no permission prompt, account, API key, installation, or rebuild.</p>
          <ol className="playground-instructions">
            <li><span>1</span><p>Wait for the three targets to appear.</p></li>
            <li><span>2</span><p>Move your mouse or finger onto each target.</p></li>
            <li><span>3</span><p>Hold briefly to complete the runtime check.</p></li>
          </ol>
          {error !== null && <div className="playground-error" role="alert"><strong>Engine message</strong><p>{error}</p></div>}
          <div className="playground-actions">
            <button className="button button-coral button-full" type="button" onClick={() => restart("simulated")} disabled={busy}>
              Restart simulator
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
