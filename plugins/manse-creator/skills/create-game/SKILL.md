---
name: create-game
description: Create a standalone, declarative Manse active-game Site from a plain-language brief. Use when a creator asks to start, scaffold, or generate a new Manse game without hand-authoring code.
---

# Create Game

Create a safe, runnable game project with the bundled starter and finish with a validated local preview path.

## Required contract

Read `../../references/creator-contract.md` before changing files.

## Workflow

1. Write the experience spine before scaffolding: output directory, title, slug, one-sentence promise, player fantasy, one continuous physical verb, themed target metaphor, three escalating authored beats, failure/recovery, visual vocabulary, audio/VFX vocabulary, locale, creator, age range, and duration. Ask only for choices that materially change the result; otherwise make concrete, non-generic choices from the brief. A color palette is not a fantasy and a movement detector is not a game concept.
2. Pick the engine 0.2 mechanic that best fits the idea and say which one you chose:
   - reach and touch → `touch_targets` · statue / red-light-green-light / stop dance → `freeze`
   - dodge, lean, move into areas → `body_zone` · fitness squats / frog hops → `squat`
   - yoga, animal poses, copy-the-pose → `pose_match` · jumping games → `jump`
   - punch/drum/kick speed targets → `velocity_hit` · dance steps / rhythm feet → `step`
   - workout combos and choreography chains → `sequence`
   If the brief asks for running in place, balance scoring, fine finger control, object/ball tracking, live AI, or multiplayer, explain that this release does not implement it (multiplayer is engine-supported but still device-experimental) and offer the nearest supported mechanic. Never label a game as a capability the runtime does not perform.
3. Check movement safety and privacy. Avoid obstacles, body-contact instructions, competitive pressure, unsafe speed, personal child data, and outcome claims. Prefer `gentle` defaults for jumps and squats, and describe `velocity_hit` as on-screen speed, never force. Keep simulator play available.
4. Refuse to overwrite an existing output directory. Run the bundled generator from the plugin root:

```bash
node <PLUGIN_ROOT>/scripts/create-game.mjs \
  --output <NEW_DIRECTORY> \
  --slug <SLUG> \
  --title <TITLE> \
  --summary <SUMMARY> \
  --theme <THEME> \
  --fantasy <PLAYER_ROLE_AND_STAKES> \
  --player-verb <CONTINUOUS_PHYSICAL_VERB> \
  --target-metaphor <THEMED_RESPONSIVE_OBJECT> \
  --locale <LOCALE> \
  --creator <CREATOR> \
  --energy <gentle|moderate|active> \
  --mechanic <touch_targets|freeze|body_zone|squat|pose_match|jump|velocity_hit|step|sequence> \
  --age-min <MIN> \
  --age-max <MAX> \
  --minutes <MINUTES> \
  --target-count <COUNT>
```

`--target-count` means touch/strike targets, or rounds/repetitions/steps for motion mechanics. Pass `--source-url` only when a real public HTTPS source repository already exists. Use `--intro`, `--instruction`, and `--celebration` when the creator supplied copy. The generator creates a three-beat structural draft and `.manse/experience.json`; it deliberately marks the visual quality status `design-required`. This is a starting contract, not a finished game.

5. Read `../../references/presentation-recipes.md`, then build the game-specific presentation layer before reporting completion. Start from the creator-owned `app/feel/` kit and replace its clearly marked fiction hooks; do not invent another renderer substrate and do not import, host, or composite over `createDefaultRenderer`. It must install the full-replacement renderer, draw themed in-play entities rather than default circles/zones, expose at least three visible reaction states, visualize the player's input continuously, include a localized room-readable score/timer or equivalent mission state, provide a distinct completion resolution, and trigger at least three authored sounds. Camera mode must draw the mirrored local video at full strength with its grade; simulator mode must draw a painted set. Both modes share the same game layer. Keep designer tunables in the pack or game configuration, never buried in renderer literals.
6. Rewrite the three generated challenge scenes so their spatial, timing, quantity, or sequence parameters create a real learn → pressure → finale arc. Preserve a comfortable recovery path. Do not duplicate a challenge and call it another round.
7. Use `$generate-assets` for original in-game art and audio when useful, then `$preview-game` to complete the simulator path. Capture a genuine mid-play screenshot, a genuine completion screenshot, and playtest notes from the shipped build. Verify reduced-motion completion and inspect camera mode when the user authorizes it.
8. Update `.manse/experience.json` with the presenter source, named themed entities, three reaction states, continuous feedback, score/resolution behavior, evidence paths, and only the gates actually verified. Set `status` to `approved` only when every gate is true. Never manufacture evidence or reuse a landing screenshot as gameplay evidence.
9. Run `npm install`, `npm run validate`, and `npm run validate:release`. Draft URL/Sites failures are expected before publishing; a game-quality failure is not. Fix the experience until its release-quality gate passes before suggesting publication.
10. Report the created path, actual player fantasy and interaction, the three beats, safety/accessibility choices, evidence paths, validation result, and exact preview command `npm run dev`.

## Never do

- Do not add arbitrary pack code or a runtime CDN.
- Do not add analytics, authentication, OpenAI API calls, or camera upload.
- Do not claim the project is published or publicly reachable.
- Do not call a default runtime target, palette swap, hero-only illustration, or duplicated scene a finished game.
- Do not set quality gates true without observable shipped-build evidence.
- Do not silently replace an existing game.
