# Devpost submission copy

This file is the canonical English copy-paste draft for the OpenAI Build Week
submission. Replace every angle-bracket placeholder and re-read all claims
against the final video and deployed build before submitting.

## Project identity

- **Name:** Manse
- **Tagline:** An open-source motion-game engine and Codex publishing pipeline for every screen.
- **Track:** Developer Tools
- **Repository:** https://github.com/ahndohun/manse
- **Public Showcase:** https://manse-showcase.ran584000.chatgpt.site
- **No-camera playground:** https://manse-showcase.ran584000.chatgpt.site/playground?provider=simulated
- **Creator game used in the demo:** `<OWNER_GAME_URL>`
- **Public YouTube demo:** `<DEMO_VIDEO_URL>`
- **Primary Codex `/feedback` Session ID:** `<CODEX_SESSION_ID>`

## Short description

Manse turns Codex into an open studio for camera-based active games. A creator
describes a game in plain language, uses the Manse Creator plugin to generate a
strict declarative project, previews it with a simulator or on-device camera,
validates safety and provenance, and publishes an independent ChatGPT Site. The
official Showcase is only a reviewed index of public manifests, so creators own
their code, hosting, and license while players open normal links without a
Manse account.

## Inspiration

Camera-based active-play systems can make a television, tablet, laptop, or phone
feel like a game console, but their creation and distribution ecosystems are
usually closed. We wanted the format, engine, tools, and catalog to be open—and
we wanted a teacher, parent, artist, or game designer to publish without first
becoming a web developer.

## What it does

Manse provides four interoperable layers:

1. A browser-native engine that evaluates movement locally and keeps camera
   frames and inferred pose data on the playing device.
2. A strict, versioned, data-only game-pack format. Public packs cannot execute
   uploaded JavaScript or escape their own asset roots.
3. Manse Creator, an installable Codex plugin with workflows to create, generate
   assets, preview, validate, remix, publish, and prepare a Showcase submission.
4. A public, link-only Showcase. Every listed game remains an independent,
   creator-owned Site and passes deterministic CI plus maintainer review.

The engine ships nine honest mechanics — touch, freeze, body zones, squats,
pose matching, jumps, speed strikes, dance steps, and sequenced combos — each a
declarative, designer-tunable pack primitive judged body-relatively (ratios of
the player's own torso and joint angles, never pixels) and verified by
deterministic camera-free replay fixtures. Touch games remain schemaVersion 1
packs any released engine runs; motion games declare the 0.2 contract so older
runtimes reject them cleanly. New mechanics arrive through reviewed engine
contributions instead of allowing executable code in untrusted packs.

## How we built it

The schema, CLI validator, runtime loader, generated starter, creator plugin,
catalog builder, and Showcase share one versioned contract. Generated games
bundle the runtime, pose model, WebAssembly, packs, and media in their own Site,
so play does not require a CDN, OpenAI API key, or runtime model call.

The engine separates pose input from rendering and challenge evaluation. That
makes the deterministic simulator both the fastest judge path and the same
engine path used by camera play. The Showcase builds a checked-in snapshot from
reviewed public manifests; it never proxies, iframes, or executes creator code.

## How Codex and GPT-5.6 were used

Codex with GPT-5.6 was the primary engineering and creator environment. It was
used for product reframing, multi-package architecture, schema-constrained
authoring, test generation, visual and interaction iteration, privacy review,
debugging, release validation, and Sites packaging. Timestamped commits and the
decision log show the major choices made during Build Week.

The same collaboration model is part of the product. Inside Manse Creator,
GPT-5.6 interprets a non-developer's brief, plans safe movement and original
assets, authors declarative content across multiple files, runs deterministic
checks, repairs failures, and guides publishing. In short: GPT-5.6 is the
factory; the browser is the product. A published game makes no GPT request at
play time.

## Challenges and decisions

The largest product decision was removing a central upload service, account
system, and hosted game runner from v0.1. Instead, creators publish independent
Sites and contribute only a manifest URL. This reduced privacy and moderation
risk, made self-hosting real, and kept ownership with creators.

We also chose data-only packs over arbitrary extensions, one canonical runtime
over overlapping engine packages, fixed hashes for bundled pose assets, and a
simulator-first judge path. We explicitly avoid claiming universal device or
recognition support before completing a measured hardware matrix.

## Accomplishments

- A fresh creator project can be generated, installed, typechecked, tested,
  built, and validated outside the monorepo.
- Valid and intentionally invalid manifests and packs exercise the same public
  contract used by the CLI, runtime, plugin, and Showcase.
- Pose models and WebAssembly are bundled with fixed provenance and SHA-256
  verification; camera and child data are not transmitted by Manse.
- The repository marketplace exposes seven complete creator workflows rather
  than demo-only instructions.
- The public judge path requires no rebuild, camera, account, or API key.

## What we learned

The open ecosystem is more important than any one game. A small, strict contract
plus independent hosting creates a useful boundary: creators can own and remix
content, players can follow ordinary links, and the official catalog can remain
curated without becoming a surveillance or execution platform.

We also learned that simulator quality is product quality. It makes authoring,
CI, accessibility evaluation, and judging reliable while preserving the real
camera path for play.

## What's next

After v0.1, we plan to publish a measured device matrix, add reviewed reusable
movement primitives, improve calibration and renderer fallback, harden catalog
moderation, and invite creators to publish independent games and engine
extensions. The contracts and platform remain MIT licensed and self-hostable.

## Judge test path

1. Open `https://manse-showcase.ran584000.chatgpt.site` without signing in.
2. Open `https://manse-showcase.ran584000.chatgpt.site/playground?provider=simulated` and complete the target
   sequence with mouse or touch input.
3. Follow the creator-game link to `<OWNER_GAME_URL>` and verify that it is an
   independent Site.
4. Inspect `/.well-known/manse-game.json` on that game origin.
5. Install Manse Creator from the repository marketplace using the README steps.
6. Review `DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/PRIVACY.md`, and
   `docs/RELEASE-EVIDENCE.md` for implementation and verification evidence.

No test account, API key, camera, or local build is required for steps 1–4.
