# Manse Pack Format v1

This document defines the portable, data-only content boundary for Manse games. It is written for creator-tool authors, game-site maintainers, and engine implementers.

The machine-readable schemas and validators shipped by `@manse/schema` are authoritative. This document explains their contract and the integrity rules that cannot be expressed by JSON shape alone. When this guide and a released schema disagree, the released schema for the declared `schemaVersion` wins.

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative.

## Two public JSON contracts

A published Manse game Site exposes two different kinds of document. They have different audiences and must not be treated as interchangeable.

| Contract | Canonical location | Consumer | Purpose |
| --- | --- | --- | --- |
| Public game manifest | `/.well-known/manse-game.json` | Showcase build, catalog CI, people inspecting the Site | Describes the deployed game and where it can be played and audited |
| Game pack | `public/packs/<id>/manse.pack.json` in source; emitted at the equivalent public Site path | The game Site's bundled Manse runtime | Describes scenes, challenges, narration, assets, accessibility, and adaptation as declarative data |

The public manifest is the discovery and listing contract. It describes such public facts as the title, summary, game URL, source URL, engine version, locales, age range, movement tags, accessibility flags, thumbnail, license, and content provenance. Catalog CI fetches this document over HTTPS. The Showcase stores a reviewed snapshot of its metadata and links to the independent game Site; it does not proxy or execute the game.

The pack is the runtime content contract. It is not a listing submission, an application bundle, or an extension mechanism. A manifest MAY describe a Site that contains more than one pack, but it MUST NOT embed executable content or turn the Showcase into a pack host.

## Required pack layout

Each pack has its own root directory:

```text
public/packs/<id>/
├── manse.pack.json
├── provenance.json
└── assets/
    ├── images/
    └── audio/
```

`<id>` is the pack's stable identifier. Creator tools SHOULD keep the directory name and the identifier declared by the pack aligned so that errors and public URLs remain understandable.

The published game Site MUST contain the pack, every referenced asset, and the compatible Manse runtime. A deployed game MUST NOT depend on a runtime CDN. The pack and its assets remain owned and hosted by the creator's Site.

`provenance.json` is the pack-level provenance ledger. Asset ownership metadata is also part of the validated asset contract. Creator and publishing tools MUST keep the ledger and the asset declarations consistent; they MUST NOT silently discard provenance while copying, remixing, or optimizing assets.

## Data-only safety boundary

Version 1 is a strict declarative format.

- A pack MUST be valid JSON and MUST match the closed schema for its declared version.
- Unknown object properties MUST fail validation.
- A pack MUST NOT contain or cause the universal engine to execute arbitrary JavaScript, HTML, or WebAssembly.
- A pack MUST NOT use a URL or path as a way to import executable behavior.
- The runtime MUST validate a pack before creating a playable session and MUST fail closed if validation or integrity checks fail.

The data-only restriction applies to portable packs. A normal game Site necessarily contains the bundled Manse application code that renders and runs validated data. A new reusable mechanic belongs in the Manse engine and its schema. A creator who needs arbitrary custom code can publish a separately reviewed engine fork, but that code does not become a portable v1 pack and is never executed by the universal Manse runtime or the Showcase.

## Versioning and compatibility

Version 1 documents declare `schemaVersion: 1`. Schema versioning and engine compatibility solve different problems:

- `schemaVersion` selects the exact document grammar and integrity contract.
- Engine compatibility states which Manse runtime can safely execute the pack.
- The public manifest reports the engine version used by the deployed Site for discovery and review.

Readers MUST reject unsupported schema versions. They MUST NOT guess at the meaning of a newer document, ignore unknown fields, or partially run it. Creator tools SHOULD migrate an older document as an explicit authoring step, validate the migrated result, and preserve source and asset attribution. A migration MUST NOT change the original artifact in place without the creator's knowledge.

The schema, validator, runtime loader, and publisher MUST be released against the same versioned contract. Pinning only an engine package while generating a pack from an unrelated schema version is not a compatible publication.

## Asset addressing and origin

Every asset path in a pack MUST be a relative path inside that pack's root. When resolved for play, it MUST remain on the game Site's origin.

Valid paths are plain relative path segments. Validators reject, at minimum:

- absolute paths and absolute URLs
- `.` or `..` path segments
- empty path segments
- backslashes and platform drive prefixes
- encoded traversal or separator sequences
- query strings and fragments
- any resolution that escapes the pack root

Pack asset declarations MUST NOT reference a runtime CDN, a creator's local filesystem, a temporary generation URL, or a third-party media host. External public URLs belong only in schema fields that explicitly permit them, such as source and license records; they are not asset paths.

The v1 asset contract has closed media-type sets. The current schema accepts PNG, JPEG, WebP, and AVIF images, and MPEG audio, Ogg audio, WAV, and MP4 audio. Implementations MUST use the released schema as the definitive media-type list rather than inferring support from a file extension. Procedural music declarations are data interpreted by the engine and are subject to the same ownership and provenance requirements as uploaded media.

Publishers MUST verify that referenced local files exist. Publication artifacts MUST reject symbolic links, special files, unsafe paths, and names that collide under common case-insensitive filesystem rules. Asset optimization MAY change bytes or formats only if the declaration and provenance ledger are updated and the complete pack is validated again.

## Asset identifiers, references, and integrity

Schema validation proves that individual values have an allowed shape. Pack integrity validation proves that the values form one runnable graph. Both are required.

