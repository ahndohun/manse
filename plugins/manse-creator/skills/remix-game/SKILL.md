---
name: remix-game
description: Create a distinct, attributed Manse game from an existing licensed game while preserving provenance and resetting release identity. Use when a creator asks to fork, adapt, translate, reskin, or remix a Manse game.
---

# Remix Game

Produce an independent draft without inheriting the original deployment identity or hiding its authorship.

## Required contract

Read `../../references/creator-contract.md` before copying files.

## Workflow

1. Inspect the original public manifest, source repository, `LICENSE`, pack licenses, and asset provenance. Confirm the license permits the requested remix. If source or rights are unavailable, do not scrape the public Site; ask the user for a licensed source checkout.
2. Choose a new output directory, title, slug, summary, creator credit, source URL, and theme. Never overwrite either the source or an existing destination.
3. Copy source files while excluding `.git`, `node_modules`, `dist`, `.wrangler`, caches, logs, local environment files, credentials, bypass tokens, and deployment artifacts.
4. Reset identity consistently:
   - package name and `app/game-config.ts`;
   - manifest `id`, `slug`, title, summary, source URL, and draft deployment URLs;
   - pack directory, pack `meta.id`, title, summary, theme, compiler timestamp, and asset paths;
   - `.manse/project.json` to draft state;
   - `.openai/hosting.json` project ID to an unconnected value.
5. Preserve original author/license notices required by the source license. For unchanged assets, preserve their exact provenance. For modified or generated assets, add new provenance that identifies both the new work and the source where required.
6. Keep the runtime interaction within implemented `touch_targets` behavior. A visual reskin does not justify changing movement or accessibility claims.
7. Run `npm install` and `npm run validate`. Confirm release validation fails only for the intentional new deployment placeholders.
8. Report the source, license basis, attribution retained, identity reset, content changed, and validation result.

## Never do

- Do not carry over another creator's Site ID, public URL, source URL, or credentials.
- Do not relabel third-party or generated assets as original.
- Do not publish or open a pull request as part of a remix unless the user separately asks for it.
