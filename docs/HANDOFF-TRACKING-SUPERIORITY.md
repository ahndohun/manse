# Handoff: Tracking-Performance Work Order

**From:** external advisor (owner-sanctioned) · **To:** Codex build threads · **Date:** 2026-07-21
**Objective:** raise Manse's pose recognition rate and tracking performance toward parity-or-better
vs Nex Playground (18-point tracking, 4 players, "super low-latency" NPU hardware), with
measured evidence for every claim.

Two tracks. **Track A is isolated work (branch/sandbox only, zero judged-app risk) that may
start as soon as fleet capacity is free of submission P0s. Track B starts after the
2026-07-22 09:00 KST submission.** Nothing merges to the judged origin before judging ends
2026-08-05; run `node scripts/verify-public-playground.mjs` after any deploy. Suggested
branch: `tracking/v2`.

## Invariants (violating any = task failure)

1. Camera frames never leave the device; no telemetry (`packages/runtime-web/src/types.ts`
   documents the no-network provider boundary).
2. Runtime assets same-origin + self-hosted (`assertSameOriginRuntimeUrl` in
   `packages/runtime-web/src/config.ts`; CLI `RUNTIME_CDN_BLOCKED`). Vendor new models/WASM
   like the MediaPipe assets (`assets/models/`, `apps/hub/public/vendor/mediapipe/wasm/`).
3. Honesty (D011/D012): no unmeasured performance claim ships anywhere. Refuted-claims list
   at the bottom is citation-banned.
4. New engines are new providers behind the `ScheduledPoseProvider` seam in
   `packages/runtime-web/src/pose-providers.ts`; `session.ts`/`player.ts` must not learn
   which engine runs.

---

## Track A — start when capacity allows (isolated; no judged-app changes)

### T1. Frame-accurate scheduling + latency self-measurement (est. 0.5–1 day)

**Files:** `packages/runtime-web/src/player.ts` (frame loop), `pose-providers.ts`
(`ScheduledPoseProvider` metrics), `apps/hub/app/playground/PlaygroundClient.tsx` (HUD).

- Replace rAF-driven frame grabs with `video.requestVideoFrameCallback(cb)` where
  available (feature-detect; keep rAF fallback — Firefox has a known callback-interval bug).
- From callback metadata, record per frame: `captureTime` (camera capture timestamp,
  Chromium-reliable; fall back to `performance.now()` deltas elsewhere),
  capture→landmarks-ready latency, inference ms, effective Hz, dropped frames.
- Extend the existing provider metrics object with these; surface p50/p95 in the
  playground HUD; add a "copy metrics JSON" button so the owner can export runs.

**Done when:** HUD shows live p50/p95 capture→landmark latency on tier S and B hardware,
and a metrics JSON export exists. This baseline is the yardstick for every task below.

### T2. 1€ filter re-tune for fast child movement (est. 1 day)

Tasks Vision does not expose smoothing knobs, so add our own per-landmark One-Euro stage
at the provider output boundary (applies uniformly to MediaPipe today and any future
provider). Implement in a new `packages/runtime-web/src/smoothing.ts`; wire into
`ScheduledPoseProvider` post-processing behind a config flag.

- Tune `mincutoff`/`beta` against **replay fixtures** (the replay provider gives identical
  input across runs): metric pair = stationary jitter (std of a held landmark) vs step-lag
  (frames until 90% convergence after a step in the fixture).
- Ship two presets per tier: `standard`, `fast-movement` (kids). Default by tier.

**Done when:** before/after jitter+lag table on fixtures is committed to
`docs/BENCHMARK.md`; no regression in `runtime.test.ts` (extend with a smoothing test using
the fake-timing harness).

### T3. Camera constraints against motion blur (est. 0.5 day)

**File:** `player.ts` camera acquisition (`getUserMedia`).

- Request `frameRate: { ideal: 60, min: 30 }`; per-tier resolution (S/A can afford 720p,
  B/C stay lower — inference input is resized anyway; higher capture fps mainly reduces
  blur and rVFC latency).
- After acquisition, attempt `track.applyConstraints({ advanced: [{ exposureMode:
  'continuous' }] })`-style hints where supported (mostly Android Chrome); treat failures
  as silent no-ops; log actual `track.getSettings()` into the T1 metrics JSON.

