# Manse creator contract

Apply this contract to every Manse game project.

## Product boundary

- A game is an independent, creator-owned Site. The Manse Showcase only links to it.
- A pack is declarative JSON. Never put JavaScript, HTML, executable WebAssembly, eval-like text, credentials, or remote code in a pack.
- Pack `schemaVersion` 1 admits only `touch_targets` and runs on every released engine. Pack `schemaVersion` 2 (engine 0.2+) additionally admits `freeze`, `body_zone`, `squat`, `pose_match`, `jump`, `velocity_hit`, `step`, and `sequence`, each fully tunable through pack data (thresholds, holds, tolerances, repetitions). A v2 pack must declare `engine.minimumVersion` >= 0.2.0 so older runtimes reject it cleanly.
- Mechanics outside that list — running in place, balance scoring, fine finger tracking, object/ball tracking, or live AI — are not implemented. Do not generate or claim them; offer the nearest supported mechanic instead.
- `meta.players` (2–4, coop or versus) is an engine-supported contract validated with deterministic multi-person replays; real-device multi-person tracking is still being qualified. Generate multiplayer packs only when the creator explicitly accepts that experimental status, and never advertise multiplayer as broadly device-tested.
- `velocity_hit` measures on-screen limb speed. Copy must say "speed", never real-world force or punch strength.
- A published game must run without a Manse account, ChatGPT sign-in, an OpenAI API key, or a runtime AI call.

## Privacy and safety

- Camera frames and pose landmarks stay in the playing browser. Do not add analytics, telemetry, frame upload, child profiles, advertising, or third-party trackers.
- Ask for camera permission only after an explicit player action. Make the pointer simulator the default authoring and test path.
- Keep captions enabled, provide a stop/restart path, use calm setup copy, and avoid medical, educational-outcome, or universal device-support claims.
- Do not put a child's name, image, voice, location, school, or other personal data in source, packs, prompts, logs, screenshots, manifests, or provenance.

## Content and assets

- Keep designer-tunable values in `manse.pack.json`, not component literals.
- Use only relative, same-Site paths in packs. Bundle the engine, pose models, WASM, art, and audio in the Site; no runtime CDN.
- Every pack asset must have a license and one exact provenance record. Generated assets record tool, model, complete prompt, and generation time. Third-party assets record creator, HTTPS source, retrieval time, and a compatible license.
- Keep `public/asset-provenance.json` aligned with the files shipped by the Site.

## Versioned files

- Public manifest: `public/.well-known/manse-game.json`
- Pack: `public/packs/<slug>/manse.pack.json`
- Pack provenance: `public/packs/<slug>/provenance.json`
- Project state: `.manse/project.json`
- Sites connection: `.openai/hosting.json`

The pack schema, validator, runtime loader, and generated project must stay on the same engine contract. Treat a validator failure as a defect to fix, never as a check to bypass.

## Draft and release states

New projects intentionally use `.example.invalid` deployment URLs and, when no source URL is supplied, a `replace-me` repository URL. Local `npm run validate` must pass in draft state; `npm run validate:release` must fail until real public URLs and a Sites project ID are present.

Before release, make the manifest's `gameUrl`, thumbnail URL, provenance URL, source URL, locale, accessibility claims, and permissions match the deployed artifact exactly.
