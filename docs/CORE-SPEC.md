# Manse — Core Build Spec (feed to Codex AFTER the kickoff prompt)

> **Historical game-first implementation draft.** It remains as design input
> for the reference game and engine, but `PLATFORM-SPEC.md` is now authoritative
> for product scope, architecture, and P0 priority.

> Purpose: complete the ENTIRE core tonight with minimal human intervention, while keeping
> every game-feel decision external (data/config), so the game director (me) plugs in details later
> without touching core code.
>
> Prime directive: **game feel lives in config, not code.** Any constant a designer might tweak
> goes in `src/config/tuning.ts` (hot-reloadable). Any content decision (themes, art style,
> character, music mood) enters via compiler inputs or asset packs — never hardcoded.

## Build order & session workflow

Work in vertical phases. After each phase: run the acceptance check, commit, append one line to
DECISIONS.md. Use side worktrees only for Phase 4 (compiler) and Phase 6 (PWA plumbing) if
parallelizing; everything else stays in the main thread.

**Critical enabler — build Phase 0 first: the input simulation harness.**
A `SimulatedPoseProvider` that maps mouse position → wrist landmarks and keys (J=jump dip,
S=squat, F=hold still) → synthetic landmark motion. This lets every core module be built and
tested tonight WITHOUT a camera or a child. All acceptance checks below must pass with the
simulator; camera is a swap-in.

---

## Phase 0 — Repo + simulator (est. 45m)
- TanStack Start + TS strict + vitest. `src/config/tuning.ts` with hot reload.
- `PoseProvider` interface: `init(opts) / start() / stop() / onFrame(cb: (PoseFrame) => void) / capabilities()`.
  `PoseFrame = { t: number, landmarks: Landmark[] /* normalized, mirrored */, confidence: number }`.
- `SimulatedPoseProvider` as above. Debug overlay renders skeleton + FPS/Hz counters.
- **Accept**: `/debug/pose` page shows simulated skeleton at 60fps render / configurable Hz "inference".

## Phase 1 — Real pose + tier system (est. 1.5h)
- `BlazePoseProvider` (@mediapipe/tasks-vision, full+lite bundled locally, GPU delegate,
  VIDEO mode) and `MoveNetProvider` (tfjs, lightning int8, webgl + wasm backends). All model/wasm
  files self-hosted under `/public/models/` (no CDN at runtime).
- Capability probe: WebGPU? WebGL2? WASM SIMD? deviceMemory? → 2s micro-bench (run lite model
  on a canvas fixture) → tier S/A/B/C per kickoff table. `?tier=X` URL override (forced-A is the
  default dev mode). Auto-demote after 5s sustained frame-time overrun; never auto-promote mid-scene.
- One Euro filter + velocity extrapolation between inferences; duty-cycle API (`pause()/resume()`).
- **Accept**: `/debug/pose?provider=blazepose|movenet` works on camera; tier readout correct;
  landmarks visibly smooth at 10Hz inference.

## Phase 2 — Game engine (est. 2h)
- PixiJS v8 mounted in the app shell (autoDetectRenderer: webgpu→webgl→canvas; DPR cap by tier).
- Fixed-timestep game loop decoupled from inference. Object pools for targets/particles.
- Coordinate space: single `GameSpace` util mapping normalized landmarks ↔ stage px, honoring
  mirror mode and the calibration `reachBox` remap.
- Hit system: circle targets with **dwell-based hits** (`tuning.dwellMs`, `tuning.targetScale`),
  limb filtering (hands/feet/any), hysteresis so jitter can't un-hit. Detectors for: jump (hip-Y
  dip+rise), squat (hip drop ratio), stillness (aggregate velocity < ε over window), run-in-place
  (alternating knee-Y cadence), one-leg balance (ankle-Y asymmetry + stillness).
  Plus the MANSE POSE (both wrists above head, held 500ms) — the brand gesture: used as the
  celebration/level-complete detector. The game is literally named after this pose.
- FX layer reads `tuning.fx` (particle counts, celebration duration) — no literals in code.
- **Accept**: `/debug/engine` lets me hit targets with the mouse-simulated wrist; all 6 detectors
  fire correctly with simulator inputs; 0 GC spikes >5ms during a 60s soak (log allocation stats).

## Phase 3 — Episode runtime (est. 2h)
- Wire `episode-schema.ts` (provided) into `src/schema/`. Add `superRefine` referential-integrity
  checks (transition targets, asset ids, acyclicity except explicit rest loops, success+struggle
  transitions present on every challenge scene).
- XState v5 machine: scene entry → narration (skippable by parent hotkey only) → optional demo →
  challenge with outcome classification (success/partial/struggle from hit ratio + time) →
  transition (+ bounded ParamDelta application) → next scene. Seated-mode substitution table.
- Adaptation engine: rolling success tracking vs `adaptPolicy.targetSuccessBand`; applies deltas
  within schema bounds; logs every adjustment to the session record.
