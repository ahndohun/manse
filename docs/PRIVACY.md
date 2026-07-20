# Privacy and Safety Model

Manse is designed for camera-based play without turning the camera into a cloud
data source. The official runtime processes video and pose data on the playing
device. The Manse Showcase is a static discovery surface, not an account,
analytics, upload, or game-proxy service.

This document describes the Manse platform contract. Each creator owns the game
Site they publish and is responsible for disclosing any behavior they add beyond
that contract.

## Privacy promises

The official v0.1 engine and starter follow these invariants:

- Camera frames stay in the browser on the playing device.
- Pose landmarks and derived movement events stay on the playing device.
- Manse does not transmit camera frames, pose data, child data, or play history.
- Manse does not add analytics, advertising, user accounts, child profiles,
  leaderboards, or cross-site identifiers.
- Camera access begins only after an explicit player action in setup.
- Closing the game or stopping the camera releases the active media stream.
- A published game does not require GPT-5.6, an OpenAI API key, or another
  runtime AI service.
- Device-local storage is used only for declared local preferences or offline
  runtime data. It is not synchronized by Manse.

There is no Manse privacy-policy consent screen because the platform does not
operate a central player service. The browser remains the authority for camera
permission, and the creator remains the operator of their independent Site.

## Camera lifecycle

The web runtime separates construction from permission. Creating a player does
not open the camera. The real pose path begins only when the player explicitly
chooses to set up camera play and the runtime calls its setup operation.

The expected sequence is:

```text
open public game -> read setup explanation -> choose camera play
                 -> browser permission prompt -> local pose processing
                 -> stop or leave -> tracks released
```

Denial is not an error that justifies hidden retries. A game should explain the
failure and offer its supported non-camera or simulated path. Browsers may
remember or revoke permission independently of Manse.

Creators must not capture screenshots, record video, upload frames, or retain
pose histories unless they intentionally fork the runtime, prominently disclose
the change, establish an appropriate legal basis, and stop representing that
fork as following the standard Manse privacy contract. Such a fork is not
eligible for the official Showcase under the v0.1 rules.

## Data inventory

| Data | Where it exists | Retention in official Manse | Network use |
| --- | --- | --- | --- |
| Camera frames | Browser media pipeline and local memory | Ephemeral while camera is active | None |
| Pose landmarks | Local runtime memory | Ephemeral while a session is active | None |
| Movement outcomes | Local runtime memory | Session-only unless a pack declares a local preference | None |
| Settings such as captions | Browser-local storage when implemented | Until the player clears site data | None |
| Offline app/runtime assets | Browser cache or service worker cache | Browser-controlled | Initial Site download and updates only |
| Game manifest metadata | Creator Site and reviewed Showcase snapshot | Public until updated or delisted | Normal public HTTPS requests |
| Catalog contribution identity | Source-control pull request | Host and repository policy | Source-control workflow only |

The official Showcase does not receive gameplay events. Opening a creator-owned
game is normal navigation to a different Site.

## Player and child safety

Privacy is only one part of safe physical play. Game creators must:

- state the intended age range, movement intensity, space requirements, and
  accessibility options
- avoid asking players to share names, faces, schools, locations, or contact
  details
- provide clear pause, stop, and reduced-movement behavior
- avoid mechanics that encourage collisions, climbing, unsafe jumping, or play
  near traffic and hazards
- provide captions for meaningful spoken instructions and avoid sound-only
  safety cues
- disclose flashing or high-stimulation content and honor reduced-stimulation
  settings supported by the format
- use language appropriate for the declared audience

An adult should prepare a clear play area and supervise children as appropriate.
Manse pose recognition is not a medical device, safety monitor, or substitute
for supervision.

## Declarative-pack boundary

Version 1 packs are strict data. They cannot contain arbitrary JavaScript, HTML,
or executable WebAssembly. Asset references must be relative to the pack,
resolve inside the same Site, and remain inside the pack root. Unknown fields and
undeclared permissions fail validation.

This boundary makes a compatible pack inspectable and limits what content can do
inside the universal runtime. It does not make every image, instruction, or
linked Site semantically safe; automated validation is followed by maintainer
review before a game enters the official Showcase.

New executable mechanics belong in a reviewed engine contribution or an
independently deployed engine fork, not inside a universal data pack.

## Asset provenance

Every uploaded or generated asset must record:

- its origin: original, generated, or third-party
- the creator, generator, or source reference as applicable
- its license and any required attribution
- enough information for a maintainer to trace the declaration

Do not publish unlicensed characters, trademarks presented as endorsements,
music, video, voice recordings, or artwork. Remixing a game does not erase the
original asset licenses or attribution requirements.

Generated assets should record that they were generated through the Codex
workflow. Prompts or other generation metadata may be retained in the project
when appropriate, but they must not contain personal or secret information.

## Showcase trust boundary

The official Showcase:

- stores reviewed metadata and links
- builds a static catalog snapshot after validation
- opens each game as an independent public Site
- does not iframe, proxy, copy, or execute the game
- does not create creator or player accounts

Consequently, a Showcase listing is not a guarantee that a creator can never
change their Site after review. CI verifies the public manifest during listing,
and maintainers can update or remove a catalog entry, but the creator controls
the deployed game. Players should treat the linked Site and source repository as
the authoritative operator and code.

The manifest's game URL and source URL must match the submitted listing. A
creator who materially changes privacy behavior must update the disclosure and
request re-review; a violation can be delisted without taking down the creator's
Site.

## Creator plugin and Codex

Manse Creator runs as a Codex plugin during authoring. Codex can read and modify
the game project, generate assets, run local tools, and help publish when the
creator asks it to. This authoring activity is separate from player runtime.

Creators should:

- review Codex's proposed file and external actions
- never place credentials, private source material, or personal child data in a
  game brief
- keep generated provenance records with the assets
- inspect the final public manifest and Site before submission
- follow the privacy and data terms of the Codex and Sites products they use

The P0 workflow requires no project-owned OpenAI API key. Manse does not embed a
creator's Codex session or credentials into the published Site.

## Self-hosting responsibilities

MIT licensing allows anyone to fork Manse. A self-hoster becomes responsible for
their deployment, logs, headers, dependencies, content review, local law, and
privacy disclosures. To retain compatibility with the official privacy model:

- serve over HTTPS
- keep camera and pose processing local
- do not add telemetry that includes player, camera, pose, or child data
- document every local-storage key and its retention
- bundle runtime dependencies rather than loading an unreviewed runtime CDN
- preserve pack validation and the data-only boundary
- make any material divergence unmistakable to players and catalog reviewers

## Security and privacy reports

Do not include camera captures, personal information, credentials, or child data
in a public issue. Use the private reporting channel identified by the source
repository at `<REPOSITORY_URL>` when release contact details are available.

For a game-specific concern, contact the creator identified by that game's
manifest or source repository. For an official Showcase listing, include the
stable game id and public manifest URL so maintainers can evaluate delisting.
