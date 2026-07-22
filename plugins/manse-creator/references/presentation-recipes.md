# Presentation recipes

Read this with `creator-contract.md` before replacing the starter's presentation hooks. The
files under `app/feel/` are creator-owned source: keep the architecture, then rewrite the
fiction inside `themed-renderer.ts`. Do not import `createDefaultRenderer` or composite a
themed layer over it. Camera and simulator must use the same targets, avatar prop, HUD,
mission state, particles, audio, and outcome; only the world backdrop changes.

## Runtime frame contract

`RuntimeRenderFrame` gives the renderer:

- `video`: a local `HTMLVideoElement` in camera mode and `null` in simulator mode. Use
  `drawVideoCover` and `drawCameraGrade` for a full-strength mirrored camera view. Use a
  painted set when it is null.
- `poseFrame.poses[].landmarks`: named normalized landmarks already mirrored into player
  screen space. Prefer the highest-scoring pose and require useful visibility/presence.
- `targets[]`: normalized `x`, `y`, `radius`, `dwellProgress`, and `hit`. Turn these into
  fictional objects; never redraw generic detector circles.
- `challenge`: `kind`, `phase`, `progress`, `completedUnits`, `totalUnits`,
  `holdProgress`, `repetitionCount`, `zones`, `arrow`, `stepLabel`, `framing`, and
  `jointFeedback`. Zones expose a box and `pending | active | done | danger` state.
- `celebrationProgress`, `caption`, `reducedStimulation`, and device `tier`. Cap DPR by
  tier, reduce particles and remove shake/flash when reduced stimulation is true.

The player's `onEvent` stream emits `target-hit`, `challenge-progress`, `scene-changed`,
and `complete`. Feed it through `mission.ts` and `audio.ts`; add game-specific scoring,
timers, retries, and wave state there rather than inferring the whole mission from pixels.

## Fantasy-first world composition

The first playable frame must already look like the promised fantasy, not like a detector
demo waiting for decoration. Prefer one authored, same-Site, provenance-recorded full-bleed
world image or a comparably rich code-painted set, cover-fit it behind the play layer, and
apply only the grade needed for target and caption contrast. Keep the active character,
prop, targets, mission HUD, and reactions above that world so the scene reads at TV distance.
Do not ship empty gradients, debug geometry, or a landing-page illustration followed by an
unrelated bare canvas. Use one dominant start action, room-readable state, and a brief safety
line; put camera/device setup into the camera path instead of blocking simulator play.

In camera mode the local mirrored video replaces the authored backdrop at full strength.
Never ghost a fantasy background over the player. The same fictional objects, avatar prop,
HUD, reactions, and outcome remain above both backdrops.

## Mechanic-to-fiction recipes

### `touch_targets` and `velocity_hit`

Draw each runtime target as a themed object with at least idle, reacting/dwell, and resolved
states. `dwellProgress` is continuous anticipation; `hit` triggers the payoff, particles,
sound, score, and an authored world change. Directional velocity targets should incorporate
`requiredDirection` into the object or its motion cue.

### `body_zone`

Draw a fictional object at each zone center, not a rectangular detector. `active` plus
`holdProgress` drives anticipation (for example, fruit wobbles and detaches), and `done`
drives the payoff into the avatar prop. `danger` must read as a safe avoidance cue without
punitive flashing.

The Fruit Basket fidelity bar is concrete: fruit falls from a canopy toward zone centers;
a basket is visibly held in the player's raised hand; a catch lands fruit in the basket,
fires a juice sparkle and sound, and increments a room-readable counter. Apply that level of
concept faithfulness to every fantasy.

### `freeze`

Use `holdProgress` as pressure inside the fiction: a flashlight sweep, waking statue, or
closing vault. Show a calm recovery state when motion breaks the hold. Do not turn the
mechanic into a raw progress bar over a skeleton.

### `squat` and `jump`

Detect increases in `completedUnits` or `repetitionCount` across frames and call
`onRepetition()`. A repetition should move the world and avatar prop, trigger a restrained
particle/audio beat, and advance an authored objective. Respect the gentle movement defaults.

### `pose_match`

Translate `silhouette` and `jointFeedback` into a themed shadow, constellation, costume, or
machine alignment. Use friendly local joint cues and `holdProgress`; never imply medical or
fitness accuracy.

### `step` and `sequence`

Turn `arrow` and `stepLabel` into floor marks, choreography, or world navigation. A sequence
needs an authored inner-step change and a larger completion payoff, not repeated labels.

## Simulator and avatar props

`SimulatedPoseProvider` keeps a full standing pose and moves only the selected hand's
wrist/finger cluster (right by default) when `setPointer` is called. Therefore a basket,
glove, hose, wand, or other pose-anchored prop must follow the highest-confidence or
most-recently-moved wrist. Do not use the midpoint of both wrists: it half-tracks the pointer.

That default hand-only control cannot complete `squat` or `jump`. A generated game using
either mechanic must ship a creator-owned, pointer-compatible full-body simulator adapter:
pointer movement must produce the same safe stand/crouch or ground/rise/land phases expected
by the evaluator while camera mode continues to use the default MediaPipe provider. Prove the
public no-camera path reaches real progress and terminal completion; a replay-only unit test
does not make an advertised pointer button honest.

## Required review before approval

1. Replace the generic seal, zone object, avatar prop, and painted set hooks with the game's
   own fiction and keep all tunable quantities in pack/config data.
2. Localize every canvas string for every declared locale.
3. Verify the same game layer in camera and simulator modes, including full-strength mirrored
   self-view and a provenance-recorded full-bleed or comparably rich painted simulator world.
4. Exercise three visible reaction states, continuous input feedback, three authored sounds,
   score/mission HUD, authored escalation, reduced motion, and distinct victory/retry outcome.
5. Complete the actual public pointer path for every advertised mechanic, including a
   full-body adapter for squat/jump, then capture genuine shipped-build play, reaction, and
   completion evidence. Only then set the
   corresponding `.manse/experience.json` gates true and change its status to `approved`.