A conforming validator MUST verify at least the following:

1. Identifiers that share a namespace are unique.
2. The declared entry scene resolves.
3. Every transition target resolves to a scene.
4. Every referenced image, audio item, cast member, and other declared resource resolves in the appropriate collection.
5. Every declared asset path stays within the pack root and its file exists at publication time.
6. At least one explicit terminal scene is present and is reachable through the scene graph.
7. Narration and optional audio satisfy the locale and direct-mapping rules below.
8. Asset provenance and license declarations are complete and consistent with `provenance.json`.
9. Permissions contain only capabilities supported by the declared schema version.

The validator SHOULD report stable diagnostics with both the source file and a JSON Pointer when possible. A runtime MUST NOT compensate for a broken reference by skipping content, selecting an arbitrary asset, or treating the malformed scene as successful.

## Scene graph and terminal scenes

A pack declares one entry scene and a finite graph of scenes connected by outcome transitions. Transition names, scene kinds, challenge kinds, and adaptive parameters are closed enums defined by the schema.

Every transition from a non-terminal scene MUST name an existing target scene. A terminal scene explicitly ends the episode and MUST NOT require an outbound transition. Reaching it causes the runtime to complete the session cleanly; it is not an error path or an implicit missing target.

At least one terminal scene MUST be reachable from the entry scene. Creator tools SHOULD make all authored scenes reachable and SHOULD warn about outcome paths that cannot reach a terminal scene. The canonical validator remains the authority for which graph findings are errors in a particular schema release.

The exact JSON representation of terminal state is defined by the released schema. Authors SHOULD use the Manse creator plugin or generated schema rather than copying field names from prose documentation.

## Localized narration and audio

Pack locales describe content the creator has actually supplied; they are not a request for the runtime to translate content. All player-facing narration and captions MUST use supported locale identifiers from the schema.

Audio is optional, but its relationship to narration is never implicit:

- When a localized narration item has audio, it MUST map directly to one declared audio asset.
- The referenced audio asset MUST resolve and its locale MUST match the narration locale.
- The audio transcript MUST represent the associated spoken content.
- Implementations MUST NOT pair independent text and audio arrays by position, filename convention, or best-effort locale fallback.
- Missing optional audio MUST result in a captioned/text presentation, not a reference to a nonexistent file.

This one-to-one rule lets validators catch stale speech after copy edits and lets the runtime choose a locale without guessing. Creator tools MUST update or remove an audio mapping when its narration changes.

## Provenance and licenses

Every uploaded, generated, or third-party asset MUST carry a license record and one provenance variant. The current asset contract distinguishes:

- **Original:** creator identity and creation time.
- **Generated:** generation tool, model, prompt, and generation time.
- **Third-party:** original creator, HTTPS source URL, and retrieval time.

License records use an SPDX identifier together with a readable name and the schema's optional source and attribution values. Attribution is not optional in practice when the selected license requires it. A creator MUST have the right to publish every asset under the declared terms.

Remixing does not erase history. A remix tool MUST preserve inherited origin and license information, record provenance for new or transformed assets, and surface incompatible license terms to the creator instead of silently republishing them. Generated assets MUST retain the generation metadata needed for the repository and submission audit.

## Permissions and privacy

Permissions are a closed, explicit declaration. Version 1 permits only:

- `camera`
- `deviceLocalStorage`

Both values are booleans in the current schema. A value of `true` declares that the experience may use the capability; it does not grant browser permission. The game Site MUST still request camera access through the browser at an appropriate user action and MUST remain understandable when permission is unavailable, including a simulator path where provided by the Site.

A v1 pack cannot request microphone, location, contacts, account identity, analytics, arbitrary network access, or another undeclared capability. The engine MUST NOT transmit camera frames or child data. Player profiles, preferences, and session data MUST remain device-local. Pack validity never overrides the browser permission model or Manse's privacy invariants.

## Validation pipeline

Creator tools and CI use the same contract at different trust boundaries:

1. **Authoring:** the Manse Codex plugin creates or edits a pack and records asset provenance.
2. **Schema validation:** the document is parsed with the exact closed schema selected by `schemaVersion`.
3. **Integrity validation:** identifiers, references, scene termination, localization, permissions, paths, files, provenance, and compatibility are checked together.
4. **Preview:** the bundled runtime loads the validated pack in simulator and, where available, camera modes.
5. **Publication:** the publisher produces a self-contained game Site, validates the emitted artifact again, and exposes the public manifest.
6. **Listing:** Showcase CI fetches and validates the public manifest; a maintainer then approves the catalog change.

Pack validation does not imply Showcase approval. Automated validation establishes structural and technical safety; maintainer review is the v0.1 semantic content gate.

## Implementation guidance

Use the exported parsers and integrity validator from `@manse/schema` rather than maintaining a second handwritten interpretation. The same rule applies to JSON Schema consumers: use the generated schema artifact for the declared version and do not loosen `additionalProperties` behavior.

Test at least one valid fixture and intentionally invalid fixtures for unknown properties, unsupported versions, unsafe paths, unresolved references, malformed terminal graphs, narration/audio mismatches, incomplete provenance, undeclared permissions, and executable-content attempts. A fixture is test data, not a sample game or a substitute for creator documentation.

Any JSON fragments shown in secondary guides or generated plugin messages are illustrative unless they are emitted directly from the released schema. The schema and conformance fixtures are the source of truth for exact field names, required properties, bounds, and enums.
