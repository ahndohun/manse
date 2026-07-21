---
name: validate-game
description: Validate a Manse game project, pack graph, manifest, assets, privacy boundary, accessibility claims, tests, and production build. Use before preview, publishing, remix submission, or when a creator asks whether a game is release-ready.
---

# Validate Game

Run deterministic gates and distinguish local correctness from public-release proof.

## Required contract

Read `../../references/creator-contract.md` and `../../references/release-checklist.md` before validation.

## Workflow

1. Work from the game project root. Inspect `package.json`, `.manse/project.json`, the public manifest, every pack, both provenance layers, `.openai/hosting.json`, and the source tree.
2. Run:

```bash
npm install
npm run validate
npm audit --omit=dev
```

Do not weaken scripts, schemas, or tests to manufacture a pass.

3. Confirm the validator accepts the real project. In a temporary directory, make one intentionally invalid pack copy—such as an unknown challenge type or escaping asset path—and confirm `manse validate` rejects it. Never alter the creator's only copy for this negative test.
4. Inspect the production output. Require the public manifest, pack, pack provenance, thumbnail, runtime model files, MediaPipe WASM, and third-party notices. Confirm the deployed code does not require a runtime CDN.
5. Search non-generated source and public metadata for `eval`, dynamic code loading, iframe embedding, analytics/trackers, remote pose assets, credentials, `.example.invalid`, `replace-me`, and personal child data. Investigate matches in context; do not treat harmless documentation text as executable behavior.
6. Compare manifest claims to the implementation: locale, age range, movement, captions, seated mode, high contrast, reduced stimulation, audio cues, permissions, source, and provenance.
7. Run `npm run validate:release`. A draft URL or missing Sites project is a blocking release issue but not a failure of local game creation.
8. Return a compact report with passed gates, blocking failures, non-blocking caveats, exact commands, and whether the game is locally valid, release-ready, or publicly verified. Fix failures only when the user's request includes implementation.

## Public validation

When a deployment exists, verify the game and manifest from an anonymous session. Authentication, an owner bypass, or a local file is not proof of public access.
