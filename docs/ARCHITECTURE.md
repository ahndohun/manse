# Manse architecture

## Purpose and scope

Manse is an open-source, browser-native platform for creating, publishing, discovering, and playing camera-controlled active games. It is not one game and it is not a central game-hosting service.

The architecture has two equally important paths:

- a **creator path**, in which a person uses the Manse Codex plugin to author and publish a self-contained game Site; and
- a **player path**, in which a person follows a public link and plays locally in a browser without a Manse account or a runtime AI service.

ChatGPT Sites is the primary publishing surface. The format and runtime remain portable to compatible static HTTPS hosts so that hosting does not become a platform gate.

The governing product contract is [PLATFORM-SPEC.md](./PLATFORM-SPEC.md). The material decisions behind this design are D003, D004, and D007 in [`DECISIONS.md`](../DECISIONS.md).

## System context

```text
CREATOR DEVICE                                  PUBLIC WEB

Natural-language brief
        |
        v
Codex + Manse creator plugin
  - project starter
  - generation workflows
  - deterministic validation
  - local preview and simulator
        |
        | publishes a self-contained static build
        v
Creator-owned game Site ----------------------> Public game URL
  - bundled Manse runtime                              ^
  - declarative game packs                            |
  - same-origin assets                                | follows external link
  - /.well-known/manse-game.json                      |
        |                                              |
        | manifest URL                                |
        v                                              |
Catalog contribution -> CI validation -> review -> Static Showcase
                                              - reviewed snapshot
                                              - discovery and filters
                                              - links, never game execution

PLAYER DEVICE

Camera -> browser-local pose pipeline -> game runtime -> rendering and audio
             (frames and derived play data remain on the device)
```

There are three independently deployable units:

1. **The creator plugin** runs at authoring time inside Codex.
2. **Each game Site** is owned, built, and deployed by its creator.
3. **The Showcase** is a static, maintainer-curated discovery Site.

No Manse backend is on the critical path between them.

## End-to-end publishing flow

1. A creator installs the Manse plugin and describes a game in natural language.
2. Codex creates a project from the Manse starter. The plugin supplies current schemas, templates, focused skills, and deterministic scripts.
3. Codex may generate original media. Every asset is written into the project together with origin and license metadata.
4. The creator previews the project locally with either camera input or the simulator.
5. The plugin validates the pack, public manifest, asset graph, provenance, accessibility declarations, and engine compatibility.
6. The creator publishes a self-contained static build to a creator-owned ChatGPT Site. A compatible static HTTPS host can serve the same artifact.
7. The plugin verifies the deployed game URL and `/.well-known/manse-game.json` without relying on a creator login, API key, or local rebuild.
8. The creator submits only the public manifest URL as a catalog contribution.
9. Showcase CI fetches the deployed manifest, validates it again, checks the submitted identity and URLs, and produces a reviewable metadata change.
10. A maintainer performs the v0.1 semantic safety review. After approval, the Showcase is rebuilt from a static reviewed snapshot.
11. A player discovers the game in the Showcase and navigates to the independent game Site to play.

Codex and GPT-5.6 are the authoring factory. They are not runtime dependencies: opening a published game must not require an OpenAI API key or an active generation session.

## Deployment and ownership boundaries

### Creator plugin

The creator plugin is the studio layer. It may create and edit source files, invoke Codex image generation, run local commands, and coordinate publishing with the creator's authorization. It is trusted authoring-time tooling, not a sandbox for arbitrary third-party packs.

The plugin owns workflow orchestration but does not invent a second game contract. Its templates, scripts, validator, runtime loader, and publisher all consume the same versioned schemas.

### Creator-owned game Site

A game Site owns its URL, source repository, deployment history, runtime, packs, generated assets, and cache. The deployed artifact contains everything required to play:

- a pinned compatible Manse runtime;
- one or more strictly declarative packs;
- pose model and runtime assets required by that build;
- images, audio, fonts, captions, and localization files; and
- the public Manse game manifest.

The deployment must not load the Manse engine from a runtime CDN. Build-time package dependencies are allowed; the resulting Site must be self-contained.

The creator controls the Site and remains responsible for its declared license and content. Delisting a game removes a Showcase reference; it does not delete or take ownership of the creator's deployment.

### Static Showcase

The Showcase is deliberately smaller than an app store backend. It contains documentation and a versioned catalog of approved manifest references. During its build, those manifests are resolved, validated, normalized, and emitted as a static reviewed snapshot.

At runtime the Showcase:

- serves only repository-reviewed metadata;
- displays links to the independent game and its source;
- does not make a live catalog request to creator Sites;
- does not upload, proxy, or copy game code;
- does not iframe third-party games; and
- has no creator account, database, publishing token, or moderation API.

This design keeps an unavailable or compromised creator Site from becoming a code-execution path inside the Showcase. It also makes the catalog reproducible from source control.

## Contracts and schema versioning

Manse has four related data contracts:

