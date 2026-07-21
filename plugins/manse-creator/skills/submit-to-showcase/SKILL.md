---
name: submit-to-showcase
description: Verify a public Manse game and prepare the minimal catalog contribution for maintainer review. Use when a creator asks to list, register, submit, or add a published game to the official Manse Showcase.
---

# Submit to Showcase

Add only the public manifest reference; the Showcase never uploads, proxies, embeds, or executes the creator's game.

## Required contract

Read `../../references/creator-contract.md` and `../../references/release-checklist.md` before changing a catalog checkout.

## Workflow

1. Require a stable public HTTPS manifest URL ending in `/.well-known/manse-game.json`. Verify it and the game root from an anonymous session. Stop if either requires sign-in, an owner bypass, or a private token.
2. Validate the fetched manifest, confirm its game/source URLs, engine compatibility, permissions, thumbnail, license, accessibility claims, and provenance, and complete the public simulator path.
3. Work in a clean fork or focused branch of `https://github.com/ahndohun/manse`. Preserve unrelated work. Do not copy the game bundle into Manse.
4. Build the current CLI, then run:

```bash
manse catalog add <MANIFEST_URL> --catalog ./catalog/catalog.json --json
manse catalog build ./catalog/catalog.json \
  --out ./apps/hub/app/catalog/catalog.snapshot.json --json
```

The source change must contain only `{ "manifestUrl": "..." }` for the game. The generated snapshot is the reviewed build output.
5. Run repository typecheck, tests, production build, and catalog checks. Inspect the diff for only the expected catalog source and snapshot changes plus an intentionally added release note if required.
6. Prepare a pull-request description with game, creator, source, tested devices, simulator/camera coverage, accessibility limitations, provenance, and safety notes.
7. Show the exact diff and PR text. Opening or pushing a pull request changes external state; ask for explicit approval immediately before doing it unless the user already authorized that exact action.
8. Report the branch/PR URL and CI state. Explain that listing remains pending until CI passes and a maintainer approves it.

## Rejection conditions

Do not submit a private, unreachable, misleading, unlicensed, tracking-enabled, runtime-CDN-dependent, or schema-invalid game. Never add credentials, camera captures, player data, or hand-copied marketing metadata to the catalog.
