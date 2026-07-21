# Manse

**Open-source, browser-native motion gaming for everyone.**

Manse is an AR active-game engine, a declarative game format, a Codex creator
plugin, and a public Showcase. It brings camera-based, console-like play to the
web while giving creators an open path from a plain-language idea to their own
published game Site.

```text
idea -> Manse Creator in Codex -> preview -> validate
     -> creator-owned ChatGPT Site -> manifest PR -> Manse Showcase
```

Players follow a normal public link, allow camera access, and play. They do not
need a Manse account, a controller, a subscription, or a runtime AI service.

> **v0.1 status:** active development. This repository is currently focused on
> the platform, engine, starter, validation tools, Showcase, and creator plugin.
> A sample game is intentionally not part of this release slice.

## Release links

Remaining placeholders will be replaced after the corresponding public artifacts exist.

| Artifact | Release value |
| --- | --- |
| Public Showcase | `<SHOWCASE_URL>` |
| Engine/starter playground | `<PLAYGROUND_URL>` |
| Source repository | [github.com/ahndohun/manse](https://github.com/ahndohun/manse) |
| Manse Creator source | [repository marketplace plugin](https://github.com/ahndohun/manse/tree/main/plugins/manse-creator) |
| Devpost demo video | `<DEMO_VIDEO_URL>` |
| Primary Codex `/feedback` Session ID | `<CODEX_SESSION_ID>` |

## What Manse provides

- **Manse Engine** — on-device camera setup, pose input, rendering, challenge
  execution, adaptation, captions, audio, and offline runtime support.
- **Manse Pack Format** — a strict, versioned, data-only contract for scenes,
  challenges, localized content, assets, accessibility, and provenance.
- **Manse Creator for Codex** — guided skills for creating, previewing,
  validating, remixing, publishing, and submitting games without hand-editing
  source.
- **Game starter** — a self-contained Site project that pins a compatible engine
  and bundles its packs, model files, and media for deployment.
- **Manse CLI** — deterministic checks and packaging for creators, CI, and
  maintainers.
- **Manse Showcase** — a static, curated catalog that links to independent game
  Sites. It never proxies or executes third-party game code.

The engine, schemas, validator, starter, plugin, Showcase source, and
documentation are MIT licensed. Creators retain ownership of their games and
choose the license declared in each public manifest.

## The non-developer golden path

The intended creator experience happens in the Codex app:

1. Install **Manse Creator**.
2. Start a new Codex task in a folder where the game project should live.
3. Ask: “Create a gentle 5-minute ocean rescue motion game for ages 6–9, in
   English and Korean.”
4. Review the brief, movement choices, safety notes, and generated asset plan.
5. Ask Manse Creator to preview the game. Use the simulator before enabling a
   camera.
6. Ask it to validate the project. Resolve every blocking schema, accessibility,
   path, and provenance finding.
7. Ask it to publish the game as a public ChatGPT Site and verify the deployed
   manifest.
8. Ask it to prepare a Manse Showcase submission. Open the generated catalog
   change as a pull request.

The creator should not need to write code or obtain an OpenAI API key. Codex is
the studio; Sites is the host; Manse supplies the interoperable game layer.
Publishing availability still depends on the creator's access to ChatGPT Sites.

See [Publishing a game](docs/PUBLISHING.md) for the complete workflow and
[Contributing games](docs/CONTRIBUTING-GAMES.md) for catalog review rules.

## Install Manse Creator

### From the repository marketplace

Until the public marketplace URL above is filled, install from a local checkout:

```bash
git clone https://github.com/ahndohun/manse.git
cd manse
codex plugin marketplace add "$(pwd)"
codex plugin add manse-creator@manse
```

Then start a **new Codex task** so the app loads the plugin's skills. `manse` is
the stable marketplace name declared in `.agents/plugins/marketplace.json`.

### Local plugin development

The repository marketplace points directly to `plugins/manse-creator`. After
changing the plugin, validate it with the local plugin validation workflow,
refresh its cachebuster, reinstall it from the marketplace, and test in a new
Codex task. Do not copy credentials into the plugin or a generated game project.

Inspect `.agents/plugins/marketplace.json` and
`plugins/manse-creator/.codex-plugin/plugin.json` to verify the source being
loaded. Cache invalidation belongs to the Codex plugin-development toolchain,
not to the Manse runtime.

## Developer setup

### Prerequisites

- Node.js 22.13 or newer
- npm with workspace support
- A modern browser for player testing
- A camera only for the real pose path; the simulator is the default test path

```bash
git clone https://github.com/ahndohun/manse.git
cd manse
npm install
npm run validate
```

`npm run validate` runs the repository's implemented typechecks, tests, and
production builds. During active development, a workspace without one of those
scripts is skipped by the root runner; release claims must be based on the
workspace-specific checks that actually ran.

Useful root scripts:

```bash
npm run showcase:dev
npm run showcase:build
npm run typecheck
npm test
npm run build
```

The CLI surface is `manse` from the `@manse/cli` workspace. These are the
intended deterministic commands; run `manse --help` in the built checkout to
confirm availability:

```bash
manse doctor
manse validate ./path/to/game-site
manse manifest ./path/to/game-site
manse pack ./path/to/game-site --out ./release
manse catalog add https://game.example/.well-known/manse-game.json --catalog ./catalog/catalog.json
manse catalog build ./catalog/catalog.json --out ./apps/hub/app/catalog/catalog.snapshot.json
```

Each command supports `--json` for automation. The CLI deliberately has no
central upload or Sites publishing API: Codex performs authoring and Sites
publishing, while the CLI provides reproducible local and CI checks.

## Repository map

```text
apps/
  hub/                    static public Showcase Site
packages/
  cli/                    validation, manifest, catalog, and packaging commands
  runtime-web/            game execution, pose input, rendering, and fallbacks
  schema/                 shared manifest and pack contract
plugins/
  manse-creator/          installable Codex creator/publisher plugin
catalog/                  reviewed public manifest references
docs/                     product, format, publishing, privacy, and support docs
.agents/plugins/          repository marketplace metadata
```

The exact workspace names are defined by their `package.json` files. The schema,
validator, runtime loader, CLI, and publisher must remain on one versioned
contract.

## Architecture at a glance

Every game is an independent, self-contained Site. Its deployed root includes:

```text
/.well-known/manse-game.json
/packs/<pack-id>/manse.pack.json
/packs/<pack-id>/assets/...
```

The public manifest describes the Site, compatibility, discovery metadata,
accessibility, licensing, and content provenance. Packs contain strict
declarative game data. Version 1 packs cannot contain arbitrary JavaScript,
HTML, or executable WebAssembly.

The Showcase stores only reviewed manifest references and a checked-in static
snapshot. It does not provide creator accounts, upload storage, a game proxy, or
a runtime catalog request to third-party Sites.

Read [Architecture](docs/ARCHITECTURE.md) and
[Pack format](docs/PACK-FORMAT.md) for the full contract.

## Privacy and safety

- Camera frames and inferred poses stay on the player's device.
- Manse does not add analytics, accounts, ads, or child profiles.
- Camera access is requested only from an explicit player action.
- Deployed games bundle runtime dependencies and do not require an AI API.
- Packs are data-only, use relative in-Site assets, and cannot escape their pack
  root.
- Every generated or third-party asset records its origin and license.
- Automated validation is followed by maintainer review before official listing.

The Showcase is a discovery layer, not a security sandbox for creator-owned
Sites. Players leave the Showcase when they open a game, and the creator remains
responsible for that Site. Read the complete [privacy model](docs/PRIVACY.md).

## Performance and device support

Manse uses progressive enhancement: choose the best pose and renderer path a
device can sustain, then reduce inference cost and visual complexity before
giving up. The web runtime exposes explicit setup and simulated-provider paths,
and is designed to fall back from WebGL2 to simpler rendering.

“Runs everywhere” is a direction, not an unmeasured guarantee. Browser camera
APIs, embedded smart-TV browsers, external cameras, thermal limits, lighting,
and available compute vary substantially. We publish a verified device matrix
and measured frame/inference rates as testing is completed; unsupported devices
retain a simulator path where practical.

See [Supported platforms](docs/SUPPORTED-PLATFORMS.md) for current requirements,
fallback behavior, and honest claim boundaries.

## Self-hosting

Manse is federated by design:

- A game Site can be built and served by any static-capable HTTPS host, provided
  it exposes the standard manifest, bundles runtime assets, and preserves the
  same-origin pack rules.
- An organization can fork `apps/hub`, maintain its own catalog, and operate an
  independent compatible Showcase.
- A developer can fork the engine to add a new mechanic. Universal v1 packs stay
  data-only; reusable mechanics should be proposed upstream rather than embedded
  as arbitrary pack code.

ChatGPT Sites is the official publishing surface, but it is not a proprietary
runtime dependency. See [Publishing](docs/PUBLISHING.md#self-hosting).

## How Codex and GPT-5.6 are used

Manse treats Codex as the creator-facing IDE:

- interpret a non-developer's brief and make product decisions explicit
- generate a versioned, declarative game project rather than opaque output
- use Codex image generation for original assets and persist provenance
- run deterministic validation and preview tools, inspect failures, and repair
  the project
- publish the independent Site and prepare its small catalog contribution
- remix compatible games while preserving attribution and licenses

GPT-5.6 is meaningfully used inside that Codex workflow for multi-file planning,
schema-constrained authoring, asset direction, iterative debugging, and release
preparation. The published player does **not** call GPT-5.6 at runtime, and
creators do not need a project API key for the P0 workflow.

The primary integration task's `/feedback` Session ID will be recorded as
`<CODEX_SESSION_ID>`.

## Contributing

Platform contributions should start with
[Architecture](docs/ARCHITECTURE.md), the authoritative
[Platform spec](docs/PLATFORM-SPEC.md), and `AGENTS.md`. Material product or
engineering decisions belong in `DECISIONS.md`.

Game listing contributions follow the lightweight process in
[Contributing games](docs/CONTRIBUTING-GAMES.md). A catalog pull request lists a
creator-owned Site; it does not transfer or upload the game into this repository.

## License

Manse platform source is released under the [MIT License](LICENSE). Individual
games and their assets remain subject to the licenses declared by their creators.
