# Manse (만세) — Codex Kickoff Prompt

> **Historical game-first draft.** The project pivoted on 2026-07-21 from a
> single game to an open-source AR game engine, ChatGPT Sites publishing
> platform, and Codex creator/publisher plugin. Follow `PLATFORM-SPEC.md` and
> `../AGENTS.md` when this document conflicts with the current platform plan.

> Paste this entire document as the FIRST message of your main Codex thread (empty repo directory).
> Keep the core build in THIS single thread: its /feedback Session ID is a required submission field
> and judges will review how we collaborated. Worktree side-tasks are fine, but this thread stays primary.

---

## Mission

We are building **Manse** ("hop!" in Korean) for the **OpenAI Build Week Challenge** (openai.devpost.com),
track: **Apps for Your Life**. Deadline: **July 21, 5:00 PM PT** (July 22, 9:00 AM KST). We have ~55 hours.

One-liner: **A webcam-based active-play game for young kids where GPT-5.6 writes the episodes —
no console, no subscription, no account, runs offline in any browser.**

I am a solo dad-developer building this for my own kids (4yo and 1yo). The personal story is part of
the product: kids love follow-along dance videos (Danny Go! style) but the screen can't see them;
interactive motion gaming exists (Nex Playground) but costs $249 + subscription + fixed game catalog.
We replace all of it with a static web app and a content compiler powered by GPT-5.6.

IMPORTANT: We must never use the "Danny Go!" name, music, characters, or any third-party IP.
All assets are original or generated.

## Hackathon constraints (non-negotiable)

1. Built with **Codex + GPT-5.6** (this session is the evidence; judges review it).
2. Submission needs: <3min public YouTube demo video (voiceover must explain how Codex AND GPT-5.6 were used),
   public repo with license, README describing Codex collaboration + where key decisions were made,
   /feedback Codex Session ID, testable by judges WITHOUT rebuilding (we ship a deployed URL + offline demo mode).
3. Everything user-facing and repo-facing must be in **English** (Korean locale is a content pack).
4. Judging criteria (equal weight, tiebreaker order): Technological Implementation → Design →
   Potential Impact → Quality of the Idea. The demo video must show only things that actually work.

## Architecture: "Compile-time AI, Zero-runtime-dependency"

**GPT-5.6 is the factory; the browser is the product.** At play time there is NO API, NO account, NO network.

### Tier 0 (default, universal)
- **Episode Compiler pipeline** (in repo, runnable script): calls `gpt-5.6` (Responses API, structured
  outputs via zod, reasoning effort high) to author **Episode Packs** = parameterized, branching
  scene DAGs with an embedded adaptive policy. Also generates per-line narration audio (OpenAI TTS,
  multiple locales) and scene/character art (`gpt-image-2`) at compile time. Output = static files.
- **Runtime** (pure browser, deterministic): MediaPipe Tasks Vision PoseLandmarker (full model default,
  lite as low-end fallback; WASM + WebGL2) + PixiJS v8 (WebGPU-first, auto-fallback WebGL/Canvas) +
  XState v5 scene machine. PWA with service worker → installable, fully offline after first load.
- **Adaptation runs on-device**: the compiler bakes the policy into the pack; the runtime engine
  executes it (target success band 70–85%, param bounds per challenge type).
