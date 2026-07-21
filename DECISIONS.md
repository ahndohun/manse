# Manse decision log

## 2026-07-21

### D001 — Platform, not a single game

Manse is an open-source AR active-game engine and publishing platform comparable in product shape to closed camera-game ecosystems. The reference game proves the platform; it is not the product boundary.

### D002 — ChatGPT Sites is the primary platform surface (superseded by D007)

The initial proposal placed the catalog, player, creator dashboard, and submission flow in one Site. D007 replaces the centralized dashboard and upload service with independent game Sites and a link-only Showcase.

### D003 — Codex is the creator studio

Non-developers create, preview, validate, remix, and publish games through an installable Manse Codex plugin. P0 does not require a project-owned OpenAI API key: authoring uses the active Codex session and available Codex tools. A headless API compiler may be added later as an optional adapter.

### D004 — Data-only portable packs

Version 1 packs contain strict declarative game data and bundled assets. The universal player never executes arbitrary uploaded JavaScript. New engine mechanics require an engine contribution or a separately deployed engine fork.

### D005 — Lightweight staged publishing (superseded by D007)

The initial proposal used centrally uploaded drafts. D007 replaces this with a creator-owned Site, a public manifest, automated catalog checks, and maintainer approval of a small metadata change.

### D006 — Platform storage and identity (superseded by D007)

The initial proposal used D1, R2, and creator identity in the official platform. D007 removes these dependencies from v0.1.

### D007 — Sites-first federated publishing

Every game is a self-contained Site owned and published by its creator. The official Manse Site is a static Showcase that links to those games and never hosts or executes their code. A game exposes a standard public manifest; listing is a small catalog contribution validated by CI and approved by a maintainer. This removes the central upload service, storage, authentication, and moderation backend from v0.1 while making Codex-to-Sites publishing the primary product workflow.

### D008 — Public ChatGPT Sites is the v0.1 judge path

With explicit owner approval, the packaged Showcase was changed from custom
owner access to public access and deployed at
`https://manse-showcase.ran584000.chatgpt.site`. Zero-cookie requests verified
the home, simulator playground, documentation, submission guide, provenance,
and same-origin pose model without a ChatGPT or Manse account. The official
v0.1 experience therefore remains on ChatGPT Sites; no fallback host is needed.

### D009 — One public play-engine package for v0.1

`@manse/runtime-web` is the sole v0.1 play engine. It owns deterministic scene execution, local camera and simulator pose providers, challenge evaluation, rendering, captions, and browser integration behind internal module boundaries. The partial `@manse/engine` and `@manse/pose` packages were removed before release so creators and judges see one coherent runtime contract rather than three independently versioned packages. Their useful P0 work was retained or reimplemented inside `runtime-web`; the baseline commit preserves the discarded drafts for reference.

### D010 — One catalog snapshot contract

The public game manifest is the only source of Showcase metadata. It declares creator and energy alongside the existing discovery fields. The CLI resolves the small source catalog into the versioned `{ manifestUrl, manifest }` snapshot defined by `@manse/schema`, and the Showcase renders that exact checked-in snapshot without fetching creator Sites at runtime. A separate hand-maintained flattened Showcase format was removed to prevent schema and metadata drift.

### D011 — A valid v0.1 pack is executable by runtime 0.1

The version 1 challenge contract admits only `touch_targets`, the mechanic the
released runtime actually executes. Names for jump, squat, freeze, running, and
balance are not reserved inside the public v1 schema: adding one requires a
reviewed engine implementation, deterministic tests, and a compatible schema
release. This prevents the validator and creator plugin from accepting a pack
that the player must reject at runtime.

### D012 — Public discovery metadata describes executable v0.1 mechanics

The v1 game manifest and Showcase movement filter expose only `touch`, matching
the sole `touch_targets` challenge accepted by the v1 pack contract. Seated
play, captions, high contrast, reduced stimulation, and audio cues remain
separate accessibility facets. Future movement names are added only with a
reviewed runtime mechanic and contract release, so catalog metadata cannot
advertise behavior the published engine does not perform.

The signed-out deployed Playground must also complete all three targets before
a Showcase release is accepted. The repository provides a real-browser command
and a manually dispatchable GitHub Actions workflow for this post-deployment
gate; two renderer canvases are expected because the WebGL renderer separates
the camera and overlay layers.

### D013 — The landing hero is a purpose-built constrained puppet, not a general skeleton renderer

The hero is the product's proof: a visitor presses one button and becomes the
Manse dot character. That magic tolerates zero broken frames, so the renderer
removes every degree of freedom that could break the form instead of trying to
patch a general skeleton renderer:

- Bone lengths are fixed anatomical ratios of the torso length; on-device pose
  tracking supplies joint ANGLES only. Arms cannot stretch or detach by
  construction.
- Joint angles are clamped to human-plausible ranges. Elbow flexion is clamped
  by magnitude (no fold beyond ~160 degrees): in 2D projection the signed bend
  is pose-dependent, so a per-side sign clamp mangles legitimate poses such as
  a goalpost — verified in the /pose-lab/ QA harness (scripts/verify-pose-lab.mjs).
  The head never leaves the neck and the torso never folds by construction.
- Upper body only. Legs are never estimated or drawn; the pelvis is fixed. A
  limb the camera cannot see confidently is faded out with hysteresis, never
  guessed, and its angles freeze while unseen.
- Idle and live tracking emit the same parametric pose, so the idle greeter and
  the mirror blend without a broken intermediate shape; on tracking loss the
  last pose freezes briefly, then relaxes back to the greeter.
