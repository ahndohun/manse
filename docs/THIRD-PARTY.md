# Third-party software and assets

Manse platform source is MIT licensed. This document records the external
software and runtime assets used by the v0.1 repository. It is an inventory,
not a replacement for each dependency's license text or terms.

## Reproducible package inventory

`package-lock.json` is the exact transitive npm inventory. Every external
package version in that lockfile must declare a license. Verify and print the
normalized inventory with:

```bash
npm run licenses:check
npm run licenses:check -- --json
```

The JSON form reports every package name, version, declared license expression,
and whether npm marks it as development-only. The check fails when a package
omits license metadata or declares itself unlicensed. A declared SPDX expression
does not by itself prove legal compatibility; maintainers must still review new
runtime dependencies before release.

## Direct runtime software

| Component | Pinned version | Purpose | Declared license |
| --- | --- | --- | --- |
| `@mediapipe/tasks-vision` | 0.10.35 | On-device pose inference | Apache-2.0 |
| React | 19.2.6 | Showcase and generated game UI | MIT |
| React DOM | 19.2.6 | Browser rendering | MIT |
| Zod | 3.25.76 | Versioned schema validation | MIT |
| Manse workspace and vendored packages | 0.1.0 | Schema, CLI, and runtime | MIT |

The production Site bundles its required runtime files. It does not load these
dependencies from a runtime CDN.

## Build and validation toolchain

The pinned development graph includes TypeScript, Vite, vinext, Next.js,
Vitest, ESLint, Cloudflare build tooling, and their transitive dependencies.
Their exact versions and license expressions are recorded in
`package-lock.json` and exposed by the inventory command above. Development-only
packages are not shipped as executable dependencies of the static player
artifact.

## MediaPipe assets

The official MediaPipe Pose Landmarker task bundles and the WebAssembly files
copied from `@mediapipe/tasks-vision` are Apache-2.0 licensed. Their source URLs,
creators, expected SHA-256 digests, and deployed paths are recorded in:

- `packages/runtime-web/assets/THIRD_PARTY.md`
- `packages/runtime-web/assets/asset-provenance.json`
- `apps/hub/public/asset-provenance.json`

The production build verifies fixed digests before packaging these files. The
Manse Creator starter carries the same records with its vendored runtime.

## Project-owned and generated media

The Showcase image and generated starter media are project-owned or generated
for Manse. Deployed provenance manifests record the generator or creator,
license, source description, and digest. Creator games must provide equivalent
metadata for every generated or third-party asset before release validation can
pass.