| Contract | Location or role | Consumer |
| --- | --- | --- |
| Game manifest | `/.well-known/manse-game.json` on each deployed game Site | publisher verification, catalog CI, Showcase build |
| Game pack | `manse.pack.json` within a game project | validator and browser runtime |
| Asset provenance | `provenance.json` and manifest asset metadata | validator, reviewer, and downstream remix workflows |
| Showcase catalog | versioned manifest references in the Manse repository | catalog builder and CI |

Each contract carries an explicit schema version. Engine compatibility is declared separately so a format revision and a runtime feature revision do not have to move together.

The versioning rules are:

1. Validators select a schema by its declared version; they never guess from object shape.
2. Version 1 schemas are closed. Unknown fields, missing required fields, invalid references, or unsupported versions fail validation.
3. A structural addition or semantic change requires a new explicit schema version. Existing field meanings are not silently redefined.
4. The pack schema, validator, runtime loader, starter, CLI, and creator plugin are released as one compatibility contract.
5. A game build pins a compatible engine version and records it in the public manifest.
6. Migrations, when provided, are explicit and deterministic. They create reviewable project changes and never mutate a deployed game automatically.
7. The runtime validates a pack before execution even when the project was validated at build time. Failure is closed and user-readable.
8. Catalog CI revalidates the public deployment rather than trusting locally supplied metadata.

Version 1 packs are data only. They cannot contain JavaScript, HTML, executable WebAssembly, or paths that escape the pack root. All scene and asset references must resolve, all asset paths must remain relative to the Site, a terminal scene is required, localized narration must map to declared audio when audio is present, and uploaded or generated assets must declare provenance and licensing.

New mechanics that require executable code belong in the open-source engine or in a separately deployed engine fork. They do not enter the universal pack format by disguising code as data.

## Runtime architecture

The browser runtime separates deterministic game logic from browser and device integration.

```text
Browser APIs                    Runtime adapters                 Pure game core

getUserMedia -----> Pose provider and scheduler -----> normalized PoseFrame
                          |                                  |
requestAnimationFrame -> latest-frame buffer                 v
                          |                       challenge evaluation
pointer/replay ----------> simulator input       scene graph and adaptation
                                                             |
WebGL/Canvas <----------- renderer and effects <-------------+
Web Audio/DOM <---------- audio, captions, controls
Cache API <-------------- optional offline asset cache
```

The core consumes normalized input and pack data. It does not own camera permission prompts, DOM nodes, or a specific pose model. This permits deterministic tests and a first-class simulator path while allowing browser adapters to evolve independently.

The runtime supports two input families:

- **Camera input**, where a local pose provider turns frames into normalized landmarks; and
- **Simulator input**, where pointer, keyboard, or recorded deterministic frames exercise the same engine contract without a camera.

The simulator is a supported judge, creator, accessibility, and test path. It must not be implemented as a separate game engine.

## Performance design

Manse aims for a console-like experience across phones, tablets, computers, and camera-capable televisions, but support claims must be earned through measured device results rather than universal browser promises. The current evidence and limitations belong in [SUPPORTED-PLATFORMS.md](./SUPPORTED-PLATFORMS.md).

The runtime uses the following performance strategy:

- **Decouple rendering from inference.** Rendering follows the display clock while pose inference runs at a device-appropriate rate. The renderer always consumes the newest complete pose result instead of queueing stale frames.
- **Bound latency before maximizing throughput.** Camera, inference, and render queues are kept shallow. Dropping an obsolete pose frame is preferable to showing a delayed response.
- **Adapt workload by capability.** A local capability tier selects model variant, camera resolution, inference cadence, effect density, and other designer-approved limits. Sustained missed budgets cause a conservative downgrade; tiers do not oscillate on short spikes.
- **Stabilize pose data.** Confidence gating, coordinate normalization, smoothing, and short bounded extrapolation reduce visible jitter while preserving responsive movement. These values live in configuration, not UI component literals.
- **Keep hot paths allocation-aware.** Pose frames and render state use stable data shapes, and expensive asset decoding or model initialization stays outside the frame loop.
- **Bundle and preload intentionally.** Required model files and game assets are same-origin build artifacts. Critical assets are loaded before play; optional media and effects may load lazily.
- **Degrade explicitly.** If a preferred backend or model cannot initialize, the runtime tries a declared lower tier. If camera access is unavailable, it offers the simulator or a clear recovery path instead of silently failing.
- **Measure locally.** Debug instrumentation can expose render rate, inference rate, input age, tier, and confidence on the device. Manse does not transmit those measurements as analytics.

Quality controls operate on normalized landmarks and confidence, not raw camera pixels. Pack authors configure game feel and challenge thresholds through validated pack data within engine-defined safe ranges.

## Trust, security, and data boundaries

### Boundary summary

| Boundary | Untrusted material | Enforcement |
| --- | --- | --- |
| Codex authoring workspace | natural-language instructions and generated or imported assets | plugin workflows, deterministic validation, provenance records, creator review |
| Game pack loader | pack JSON and all referenced asset paths | strict versioned schema, root-confined relative paths, reference and media checks, no executable pack content |
| Catalog CI | remote manifest, redirects, URLs, and display metadata | public HTTPS requirement, bounded fetches, schema and identity checks, safe media policy, reviewable output |
| Showcase UI | catalog text, thumbnails, and outbound URLs | static normalized snapshot, escaped rendering, no iframe or copied executable content |
| Player browser | creator-owned game code and camera permission | browser origin isolation, explicit permission, local processing, no Manse account or analytics backend |