**Done when:** metrics JSON records actual fps/resolution/exposure settings per run; T1
latency does not regress.

### T4. Move inference off the main thread (est. 1–2 days)

Run the MediaPipe landmarker in a Web Worker (Tasks Vision supports worker usage; pass
frames as `ImageBitmap`/`VideoFrame` transfers). Keeps the render loop unblocked — the
old double-engine scare in Advisory 007 showed how sensitive the page is to main-thread
contention.

**Done when:** main-thread long-task count during play drops vs T1 baseline (record both
in `docs/BENCHMARK.md`); all runtime tests pass; provider lifecycle (pause/resume/destroy,
camera-track shutdown) still verified by the existing camera-lifecycle test.

### T5. In-browser RTMPose/RTMO feasibility spike (est. 3–5 days, time-boxed — THE bet)

No verified in-browser benchmark of these models exists anywhere; this spike creates it.
**Sandbox only** (`spikes/ort-pose/`, its own package.json; not imported by any app).

- Artifacts: RTMPose-s/m and RTMO-s ONNX exports — take prebuilt ONNX from the `rtmlib`
  project or export via mmdeploy from OpenMMLab mmpose releases. Vendor locally (invariant 2
  applies when this graduates; for the spike, local files).
- Runtime: `onnxruntime-web` — WebGPU EP primary, WASM (SIMD+threads) fallback. Re-check
  MediaPipe WebGPU status first (github.com/google-ai-edge/mediapipe issue #5826 was still
  open Feb 2026; maintainer hinted at announcements — if MediaPipe shipped WebGPU, add it
  to the comparison).
- Measure ms/frame + effective Hz at 256×192 (RTMPose default input) on: owner's MacBook
  (tier S), one mid Android phone (tier B). For RTMPose include the person-detector cost
  (a tiny SSD/YOLO or reuse MediaPipe's detector stage); RTMO is single-stage.
- Compare against MediaPipe full/lite numbers from T1 on the same devices.

**Done when:** a measured table (model × device × EP → ms/frame, Hz) lands in
`DECISIONS.md` as a go/no-go: **adopt per-tier / reject**. Rejection threshold: if
WebGPU-capable tier-S hardware cannot hold ≥25 Hz end-to-end, stop at Track A and record
why. Known reference points (native only, NOT browser targets): RTMPose-m 90+ FPS on
i7-11700 CPU; RTMPose-s 9–14 ms on Snapdragon 865; RTMO-m ~80 ms/frame on server CPU —
so WASM fallback will NOT reach real-time multi-person; WebGPU is mandatory there.

### T6. Benchmark protocol doc + first public numbers (est. 1 day, parallel anytime)

Create `docs/BENCHMARK.md`: (a) in-page metric definitions from T1; (b) the commodity
motion-to-photon protocol — LED-instrumented input + 240 fps smartphone slo-mo + on-screen
color flash, ±4.2 ms single-measurement uncertainty (Warburton et al. 2022 method), trial
count and reporting format; (c) baseline results for the current stack. Strategic context:
**no public quantified benchmark of Nex Playground exists** ("super low-latency" is
marketing; their support site has a "movements lagging" article). Publishing a reproducible
harness + our numbers makes Manse the only product in the category with public figures.
Reference beatable baseline: VR headsets measure 21–42 ms motion-to-photon at movement
onset, 2–13 ms mid-motion.

**Done when:** the doc + baseline numbers are committed and linked from README's tech
section (README wording change itself is Track B if it touches the judged origin).

---

## Track B — post-submission only

### T7. Production `OrtPoseProvider` + keypoint adapter (1–2 weeks; requires T5 = adopt)

New provider class behind `ScheduledPoseProvider`; models vendored same-origin with
SHA-256 recorded in the generator (`plugins/manse-creator/scripts/create-game.mjs`
already hashes MediaPipe assets — same pattern). Tier wiring in `config.ts`: e.g. S/A →
RTMPose WebGPU; B/C → MediaPipe WASM unchanged.

The engine speaks MediaPipe's 33-landmark contract (`normalizePose`; touch detection reads
wrist/ankle indices) — adapt COCO-17 output into it; do NOT change the engine contract:

