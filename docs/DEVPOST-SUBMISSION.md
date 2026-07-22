# Devpost submission copy

This file preserves the canonical English copy used for the OpenAI Build Week
submission. The final public links and submission receipt are recorded below.

## Project identity

- **Name:** Manse
- **Tagline:** Open-source motion games, authored in Codex and played in the browser.
- **Track:** Developer Tools
- **Repository:** https://github.com/ahndohun/manse
- **Public Showcase:** https://manse-showcase.ran584000.chatgpt.site
- **No-camera playground:** https://manse-showcase.ran584000.chatgpt.site/playground?provider=simulated
- **Flagship game used in the demo:** https://fire-hose-hero.ran584000.chatgpt.site
- **Public YouTube demo:** https://www.youtube.com/watch?v=yFgUyrsdgfo (2:27)
- **Primary Codex `/feedback` Session ID:** `019f8035-dbb1-7213-8946-84a80b7343f8`
- **Devpost status:** Submitted
- **Devpost submission ID:** `1112468`
- **Submitted at:** `2026-07-21T19:53:11.493-04:00`

## Submission form answers

The project owner must confirm the personal **Submitter Type** and **Country of
Residence** fields. Do not infer either value. Use the following exact answers
for the remaining Build Week fields:

- **Category:** Developer Tools
- **Code repository:** https://github.com/ahndohun/manse
- **Codex `/feedback` Session ID:** `019f8035-dbb1-7213-8946-84a80b7343f8`
- **Judge testing instructions:**

  ```text
  No account, API key, camera, or rebuild is required for the public judge path.
  Open https://manse-showcase.ran584000.chatgpt.site, complete the three-target
  simulator at
  https://manse-showcase.ran584000.chatgpt.site/playground?provider=simulated,
  then open the independent flagship game at
  https://fire-hose-hero.ran584000.chatgpt.site. The repository is public and
  MIT licensed; full local validation is documented in README.md.
  ```

- **Plugin installation and testing instructions:**

  ```text
  Prerequisites: Git, Node.js 22.13+, and the Codex CLI. Run:

  git clone https://github.com/ahndohun/manse.git
  cd manse
  codex plugin marketplace add "$(pwd)"
  codex plugin add manse-creator@manse

  Start a new Codex task and ask Manse Creator to create, preview, and validate
  an active game from a plain-language brief. Creator tooling requires an
  environment where Codex, Git, and Node.js 22.13+ run. Recent desktop Chrome
  or Edge is the primary browser validation target; exact camera support is
  release- and device-specific, and the simulator is the supported camera-free
  fallback. Judges can test the deployed Showcase, simulator, and flagship
  game above without rebuilding anything. See docs/SUPPORTED-PLATFORMS.md for
  the complete support boundary.
  ```

## Short description

Manse turns Codex into an open studio for camera-based active games. A creator
describes a game in plain language, uses the Manse Creator plugin to generate a
self-contained Site around a strict declarative pack, previews it with a
simulator or on-device camera, validates safety and provenance, and publishes
an independent ChatGPT Site. The Showcase is a reviewed index of public
manifests, so creators keep their code, hosting, and license while players open
normal links without a Manse account.

## Inspiration

Camera-based active-play systems can make a television, tablet, laptop, or phone
feel like a game console, but their creation and distribution ecosystems are
usually closed. I wanted the format, engine, tools, and catalog to be open. I
also wanted a teacher, parent, artist, or game designer to publish without first
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
packs that released engines can run; motion games declare the 0.2 contract so
older runtimes reject them cleanly. New mechanics arrive through reviewed engine
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
- Six independently hosted public games demonstrate the full publish-and-list
  loop. Fire Hose Hero is the release-quality flagship: a three-alarm,
  12-fire mission with a continuous hose, reactive targets, score/combo,
  wave timers, authored sound, and explicit victory/failure. The other five
  entries now ship as distinct playable worlds with game-specific renderers,
  reaction states, continuous feedback, progression, and completion moments.
- Generated games begin with an explicit fantasy, physical verb, themed target,
  and three escalating beats. Publication blocks until a game-specific renderer,
  reaction states, continuous feedback, audio, reduced-motion play, and genuine
  gameplay/completion evidence pass the quality contract.
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
3. Follow the flagship link to `https://fire-hose-hero.ran584000.chatgpt.site` and verify that it is an
   independent Site.
4. Inspect `/.well-known/manse-game.json` on that game origin.
5. Install Manse Creator from the repository marketplace using the README steps.
6. Review `DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/PRIVACY.md`, and
   `docs/RELEASE-EVIDENCE.md` for implementation and verification evidence.

No test account, API key, camera, or local build is required for steps 1–4.