- **Parent-voice recording**: during setup, parent records a few encouragement clips locally
  (e.g. the child's name + "you did it!"); played at celebration moments. Offline personalization.

### Tier 1 (optional, BYO API key or hosted demo)
- Live generation of new personalized episodes from a parent prompt.
- (Stretch, P2 only) gpt-realtime-2.1 voice coach via Agents SDK WebRTC with ephemeral client secrets.

### Privacy & child safety (design invariants)
- Camera frames NEVER leave the device. No analytics. No child personal data to any API
  (aligns with OpenAI Under-18 API guidance / COPPA). Child name exists only in localStorage +
  parent's own voice recordings.
- Distribute as a standalone web app only (NOT as a ChatGPT app / Apps SDK submission).

## Universal design pillars (these are core mechanics, not add-ons)

1. **Text-free child experience**: every instruction is delivered 3 ways simultaneously —
   TTS narration + on-screen character demonstrating the movement + icon. Captions default ON.
2. **Reach calibration**: a "copy me" mini-game measures the child's actual reachable box, tempo,
   and comprehension channel. ALL targets spawn inside the measured reachable zone →
   standing kids, seated/wheelchair kids, one-arm play all get 100% playable games with zero "disability mode".
3. **No fail states**: dwell-based hits, infinite retries, no precise timing required, adjustable pace.
4. **Sensory-friendly**: no flicker, predictable scene structure, `reducedStimulation` profile flag
   that the compiler and runtime both respect.
5. **Fairness**: default to PoseLandmarker FULL model (model card shows smaller skin-tone accuracy
   spread than lite); document the tradeoff when lite fallback engages. Art style guide requires
   diverse skin tones/body types in generated characters.
6. **Low-end ladder**: WebGPU→WebGL→Canvas rendering fallback; full→lite pose model fallback;
   packs are static files so the whole thing can be served from any static host (or a USB stick to a classroom).

## Stack (2026-07 SOTA, all licenses clean)

- TanStack Start (RC) + React 19 + TypeScript, Vite, Nitro → deploy to Vercel; PWA via service worker
- PixiJS v8.16 (WebGPU renderer, autodetect fallback to WebGL2 → Canvas)
- Pose: **`PoseProvider` abstraction** with a model ladder (see Performance section) —
  BlazePose full/lite (@mediapipe/tasks-vision) and MoveNet Lightning (tfjs, int8) behind one interface
- XState v5 (scene machine), zod (schemas shared by compiler & runtime)
- Tone.js generative chiptune music (code-composed → zero copyright risk)
- Compiler: openai SDK — `gpt-5.6` (sol) structured outputs, `gpt-image-2`, TTS
- Licenses: Apache-2.0 (MediaPipe) / MIT (everything else) / OFL (Noto fonts). Our repo: MIT.

## Episode schema

See `episode-schema.ts` (provided next). Key ideas:
- `EpisodePack` = meta + cast + assets + scene DAG. Scenes carry narration (per-locale, pre-baked audio refs),
  a character demo, ONE challenge, optional learning moment, and transitions keyed on
  success/partial/struggle with param deltas.
- Challenge primitives (P0 set): `touch_targets`, `jump_count`, `squat`, `freeze`, `run_in_place`, `balance`.
- `PlayerProfile` = age band (starting point only) + measured abilities + sensory prefs + per-type skill EMA.
  We adapt to MEASURED ABILITY, not age.
- The same zod schemas are used as the structured-output format for the compiler
  (keep them strict-mode compatible: discriminated unions, no open-ended records).

## Extreme performance & vendor neutrality (hard requirements)

**Target: playable on ANY device that has a camera and a web browser.** Cheap Android phones,
old laptops, education Chromebooks. "Smooth" is guaranteed by design, not by hardware.

### Principle: the design absorbs latency
Dwell-based hits, generous kid-sized hitboxes, and no precise-timing challenges mean ~150ms
perceived latency does not break gameplay. The SAME adaptation engine that adjusts to a child's
ability also adjusts to the device's ability (bigger targets + longer dwell on weak hardware).

### Device tier ladder (boot-time capability probe + 2s micro-benchmark; auto-demote on sustained frame drops)
| Tier | Pose model | Inference | Render | Notes |
|---|---|---|---|---|
| S | BlazePose FULL (GPU delegate) | 20–30 Hz | WebGPU 60fps, full FX | best fairness spread (model card) |
| A | BlazePose LITE (GPU) | 15 Hz | WebGL2 30–60fps | default mid laptops/phones |
| B | MoveNet Lightning int8 (tfjs) | 15 Hz | WebGL2 30fps, reduced particles | 17 keypoints/2D covers ALL P0 primitives |
| C | MoveNet on CPU (WASM SIMD) | ~10 Hz | Canvas renderer, minimal FX | hit tolerance auto-widens (targetScale+, dwell+) |

- **Design baseline = Tier A.** All game-feel defaults (hitbox size, dwell, smoothing constants)
  are tuned under forced-A conditions. Implement a `?tier=A` dev override flag; development on
  fast machines happens in forced-A mode by default. S inherits tuned params + extra FX for free;
  B/C degrade via automatic tolerance widening. Marketing floor claim = Tier C; judges/demo = S.
- **Temporal decoupling**: render loop (rAF) and inference loop run at independent rates;
  landmarks are smoothed (One Euro filter) + velocity-extrapolated between inferences.
- **Duty cycling**: pose inference PAUSES entirely during story/rest/celebration scenes
  (episodic pacing = natural thermal/battery relief on phones).
- Camera at 640x480 max (models downscale to 192–256px anyway); DPR capped at 1 on tier B/C.
- Main-thread inference is the P0 default (works everywhere incl. iOS Safari);
  Web Worker + ImageBitmap transfer offload is a P1 optimization behind a capability probe
  (known WebKit quirks — do not put it on the critical path).
- Object pooling for targets/particles (no GC spikes mid-scene); audio via sprite sheets.
- When tier drops to B/C, log a fairness note (lite/MoveNet have wider accuracy spread across
  skin tones than FULL) and widen hit tolerance to compensate — document this in README.

### Performance budgets (CI-checked where possible)
- Core JS bundle < 300KB gz (models lazy-loaded: MoveNet ~3MB, BlazePose lite ~5.5MB, full ~9MB)
- Inference floor 10 Hz; render floor 30fps; input-to-feedback < 150ms perceived
- Total memory < 300MB; must stay playable under Chrome DevTools 6x CPU throttle
- First visit TTI < 3s on mid-range mobile; repeat visits instant (service worker)

### Vendor neutrality checklist
- Web standards only: getUserMedia, WASM, WebGL2 (baseline), Web Audio, Service Worker. 
  **WebGL2 is the baseline; WebGPU is a progressive enhancement** (Firefox ships WebGPU off by default).
- No app store, no account, no runtime CDN dependency: ALL models/wasm/assets self-hosted
  static files (this is also what makes full-offline PWA possible).
- All models open-source (Apache-2.0), self-hostable; no vendor cloud at play time.
- No Chromium-only APIs in P0. WebNN (W3C's hardware-agnostic acceleration standard) is a
  future enhancement only — spec is maturing but implementations are still preview-grade.

## Delivery plan (priority ladder — cut from the bottom, never the top)

- **P0 (submit-worthy alone, target: Mon night KST)**
  1. Repo scaffold, AGENTS.md, DECISIONS.md (log every key decision — this feeds the README judging requirement)
  2. Pose runtime: `PoseProvider` interface + capability probe/tier system + camera setup guide UI,
     One Euro smoothing + extrapolation, duty cycling, reach calibration scene
  3. Game engine: the 6 challenge primitives + dwell hits + celebration FX + Tone.js music
  4. Episode runtime: DAG executor + on-device adaptive param engine (70–85% success band)
  5. Episode compiler script + 3–5 pre-compiled packs (en + ko), TTS audio baked
  6. PWA offline + deployed URL + "demo mode" (no key needed)
  7. Parent-voice recording + playback
- **P1 (target: Tue midday)**: gpt-image-2 art pipeline for pack visuals; parent recap screen
  (local stats, nicely visualized); polish (kid-scale UI, high contrast mode)
- **P2 (only if ahead)**: Tier 1 live episode generation UI; realtime voice coach spike
- **Frozen from Tue 6 PM KST**: feature freeze → film demo (my kid playing), edit <3min video,
  README final (Codex collaboration section, architecture, decision log), submit with ≥2h buffer.

## How we work in this session

- First, DO NOT write code yet. Respond with: (1) your critique of this plan — top 5 risks and
  anything you'd cut or change for the 55h budget; (2) a proposed repo structure; (3) the P0 task
  breakdown as a checklist with time estimates. We'll agree on the plan, then build.
- Then scaffold, then implement P0 in vertical slices (each slice ends in something I can run and show).
- Spike risky bits first with throwaway code: (a) pose FPS on my machine, (b) a 4-year-old-sized
  hitbox test I can run with my son tonight.
- Ask me for a live test with my kid when the first playable loop exists — his reaction data
  (reach, tempo, attention) tunes the calibration defaults.
- Keep commits small with clear messages; maintain DECISIONS.md as we go.
- Be honest about what's not working; the demo video may only show real functionality.
