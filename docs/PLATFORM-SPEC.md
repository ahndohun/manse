# Manse Platform Spec — v0.1

## Product statement

Manse is an open-source AR active-game engine, game format, Codex creator plugin, and public Showcase. It gives players a console-like camera game experience in a browser and lets non-developers publish their own games as independent ChatGPT Sites.

Manse does not reimplement hosting. Sites is the publishing platform; Manse supplies the interoperable game layer and discovery surface:

```text
idea -> Manse Codex plugin -> game project -> preview and validation
     -> creator-owned ChatGPT Site -> public Manse manifest -> Showcase listing
```

## North-star acceptance test

A new creator can install the Manse Codex plugin, describe a game in natural language, preview it, and publish a public game Site without editing source code. The plugin then prepares a valid Showcase entry for the deployed URL. A player can open the game directly and play without an account, rebuild, or runtime AI dependency.

## Personas

- **Player:** discovers a game in the Showcase and follows its link to play; no account required.
- **Creator:** uses Codex to create, preview, validate, publish, and submit a game listing.
- **Maintainer:** reviews a small catalog contribution after automated checks pass.
- **Self-hoster:** forks the MIT repository and operates an independent engine template or Showcase.

## Platform components

### 1. Manse Showcase Site

The official ChatGPT Site is intentionally small:

- a public catalog of approved games
- filters for movement, age range, language, energy, and accessibility
- clear links to creator-owned game Sites and source repositories
- engine, format, plugin, and publishing documentation
- a contribution guide for listing a game

The Showcase stores only reviewed metadata in the repository. It does not upload assets, proxy games, iframe untrusted game code, create creator accounts, or operate a publishing API.

### 2. Creator-owned game Sites

Each published game is a standalone Sites project generated from the Manse starter. It owns its runtime, packs, generated assets, PWA cache, URL, and deployment history.

Every game Site exposes:

```text
/.well-known/manse-game.json
```

The manifest lets the Showcase and CI discover the title, summary, creator, energy, game URL, source URL, engine version, locales, age range, movement tags, accessibility flags, thumbnail, license, and content provenance.

### 3. Manse Engine

The shared browser engine owns camera setup, pose input, rendering, challenge primitives, episode execution, adaptation, captions, audio playback, and offline caching. Camera frames never leave the playing device.

The game starter pins a compatible engine version and bundles everything needed to play. A fast creator path may consume the engine as a build dependency, but the deployed Site must not require a runtime CDN.

### 4. Manse Pack Format

A game Site can contain one or more portable packs:

```text
public/packs/my-game/
├── manse.pack.json
├── assets/
│   ├── images/
│   └── audio/
└── provenance.json
```

`manse.pack.json` contains metadata, supported locales, engine compatibility, cast, assets, a scene graph, challenges, learning moments, accessibility hints, and adaptive parameters.

Version 1 constraints:

- strict closed schema; unknown fields fail validation
- data only; no arbitrary JavaScript, HTML, or executable WebAssembly in a pack
- all scene and asset references resolve
- an explicit terminal scene is required
- every localized narration item maps directly to its audio asset when audio is present
- assets use relative in-Site paths
- file paths cannot escape the pack root
- every generated or third-party asset declares origin and license
- pack permissions are closed and explicit; P0 permits camera and device-local storage only

### 5. Manse Creator for Codex

The installable plugin bundles focused skills, deterministic scripts, templates, and the current schemas:

- `create-game` — turn a natural-language brief into a Manse game Site
- `generate-assets` — create original art with Codex image generation and record provenance
- `preview-game` — run the simulator and local browser preview
- `validate-game` — run game, manifest, accessibility, and asset checks
- `remix-game` — create a new attributed game from a compatible source
- `publish-game` — publish the project with Sites and verify the public manifest
- `submit-to-showcase` — add the deployed manifest URL to the catalog contribution format

Codex is the creator studio and Sites is the host. P0 does not require an OpenAI API key, Manse account, or central upload token.

## Lightweight listing and safety boundary

The creator plugin validates before deployment. Showcase CI validates the public deployment again before a listing can merge.

Automated P0 checks:

- public HTTPS game and manifest URLs are reachable
- manifest schema and engine compatibility
- unique stable id and slug
- source repository and license are present
- required accessibility and content disclosure fields
- thumbnail URL and media type are safe to display
- no executable content is copied into the Showcase
- the game URL and source URL match the submitted manifest

Public listing flow:

```text
publish game Site -> verify manifest -> add catalog entry
                  -> CI passes -> maintainer review -> Showcase deploy
```

Maintainer review is the v0.1 semantic safety check. Delisting is a catalog change; the creator's Site remains under the creator's control.

## Catalog format

The Showcase repository contains a small versioned catalog, for example:

```json
{
  "schemaVersion": 1,
  "games": [
    {
      "manifestUrl": "https://example.chatgpt.site/.well-known/manse-game.json"
    }
  ]
}
```

The catalog build resolves and validates manifests, then emits a static reviewed snapshot for the Showcase. The production Site does not depend on a live third-party catalog request.

## Open-source boundary

The engine, schemas, validators, starter, creator plugin, Showcase source, reference games, and documentation are MIT licensed. Every game is owned and deployed by its creator subject to its declared license.

Anyone can fork the starter or operate another compatible Showcase. The official Manse Showcase is a curated discovery layer, not a hosting gatekeeper.

## P0 deliverables

1. Versioned public game manifest and pack schemas with valid and invalid fixtures
2. Validator and static catalog build
3. Sites-compatible game starter with simulator, camera path, and offline runtime
4. A content-neutral engine playground and a remixable Sites game starter
5. Installable repo-marketplace Manse Codex plugin
6. Natural-language create, preview, validate, Sites publish, and Showcase-submit workflow
7. Static Manse Showcase ready to list independently deployed game Sites
8. Public judge URLs that work without rebuilding or API keys
9. MIT license, installation guide, supported-platform matrix, architecture, privacy, asset provenance, and contribution documentation

## Explicit non-goals for v0.1

- central game uploads, object storage, creator database, or Manse accounts
- custom publishing tokens or a Manse publishing API
- ratings, comments, payments, subscriptions, social feeds, or leaderboards
- iframe execution of third-party games inside the Showcase
- arbitrary pack code in the universal engine
- fully automated semantic moderation
- real-time multiplayer
- a hosted AI generation service or required creator API key