- The figure is pinned to a stage strip below the hero copy with a hard size
  clamp derived from the strip height, so no camera distance can push it into
  the text. Mirror scale still responds to distance (lean in = larger bust).
- The dot field is the page's background language; the hero canvas paints the
  crisp field and the figure, the body continues it faintly down the page.

Finger-level mirroring is deliberately deferred: it requires a hand landmarker
and the same constrained-treatment design before it ships. Camera frames remain
on-device and the camera starts only on click, per the platform privacy
invariants.

### D014 — Pack schemaVersion 2: nine motion primitives behind one evaluator seam

The engine grew from touch-only to a motion platform without breaking a single
released contract. The mechanism is a version split plus a runtime seam:

- Pack `schemaVersion` stays `1` for touch-only packs — byte-for-byte
  compatible, runnable by 0.1 and 0.2 engines. `schemaVersion: 2` unlocks the
  full challenge union (`touch_targets`, `freeze`, `body_zone`, `squat`,
  `pose_match`, `jump`, `velocity_hit`, `step`, `sequence`) and must declare
  `engine.minimumVersion >= 0.2.0`, so 0.1 runtimes reject v2 packs on the
  version literal instead of misbehaving mid-game.
- `TouchEpisodeSession` became the generic `EpisodeSession` (the old name is a
  compatibility alias). Scene flow, transitions, adaptation, and audio stay in
  the session; per-mechanic detection lives in pluggable evaluators behind one
  `ChallengeEvaluator` interface. Adding the next mechanic touches one
  evaluator file and one registry case. The touch mechanic moved verbatim and
  its 0.1 regression tests pass unchanged.
- All detectors judge body-relative signals — ratios of the player's own torso
  length and joint angles in degrees, with per-joint confidence gating and
  occlusion hysteresis — never absolute pixels. Thresholds, holds, tolerances,
  and repetitions are designer-tunable pack data; `ParamDelta` gained optional
  v2 keys (`toleranceMul`, `holdMsMul`, `repetitionsDelta`, `speedMul`,
  `motionThresholdMul`) that v1 packs cannot use.
- Every evaluator ships deterministic success/failure/boundary replay fixtures
  (`packages/runtime-web/fixtures/replay/`) expanded to full 33-landmark
  frames by `synthesizePoseFrames`, so detection logic is testable and
  benchmarkable without a camera. The canonical v2 fixture pack drives all
  nine mechanics through a complete session in CI.
- Multiplayer (2–4, coop/versus) is a schemaVersion 2 pack declaration
  (`meta.players`). `PlayerTracker` keeps frame-to-frame identity with
  nearest-centroid matching, join persistence, leave grace, and no ID reuse;
  sessions run one evaluator lane per player and degrade to solo on
  single-pose devices. This is verified with deterministic two-person replays
  (including crossing paths); real-device multi-person tracking remains under
  qualification and is not advertised as device-tested.
- `velocity_hit` measures on-screen limb speed and the creator contract
  requires copy to say so; the engine cannot measure real-world force and
  never claims to.

The Creator plugin generates all nine mechanics (`--mechanic`), keeps
`touch_targets` on schemaVersion 1 for maximum reach, and pins motion packs to
the 0.2 engine it bundles. The Playground gained a mechanic selector with live
evaluator diagnostics and deterministic replay drives for body mechanics that a
pointer cannot simulate.

### D015 — Demo catalog games are creator-owned projects; aim-from-distance is game-level only

Six Tier-1 demo games (Advisory 017, owner-approved list) were generated with the
Creator generator into `demo-games/<slug>/` and validated end to end: morning-star-catch
(touch), fire-hose-hero (touch + aim wrapper), fruit-basket (body_zone), museum-statues
(freeze), froggy-hops (squat), monkey-bananas (jump). They are creator-owned projects,
not monorepo packages — they stay out of git here; the catalog will reference their
deployed manifests after publication, per D007.

Two rulings fell out of the build:

- **Aim-from-distance is game-app code, never engine code.** Fire Hose Hero injects a
  `providerFactory` wrapper that projects the elbow→wrist ray to a fixed-distance,
  EMA-smoothed impact point and rewrites the wrist landmarks before the frame reaches
  the engine. Scoring, completion, validation, and the simulator path run the stock
  `touch_targets` evaluator unchanged; `packages/runtime-web` and the vendored bundles
  are untouched. Simulated/replay providers pass through unwrapped, so pointer E2E and
  replay fixtures stay byte-identical. This wrapper is the prototype for a
  post-submission `projectile_stream` behavior ingredient; promoting anything like it
  into the engine is a separate contract decision.
- **Generated starters must not swallow button clicks.** The starter's stage captured
  the pointer on every `pointerdown`, retargeting `click` away from the "Play with
  pointer" / "Use my camera" buttons — every generated game was unstartable by a real
  user. Fixed in the starter template (skip capture when the event target is inside
  `button, a`) and game-side in the six demos; `plugin:validate` regenerates and
  validates a game against the fixed template.

Verification per game: `npm run validate` `"ok": true`; pointer E2E on the production
build (`demo-games/verify-game.mjs`, headless Chromium, trusted input) completes
touch/body_zone/freeze games to "Complete" with zero page errors; squat and jump are
proven by replay-driven evaluator harnesses (`tests/motion.test.mjs`) using the real
pack configs and engine session — negative controls confirm the harness scores honestly.
Real-camera feel (especially the aim wrapper) and ChatGPT Sites publication remain
owner/Codex-environment steps; the catalog stays empty until a public manifest passes
CI and maintainer review, per the platform invariants.