- `SessionStats` recorder (localStorage).
- **Accept**: `fixtures/episode-debug.json` (write one by hand: 5 scenes, 3 challenge types)
  plays end-to-end with the simulator; forcing repeated struggle visibly enlarges targets;
  seated flag swaps jump→touch variants.

## Phase 4 — Episode compiler (est. 2h, worktree OK)
- `scripts/compile-episode.ts` CLI: inputs = theme string, locales, age bands, learning goals,
  energy curve, `content/style-guide.md` + `content/characters.md` (game director files).
- Calls `gpt-5.6` (Responses API, `responses.parse` with zodTextFormat of `EpisodePack`,
  reasoning effort high). Post-validate (schema + integrity); on failure, retry once with the
  validator errors appended; then fail loudly.
- TTS baking per locale per narration line → `/public/packs/{id}/audio/`; manifest generation;
  `--mock` flag (uses a builtin fixture, zero API) so the pipeline is testable without a key,
  and `--art` flag stubs gpt-image-2 calls behind an interface (P1 fills it).
- **Accept**: `--mock` produces a pack the runtime plays; one LIVE compile with my key produces
  a playable "test theme" pack. Log token cost per compile.
- **Open-format deliverables (cheap, do at the end of this phase):**
  (a) `PACK-FORMAT.md` — versioned spec of the EpisodePack format with JSON Schema exported
  from the zod source (one script), positioning our GPT-5.6 compiler as the *reference
  implementation*, not the only one; (b) `packs/community-example/` — a minimal HAND-AUTHORED
  pack (no AI) proving any human or tool can produce valid packs. Runtime must play it.

## Phase 5 — Calibration + shell flows (est. 1.5h)
- Camera permission + setup guide screen (framing silhouette, lighting hints, all iconography).
- Calibration scene ("copy me"): measures reachBox (P95 wrist extents), shoulder-Y ratio, tempo,
  response-to-audio vs response-to-demo → writes `PlayerProfile`. Fun, <60s, restartable.
- **Arcade shell**: the home screen is a pack gallery (bundled packs as big tiles — "choosing a
  game" = choosing a pack). Plus **Load pack from URL**: paste any URL hosting a valid pack
  folder (manifest + assets) → validate against schema → playable immediately, cached by the
  service worker. This single feature IS the open publishing story: any static host is a
  publisher — no backend, no gatekeeper. (Demo beat: load a pack from a raw GitHub URL.)
- Parent gate (long-press) → parent screen skeleton: profile editor, pack picker, sensory toggles,
  **parent-voice recorder** (MediaRecorder → IndexedDB, playback slot ids match schema
  `successAudioId` override).
- **Accept**: fresh-profile flow: setup → calibration → pick pack → play → recap stub shows stats.

## Phase 6 — PWA + deploy (est. 1h, worktree OK)
- Service worker: precache app shell + models + default packs; versioned cache; offline-first.
- Demo mode: `?demo=1` auto-loads bundled packs, skips parent setup (for judges).
- **Dual deploy (OpenAI-native story + reliability):**
  1. PRIMARY: Vercel via the official Codex Vercel plugin (must stay stable through the Aug 5
     judging window).
  2. SHOWCASE: **Codex Sites** (public publishing GA'd 2026-07-09; use the Sites plugin in the
     Codex app). FIRST run a 15-minute spike: deploy a hello-world containing a service worker,
     a WASM file, and a getUserMedia call, and verify all three work on the Sites URL.
     If they work → Sites becomes the headline distribution ("built by Codex, compiled by
     GPT-5.6, deployed on Codex Sites — OpenAI native end to end"). If not → Sites hosts the
     landing page + PACK-FORMAT spec linking to the PWA. Never let a 12-day-old product be
     the ONLY deployment.
- Verify airplane-mode replay works after first load (on the primary URL).
- **Accept**: Lighthouse PWA installable; kill network → full play loop works; cold URL → playing
  in <60s on forced-A; Sites spike result recorded in DECISIONS.md.

---

## Sample game lineup (compiled packs — 3 MAX: one deep + two light)
1. DEEP (filmed with my son): adventure episode pack — theme from content/ decisions, ko+en
2. LIGHT: freeze-dance party pack (freeze + touch_targets primitives, music-forward)
3. LIGHT: counting-fitness pack (jump_count + run_in_place, numbers learning)
All three come from the same compiler + same format — the video montage proves
"one open platform, many games." Do NOT build a fourth.

## Hard rules for Codex during this build
- No runtime CDN fetches. No analytics. No camera frames off-device. English UI strings in
  `src/i18n/en.ts` (ko mirror), zero literals in components.
- Respect perf budgets (kickoff §Performance): core bundle <300KB gz; log bundle size per phase.
- Every phase ends green: typecheck + vitest + the phase's acceptance page.
- If a phase overruns its estimate by 2x, STOP and propose a scope cut instead of pushing on.
- Do not invent game content: characters, themes, art style, music mood all come from
  `content/` files owned by the game director (placeholders: "TEST THEME", gray shapes).
