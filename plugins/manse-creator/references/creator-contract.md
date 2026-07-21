# Manse creator contract

Apply this contract to every Manse game project.

## Product boundary

- A game is an independent, creator-owned Site. The Manse Showcase only links to it.
- A version 1 pack is declarative JSON. Never put JavaScript, HTML, executable WebAssembly, eval-like text, credentials, or remote code in a pack.
- The version 1 contract admits only `touch_targets`, the mechanic implemented by runtime 0.1. Future mechanics require a reviewed engine change and a new compatible schema release; do not generate or claim them early.
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
