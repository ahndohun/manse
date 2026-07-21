// Hero-dedicated tracking puppet — React shell around pose-puppet.ts.
//
// The figure is a purpose-built parametric puppet whose shape cannot break:
// fixed bone lengths (tracking supplies joint angles only), clamped joint
// ranges, upper body only, unseen limbs faded instead of guessed, and a stage
// strip the figure can never leave. Camera frames never leave the browser;
// the camera starts only on click. See DECISIONS.md D013.
import { useEffect, useRef, useState } from "react";
import {
  blendWithIdle,
  createLiveState,
  drawField,
  idlePuppet,
  measureFrame,
  planFromPuppet,
  stageMetrics,
  type Landmark,
  type LiveState,
} from "./pose-puppet";

type Mode = "idle" | "starting" | "live" | "error";

export default function PoseStage() {
  const [mode, setMode] = useState<Mode>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modeRef = useRef<Mode>("idle");
  modeRef.current = mode;
  const landmarkerRef = useRef<{
    detectForVideo: (v: HTMLVideoElement, t: number) => { landmarks: Landmark[][] };
  } | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const liveRef = useRef<LiveState | null>(null);
  if (!liveRef.current) liveRef.current = createLiveState();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Start the greeter's clock at this visit, not at the browser process's
    // performance epoch. Every arrival therefore opens on a calm breathing
    // pose before the first deliberate wave.
    const startedAt = performance.now();
    const heroCopy = canvas.parentElement?.querySelector<HTMLElement>(".hero-stack") ?? null;
    let raf = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const nowS = now / 1000;
      const t = reduceMotion ? 3 : (now - startedAt) / 1000;

      // The safe line follows the ACTUAL rendered copy, including wrapping at
      // narrow widths. A fully raised live arm therefore cannot enter the
      // headline, description, or CTA area on any viewport.
      const copyRect = heroCopy?.getBoundingClientRect();
      const safeTop = copyRect ? Math.max(0, copyRect.bottom - rect.top + 30) : undefined;
      const stage = stageMetrics(w, h, safeTop);
      const L = liveRef.current!;
      const idle = idlePuppet(t, stage.idleT);
      let measured = null;

      if (modeRef.current === "live" && landmarkerRef.current && videoRef.current) {
        const video = videoRef.current;
        if (video.readyState >= 2 && video.videoWidth > 0) {
          try {
            const result = landmarkerRef.current.detectForVideo(video, now);
            const lms = result.landmarks?.[0];
            if (lms) {
              const va = video.videoWidth / Math.max(1, video.videoHeight);
              measured = measureFrame(L, lms, { nowS, va, stage, w });
            }
          } catch {
            // A transient inference failure is a dropped frame, never a dead
            // animation loop. The puppet freezes briefly, then returns idle.
            measured = null;
          }
        }
      }

      const puppet = blendWithIdle(L, idle, measured, nowS);
      drawField(ctx, planFromPuppet(puppet, stage.anchorX, stage.neckY), w, h);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startTracking = async () => {
    setMode("starting");
    setErrorMsg("");
    try {
      if (!landmarkerRef.current) {
        const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks("/vendor/mediapipe/wasm");
        landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: "/models/pose_landmarker_lite.task", delegate: "GPU" },
          runningMode: "VIDEO",
          numPoses: 1,
        }).catch(async () =>
          PoseLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: "/models/pose_landmarker_lite.task", delegate: "CPU" },
            runningMode: "VIDEO",
            numPoses: 1,
          }),
        );
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      // A fresh camera session never inherits stale filters or limb angles
      // from a previous session.
      liveRef.current = createLiveState();
      setMode("live");
    } catch {
      setErrorMsg("Camera unavailable. The greeter keeps waving.");
      setMode("error");
    }
  };

  const stopTracking = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setMode("idle");
  };

  const live = mode === "live";

  return (
    <>
      <canvas ref={canvasRef} className="pose-field" aria-hidden="true"></canvas>
      <video ref={videoRef} className="pose-video" playsInline muted></video>
      <div className="pose-controls">
        {live ? (
          <button type="button" className="button button-ghost" onClick={stopTracking}>
            Stop camera
          </button>
        ) : (
          <button
            type="button"
            className="button button-ghost"
            onClick={startTracking}
            disabled={mode === "starting"}
          >
            <span className={`pose-dot ${mode === "starting" ? "pose-dot-wait" : ""}`} aria-hidden="true"></span>
            {mode === "starting" ? "Starting camera..." : "Start motion tracking"}
          </button>
        )}
        <p className="pose-caption">
          {mode === "error"
            ? errorMsg
            : live
              ? "Mirroring you, on this device only. Nothing is uploaded."
              : "It mirrors you next. Camera frames never leave this browser."}
        </p>
      </div>
    </>
  );
}