### Player privacy

Camera frames are consumed only by the pose pipeline in the player's browser. Manse does not upload, persist, or proxy frames. Derived pose and child play data also remain on the device. Version 1 permits only camera access and device-local storage in the pack permission model.

Local storage is for explicit device settings or local progress, not identity. The v0.1 platform has no player account, cross-site profile, tracking pixel, telemetry collector, or advertising identifier. See [PRIVACY.md](./PRIVACY.md) for the user-facing privacy contract.

### Remote metadata and independent Sites

A public manifest is untrusted remote data until CI validates it. Catalog tooling must apply network timeouts, response-size limits, redirect limits, HTTPS requirements, and safe content-type handling. Validation must not execute fetched content.

Maintainer approval is intentionally required after automated checks. Schema validation can prove structural conformance; it cannot determine whether a game's theme, movement instructions, age claim, licensing statement, or external Site behavior is appropriate.

A Showcase listing is a reviewed discovery link, not a security sandbox or ownership transfer. Players navigate to a creator-controlled origin. The Showcase makes that boundary visible and provides the source and license links required for informed review.

## Repository component boundaries

| Path | Responsibility | Must not own |
| --- | --- | --- |
| `packages/schema` | canonical manifest, pack, provenance, and catalog schemas; types; fixtures; strict validation primitives | browser UI or publishing side effects |
| `packages/engine` | deterministic scene execution, challenge evaluation, adaptation, and content-neutral game state | DOM, camera permission, or hosting code |
| `packages/pose` | pose-provider contracts, scheduling, confidence handling, smoothing, extrapolation, and capability tiers | game-specific rules or network telemetry |
| `packages/runtime-web` | browser composition: camera and simulator adapters, renderer, audio, captions, asset loading, and offline integration | schema forks or creator accounts |
| `packages/cli` | deterministic project, validation, preview, catalog, and publishing-support commands used by people and plugin skills | hidden remote state or required credentials in source |
| `plugins/manse-creator` | Codex plugin manifest, focused creator skills, scripts, and starter assets | a private game format or runtime AI service |
| `apps/hub` | static official Showcase and platform documentation surface | databases, authentication, game proxying, or third-party code execution |
| `catalog` | reviewed manifest references and reproducible static snapshot inputs | game bundles or mutable creator data |
| `.github/workflows` | contract, fixture, catalog, build, and contribution gates | semantic approval without a maintainer |
| `docs` | product contract, architecture, publishing, privacy, platform support, and contribution guidance | divergent executable schemas |

`packages/engine` and `packages/runtime-web` are deliberately separate, not duplicate engines: the former is device-independent logic, while the latter is the browser runtime that composes it with pose input and presentation.

## Self-hosting and portability

All Manse-owned engine, schema, validator, starter, plugin, Showcase, and documentation source is MIT licensed. A self-hoster can:

- publish a generated game build on ChatGPT Sites or another static HTTPS host;
- fork the starter and pin a compatible Manse engine release;
- operate an independent Showcase over compatible public manifests;
- install the creator plugin from a repository marketplace or local checkout; and
- extend the engine without depending on an official Manse service.

A compatible game host needs only static-file delivery over HTTPS, a public game URL, a manifest at the well-known path, correct MIME types, and browser camera permissions where camera play is offered. Anonymous public access is a release gate and must be tested from a clean logged-out session; it must not be inferred from a successful owner preview.

ChatGPT Sites is the preferred workflow because it makes Codex-to-published-Site creation direct. If a Sites configuration cannot meet anonymous public access for a deployment, the same static artifact can use another compatible host without changing the pack or catalog contracts.

The official Showcase is curated, but it is not a hosting gatekeeper. A valid game remains directly playable and another compatible catalog may list it whether or not it appears in the official catalog.

## Failure isolation

- A failed creator deployment affects its outbound link, not the Showcase build already on the public web.
- A malformed manifest cannot enter the catalog snapshot because CI validates before review.
- A malformed pack cannot execute because the browser loader validates before starting the engine.
- A slow inference backend can downgrade without stalling the render clock.
- Loss of network after required assets are available does not introduce an AI or engine-CDN dependency.
- Loss or denial of camera permission does not prevent simulator-based preview and evaluation.

## Explicit v0.1 non-goals

The following are outside this architecture for version 0.1:

- central game uploads, object storage, creator databases, or Manse accounts;
- a custom publishing token or Manse publishing API;
- ratings, comments, payments, subscriptions, social feeds, or leaderboards;
- iframe execution of third-party games inside the Showcase;
- arbitrary executable code in universal game packs;
- fully automated semantic moderation;
- real-time multiplayer;
- a hosted AI generation service or required creator API key; and
- a guarantee that every browser, camera, or smart television meets the same performance tier.

These exclusions keep the open contracts, local runtime, creator workflow, and federated publishing path coherent. Later services may be added as optional layers, but they must not make existing self-contained games or open manifests dependent on a Manse-operated backend.
