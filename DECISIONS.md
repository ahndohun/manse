# Manse decision log

## 2026-07-21

### D001 — Platform, not a single game

Manse is an open-source AR active-game engine and publishing platform comparable in product shape to closed camera-game ecosystems. The reference game proves the platform; it is not the product boundary.

### D002 — ChatGPT Sites is the primary platform surface (superseded by D007)

The initial proposal placed the catalog, player, creator dashboard, and submission flow in one Site. D007 replaces the centralized dashboard and upload service with independent game Sites and a link-only Showcase.

### D003 — Codex is the creator studio

Non-developers create, preview, validate, remix, and publish games through an installable Manse Codex plugin. P0 does not require a project-owned OpenAI API key: authoring uses the active Codex session and available Codex tools. A headless API compiler may be added later as an optional adapter.

### D004 — Data-only portable packs

Version 1 packs contain strict declarative game data and bundled assets. The universal player never executes arbitrary uploaded JavaScript. New engine mechanics require an engine contribution or a separately deployed engine fork.

### D005 — Lightweight staged publishing (superseded by D007)

The initial proposal used centrally uploaded drafts. D007 replaces this with a creator-owned Site, a public manifest, automated catalog checks, and maintainer approval of a small metadata change.

### D006 — Platform storage and identity (superseded by D007)

The initial proposal used D1, R2, and creator identity in the official platform. D007 removes these dependencies from v0.1.

### D007 — Sites-first federated publishing

Every game is a self-contained Site owned and published by its creator. The official Manse Site is a static Showcase that links to those games and never hosts or executes their code. A game exposes a standard public manifest; listing is a small catalog contribution validated by CI and approved by a maintainer. This removes the central upload service, storage, authentication, and moderation backend from v0.1 while making Codex-to-Sites publishing the primary product workflow.

### D008 — Public ChatGPT Sites is the v0.1 judge path

With explicit owner approval, the packaged Showcase was changed from custom
owner access to public access and deployed at
`https://manse-showcase.ran584000.chatgpt.site`. Zero-cookie requests verified
the home, simulator playground, documentation, submission guide, provenance,
and same-origin pose model without a ChatGPT or Manse account. The official
v0.1 experience therefore remains on ChatGPT Sites; no fallback host is needed.

### D009 — One public play-engine package for v0.1

`@manse/runtime-web` is the sole v0.1 play engine. It owns deterministic scene execution, local camera and simulator pose providers, challenge evaluation, rendering, captions, and browser integration behind internal module boundaries. The partial `@manse/engine` and `@manse/pose` packages were removed before release so creators and judges see one coherent runtime contract rather than three independently versioned packages. Their useful P0 work was retained or reimplemented inside `runtime-web`; the baseline commit preserves the discarded drafts for reference.

### D010 — One catalog snapshot contract

The public game manifest is the only source of Showcase metadata. It declares creator and energy alongside the existing discovery fields. The CLI resolves the small source catalog into the versioned `{ manifestUrl, manifest }` snapshot defined by `@manse/schema`, and the Showcase renders that exact checked-in snapshot without fetching creator Sites at runtime. A separate hand-maintained flattened Showcase format was removed to prevent schema and metadata drift.

### D011 — A valid v0.1 pack is executable by runtime 0.1

The version 1 challenge contract admits only `touch_targets`, the mechanic the
released runtime actually executes. Names for jump, squat, freeze, running, and
balance are not reserved inside the public v1 schema: adding one requires a
reviewed engine implementation, deterministic tests, and a compatible schema
release. This prevents the validator and creator plugin from accepting a pack
that the player must reject at runtime.

### D012 — Public discovery metadata describes executable v0.1 mechanics

The v1 game manifest and Showcase movement filter expose only `touch`, matching
the sole `touch_targets` challenge accepted by the v1 pack contract. Seated
play, captions, high contrast, reduced stimulation, and audio cues remain
separate accessibility facets. Future movement names are added only with a
reviewed runtime mechanic and contract release, so catalog metadata cannot
advertise behavior the published engine does not perform.

The signed-out deployed Playground must also complete all three targets before
a Showcase release is accepted. The repository provides a real-browser command
and a manually dispatchable GitHub Actions workflow for this post-deployment
gate; two renderer canvases are expected because the WebGL renderer separates
the camera and overlay layers.
