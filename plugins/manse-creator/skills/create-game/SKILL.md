---
name: create-game
description: Create a standalone, declarative Manse active-game Site from a plain-language brief. Use when a creator asks to start, scaffold, or generate a new Manse game without hand-authoring code.
---

# Create Game

Create a safe, runnable game project with the bundled starter and finish with a validated local preview path.

## Required contract

Read `../../references/creator-contract.md` before changing files.

## Workflow

1. Determine the output directory, title, kebab-case slug, one-sentence summary, visual theme, content locale, creator credit, age range, duration, and number of targets/rounds. Ask only for choices that materially change the result; otherwise propose sensible defaults.
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
  --locale <LOCALE> \
  --creator <CREATOR> \
  --energy <gentle|moderate|active> \
  --mechanic <touch_targets|freeze|body_zone|squat|pose_match|jump|velocity_hit|step|sequence> \
  --age-min <MIN> \
  --age-max <MAX> \
  --minutes <MINUTES> \
  --target-count <COUNT>
```

`--target-count` means touch/strike targets, or rounds/repetitions/steps for motion mechanics. Pass `--source-url` only when a real public HTTPS source repository already exists. Use `--intro`, `--instruction`, and `--celebration` when the creator supplied copy. After scaffolding, tune thresholds, holds, tolerances, and repetitions directly in `public/packs/<slug>/manse.pack.json` — designer values live in pack data, never in code.

5. In the new project, run `npm install` and `npm run validate`. Inspect the manifest, pack, provenance, and generated thumbnail. A draft failure from `npm run validate:release` is expected until publishing; other failures are not.
6. Report the created path, actual interaction, safety/accessibility choices, validation result, and the exact preview command `npm run dev`. Suggest `$generate-assets` or `$preview-game` as the next focused step.

## Never do

- Do not add arbitrary pack code or a runtime CDN.
- Do not add analytics, authentication, OpenAI API calls, or camera upload.
- Do not claim the project is published or publicly reachable.
- Do not silently replace an existing game.
