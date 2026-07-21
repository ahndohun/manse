---
name: create-game
description: Create a standalone, declarative Manse active-game Site from a plain-language brief. Use when a creator asks to start, scaffold, or generate a new Manse game without hand-authoring code.
---

# Create Game

Create a safe, runnable game project with the bundled starter and finish with a validated local preview path.

## Required contract

Read `../../references/creator-contract.md` before changing files.

## Workflow

1. Determine the output directory, title, kebab-case slug, one-sentence summary, visual theme, content locale, creator credit, age range, duration, and number of targets. Ask only for choices that materially change the result; otherwise propose sensible defaults.
2. Translate the idea into the current engine's `touch_targets` interaction. If the brief asks for jumps, squats, freeze detection, running, balance scoring, multiplayer, or live AI, explain that 0.1 does not implement it and offer a touch-target interpretation. Never label a touch game as a capability the runtime does not perform.
3. Check movement safety and privacy. Avoid obstacles, body-contact instructions, competitive pressure, unsafe speed, personal child data, and outcome claims. Keep simulator play available.
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
  --age-min <MIN> \
  --age-max <MAX> \
  --minutes <MINUTES> \
  --target-count <COUNT>
```

Pass `--source-url` only when a real public HTTPS source repository already exists. Use `--intro`, `--instruction`, and `--celebration` when the creator supplied copy.

5. In the new project, run `npm install` and `npm run validate`. Inspect the manifest, pack, provenance, and generated thumbnail. A draft failure from `npm run validate:release` is expected until publishing; other failures are not.
6. Report the created path, actual interaction, safety/accessibility choices, validation result, and the exact preview command `npm run dev`. Suggest `$generate-assets` or `$preview-game` as the next focused step.

## Never do

- Do not add arbitrary pack code or a runtime CDN.
- Do not add analytics, authentication, OpenAI API calls, or camera upload.
- Do not claim the project is published or publicly reachable.
- Do not silently replace an existing game.