| COCO idx → MP idx | COCO idx → MP idx |
|---|---|
| 0 nose → 0 | 9 l_wrist → 15 |
| 1 l_eye → 2 | 10 r_wrist → 16 |
| 2 r_eye → 5 | 11 l_hip → 23 |
| 3 l_ear → 7 | 12 r_hip → 24 |
| 4 r_ear → 8 | 13 l_knee → 25 |
| 5 l_shoulder → 11 | 14 r_knee → 26 |
| 6 r_shoulder → 12 | 15 l_ankle → 27 |
| 7 l_elbow → 13 | 16 r_ankle → 28 |
| 8 r_elbow → 14 | — |

Unmapped MP slots (eye inner/outer, mouth, fingers, heel, foot_index) fill with
visibility/presence 0 — verify the touch detector's limb sets (`hands`/`feet`/`any`) only
read mapped indices; if `feet` uses foot_index anywhere, switch it to ankle or synthesize
from ankle.

**Done when:** replay-fixture A/B (MediaPipe vs ORT provider, identical input) shows
accuracy/latency improvement on S/A tiers in `docs/BENCHMARK.md`; all runtime tests pass
with both providers (extend camera-lifecycle + teardown tests to the new provider);
`verify-public-playground.mjs` passes on a preview deploy.

### T8. Multi-player 2–4 via RTMO (weeks; requires T7)

WebGPU tiers only — WASM tiers stay single-player and the UI must say so (D011 honesty).
RTMO's latency is person-count-independent (+~0.1 ms per added person, GPU). Identity
persistence across frames is unsolved in the literature we verified: start with
nearest-neighbor track association + hysteresis; record two-player replay fixtures; metric
= ID-swap rate per minute.

**Done when:** a 2-player episode completes on tier-S with measured ID-swap rate published;
graceful single-player fallback elsewhere.

### T9. Predictive extrapolation (optional; weeks)

Kalman/1€-predictive layer on landmark streams to hide latency mid-motion. Physics limits
(VR-measured): prediction needs 25–58 ms warmup after movement onset and degrades on abrupt
direction changes — exactly children's movement. Never claim "zero latency."

**Done when:** measured mid-motion latency reduction on replay fixtures without onset
overshoot artifacts.

### T10. Child-accuracy research track (months; no ship commitment)

Adult-trained models measurably degrade on children (RTMPose-m 58.7 AP on a real-child test
vs 71.2 child-fine-tuned — single-author preprint, qualitative gap independently
corroborated). **No verified privacy-preserving fix exists** (the AIGC-synthetic-only route
was refuted 0-3), and our no-upload invariant forbids collecting gameplay footage. Explore:
licensed child datasets for offline eval only; on-device calibration that never persists
frames; largest model per tier (small models lose disproportionately under motion blur —
PoseBench). Nothing here ships without its own eval evidence; never market
"child-optimized."

---

## Citation-banned (refuted 0-3 in verification — do not use in code comments, docs, or copy)

- "ONNX Runtime Web WebGPU gives 19x/3.8x speedups" — measure our own (T5).
- "Synthetic child images alone close the child gap."
- Infant-pose (SyRIP/FiDIP) numbers as evidence about children.

## Claim policy (short form)

Allowed now: 33 landmarks vs 18 points; verifiable open-source privacy. After T6: measured
latency numbers. After T5/T7 gates: accuracy-superiority language, always with the harness
linked. Never: unmeasured superiority, "zero latency," child-optimized.

## Key sources (full verified report: advisor deep-research run wf_0e492a06-77f)

RTMPose arxiv.org/html/2303.07399v2 · RTMO arxiv.org/pdf/2312.07526 (CVPR 2024) ·
MTP measurement Warburton et al., Behav Res Methods 2022
(link.springer.com/article/10.3758/s13428-022-01983-5) · rVFC
web.dev/articles/requestvideoframecallback-rvfc · 1€ github.com/casiez/OneEuroFilter ·
PoseBench arxiv.org/pdf/2406.14367 · child gap arxiv.org/html/2603.02598 · MediaPipe WebGPU
status github.com/google-ai-edge/mediapipe/issues/5826
