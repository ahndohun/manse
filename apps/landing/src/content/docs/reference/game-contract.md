---
title: Game Site contract
description: Every published Manse game is an independent public Site with a public manifest and a portable pack.
---

A Manse game is an independent public Site. Its runtime, packs, generated assets, and offline resources are bundled with the deployment. There is no runtime CDN or hosted AI dependency.

## The two public files

**Public manifest** at `/.well-known/manse-game.json` declares identity, URLs, engine compatibility, locales, movement, accessibility, license, and provenance.

**Portable pack** at `/packs/<game>/manse.pack.json` holds strict declarative scenes, challenges, localized narration, assets, and adaptation data.

## Version 1 safety boundary

- No arbitrary JavaScript, HTML, or executable WebAssembly in packs.
- All assets use relative in-Site paths and declare origin and license.
- Unknown fields, broken references, and paths escaping the pack root fail validation.
- Permissions are explicit; v0.1 permits camera and device-local storage only.
