# v0.1 release evidence

This page separates verified implementation evidence from the remaining owner
actions. Update it whenever the release artifact or public URLs change.

## Current release candidate

- Deployed source commit: `379ada82ff73e79a14186315d8c56b426ce2ea90`
- Repository: https://github.com/ahndohun/manse
- Saved Sites version: **12**
- Packaged Showcase content hash recorded by Sites:
  `sha256:5a76e5964377bb77f8d932ae06a14ad28caf633a173d451c12a763f5966b53af`
- Public Showcase origin:
  `https://manse-showcase.ran584000.chatgpt.site`
- Current access state: **public; no Manse or ChatGPT account required**
- Installed Manse Creator version:
  `0.1.0+codex.20260721210725`

On 2026-07-21 KST, the owner approved public access, the saved release artifact
was deployed again, and zero-cookie HTTPS requests returned 200 for the home,
simulator playground, docs, submission guide, and provenance document. The
bundled lite pose model also returned 200 and matched its recorded SHA-256 digest
`59929e1d1ee95287735ddd833b19cf4ac46d29bc7afddbbf6753c459690d574a`.

On 2026-07-22 KST, version 9's fresh signed-out browser gate completed the
simulator from 0 / 3 through 3 / 3 with trusted pointer input and showed
"Runtime check complete.". It asserted one renderer with the expected camera
and overlay canvases, observed no page errors, and completed without an
account, API key, camera permission, or rebuild. The deployed home page contains
zero occurrences of the removed "Auto quality" claim.

Version 10 then integrated the kinetic local landing into the official
Showcase while preserving the reviewed catalog, creator documentation,
submission guidance, and playground routes. Fresh public requests confirmed
the new hero, brand assets, and all four routes, and the signed-out playground
gate again completed 3 / 3 with no rebuild or camera permission.

Version 11 published the six-game catalog and the reviewed hero cleanup. The
first server-rendered rotating word is the complete `playground` string with no
entrance-animation class, the removed camera status chip has zero occurrences,
and the hero copy is now "Play motion games in any browser. Create and publish
your own with Codex." Fresh signed-out verification found all six cards plus the
non-touch `Dodge`, `Freeze`, `Squat`, and `Jump` tags. The public playground
again completed 3 / 3, and the deployed home page contains zero occurrences of
the removed "Auto quality" claim.

Version 12 is the final presentation release. It replaces the placeholder-like
catalog treatments with a real Fire Hose Hero play frame, labels the other five
entries explicitly as engine-mechanic demos with cover art, and places the
flagship's 3-alarm / 12-fire proof above the fold. Fresh signed-out desktop and
390-pixel mobile checks verified all six cards, working filters and outbound
game links, no horizontal overflow, and zero page or console errors. The public
Playground again completed 3 / 3 without an account, camera, API key, or
rebuild.

## Six public creator game Sites

Each game is an independent public ChatGPT Site backed by its own public GitHub
repository. On 2026-07-22 KST, every game passed its content validator, release
validator, production build, and production-only npm audit before Sites version
4 was deployed publicly. Version 3 added a generated install-time precache for
the navigation shell, hashed client assets, and game pack while leaving the
heavy camera model and WebAssembly payloads lazy.

| Game | Public Site | Deployed source commit |
| --- | --- | --- |
| Morning Star Catch | https://morning-star-catch.ran584000.chatgpt.site | `ca22e8cd845ebe37a6c3b34801191f03c609f4e2` |
| Fire Hose Hero | https://fire-hose-hero.ran584000.chatgpt.site | `e8fb77dc7ab381e1e9a08795323a1f814e6ba0ff` |
| Fruit Basket Catch | https://fruit-basket.ran584000.chatgpt.site | `0e9534eace4ba0567824eca23c386a6965f762b8` |
| Museum Statues | https://museum-statues.ran584000.chatgpt.site | `5db37be38fbb538cb98e8c8cfa199864a7c2200e` |
| Froggy Hops | https://froggy-hops.ran584000.chatgpt.site | `428151a0e01f1e904df0f1d5f520cf516027bdae` |
| Monkey Bananas | https://monkey-bananas.ran584000.chatgpt.site | `af1a417579a832a5cb54b7a61d8ebd0afb7d6429` |

Anonymous HTTPS checks returned 200 for all 78 requested paths: each Site root,
public manifest, thumbnail, asset provenance, game pack, pack provenance, both
bundled pose models, and all four bundled MediaPipe JavaScript/WebAssembly
files, plus each generated `sw-precache.js`. Every precache contains the shell
and its own game pack, and every manifest exposes exact same-origin game,
thumbnail, and provenance URLs plus both `ko` and `en` localized metadata.
Version 4 also replaces every visible placeholder source link with the matching
public GitHub repository; all six rendered pages were checked for the exact URL
and zero `github.com/replace-me` occurrences.

Morning Star Catch was loaded online once, then reloaded successfully with
browser networking disabled while still showing its title, pointer-play action,
and corrected public source link under active service-worker control.

Fire Hose Hero version 8 is the quality-reference release. Its public,
signed-out production build passed complete pointer runs at 1280×900 and
390×844 with reduced motion: 12/12 fires across three alarm zones, terminal
victory, restart to 0/12, keyboard focus, captions, no horizontal overflow, and
zero console, page, or request errors. The game also carries its own approved
experience contract, real mid-play and completion captures, and a release gate
covering themed entities, three reaction states, continuous hose feedback,
authored escalation/audio, score/resolution, camera/simulator parity, and
reduced-motion completion. Version 8 also distinguishes a failed mission's
retry-ready shell status from the successful completion label. Its saved Sites
archive contains 42 files with content hash
`sha256:5df36db1f9105657b492d8678ce266c41c8988f6462c1bb5af269001cdad7005`.
A separate signed-out browser run let the first 28-second alarm expire naturally
and verified the `Ready to retry` status, terminal failure caption, restart
control, layout, and zero console, page, or request errors.

## Verified repository gate

The following checks passed again on 2026-07-22 KST against the release candidate:

```bash
npm run validate
npm run lint
npm audit --omit=dev
git diff --check
```

Evidence covered:

- schema generation and one versioned contract across schema, CLI, runtime,
  starter, plugin, and catalog;
- valid and intentionally invalid fixture behavior;
- 69 unit and rendered-route tests across Showcase, CLI, runtime, and schema;
- workspace typechecks and production builds;
- exact catalog snapshot compatibility;
- all seven Manse Creator skills and plugin manifest validation;
- fixed SHA-256 checks for the bundled MediaPipe model and WebAssembly assets;
- zero dependency vulnerabilities reported by npm audit after applying a
  compatible patched PostCSS override to the static build toolchain; and
- no required runtime CDN, analytics, camera-frame upload, or child-data
  transmission added by Manse.

Run `npm run licenses:check -- --json` for the complete dependency license
inventory and see `docs/THIRD-PARTY.md` for the release policy.

## Independent shipping review

A final read-only Fable 5 High review returned **FINAL PASS** after inspecting
the current flagship source and captures, public signed-out URLs, Showcase v12,
the installed creator-plugin contract, the final Remotion export, and the
submission documents. It found no release-blocking defect. Its two remaining
presentation notes were resolved before upload: the opening gameplay frame now
shows the full HUD without edge cropping, and a failed Fire Hose Hero mission
uses a retry-specific shell status instead of the successful-completion label.
A focused follow-up review of those exact deltas returned **DELTA PASS** with no
blockers.
Automated validation and public browser checks remain the authoritative release
evidence; the advisory review is an additional product-quality gate.

## Fresh creator-project forward test

Outside this monorepo, the installed plugin's deterministic generator produced a
new Sites-compatible game project. In that fresh directory, the following
passed:

- dependency installation;
- typecheck;
- production build;
- rendered route tests;
- valid manifest and pack validation;
- production-only npm audit with zero findings; and
- intentional rejection of an invalid pack.

The release check correctly remained blocked while public game, thumbnail,
provenance, and source URLs were still draft placeholders. That project was not
published or represented as a public sample game.

The regenerated project also resolved the patched PostCSS build dependency and
passed a full development-and-runtime `npm audit` with zero findings.

The final plugin reinstall used cachebuster version
`0.1.0+codex.20260721210725`. A clean-room contract run generated both touch and
freeze projects with explicit player fantasies, physical verbs, and themed
targets; validated their three distinct challenge beats; and proved that a
brief missing the authored fantasy is rejected before scaffolding. An earlier
clean-room project generated from the prior release source passed dependency
installation, typecheck, production build, three Site
tests including offline revisit, content validation, and a full audit with zero
findings. Its release check rejected draft URLs and an unconnected Sites
project as intended. Neither clean-room project was published or represented
as a sample game.

## Eligibility and security audit

The pre-submission audit on 2026-07-21 KST found:

- every current commit and the initial authored baseline falls within the Build
  Week submission period, with dated history separating each integration gate;
- the GitHub repository returns HTTP 200 without authentication, reports Public
  visibility, and exposes an MIT license;
- the README contains English setup, plugin installation, supported-platform,
  judge-path, Codex collaboration, GPT-5.6, architecture, privacy, and decision
  evidence;
- tracked files and every Git revision contain no matches for common OpenAI,
  GitHub, AWS, or private-key credential patterns;
- source contains no `eval`, `new Function`, or runtime HTML injection path;
- the only executable-script strings are intentionally hostile CLI test
  fixtures that verify remote runtime scripts are rejected;
- browser runtime fetches are limited to same-origin packs and assets, the
  service worker caches only same-origin GET requests, and catalog CLI network
  access validates public HTTPS destinations and redirect/origin boundaries;
- source contains no analytics, advertising, player account, telemetry, camera
  upload, or child-profile implementation; and
- both full and production-only npm audits report zero vulnerabilities.

This audit covers the repository, generated starter, six public game Sites, the
rendered Showcase catalog, and the locally rendered final video. YouTube
publication and the Devpost submission remain owner-controlled release actions.

## Public deployment smoke test

The packaged static Showcase artifact was first checked owner-only, then changed
to public access with explicit owner approval and deployed as the same saved
version. Anonymous requests reached the home route, simulator playground, docs,
submission guide, asset provenance document, and exact bundled pose model. No
access bypass, cookie, account, API key, or rebuild was used for the public
check.

The repository now contains two GitHub Actions workflows:

- [CI](https://github.com/ahndohun/manse/actions/workflows/ci.yml) runs the full
  deterministic repository validation from a clean Linux install; and
- [Public release gate](https://github.com/ahndohun/manse/actions/workflows/public-release.yml)
  installs Chromium and completes the deployed simulator 3 / 3 from a fresh
  browser context.

Both workflows passed against the version 8 release source. Linux native build
dependencies are explicitly represented in the lockfile so `npm ci` is
reproducible across the developer Mac and the GitHub runner.

## Open release gates

| Gate | Current state | Required evidence or owner action |
| --- | --- | --- |
| Public Showcase | Verified | Public deployment and zero-cookie judge-path requests passed. |
| D008 anonymous Sites decision | Recorded | Public Sites access is the v0.1 judge path; no fallback host is needed. |
| GitHub catalog CI | Verified | Clean Linux `npm ci` and the full repository validation passed on GitHub Actions. |
| Deployed Playground E2E | Verified | The signed-out browser workflow completed the deployed simulator 3 / 3. |
| Real creator-owned game | Verified | Six independent public game Sites and their public source repositories are linked above. |
| Full creator loop | Verified | Six public manifests passed catalog ingestion and render as six independent Showcase cards. |
| Owner camera feel smoke | Outstanding, non-blocking | Run the mechanic diagnostic and real-camera aiming check; the release wrapper changes only MediaPipe frames and the published release remains shippable if feel tuning fails. |
| Demo video | Rendered and locally verified; public upload pending | The reproducible Remotion edit is 146.624 seconds at 1920×1080/30 fps, H.264/AAC (20,681,273 bytes). All nine scene midpoints, the corrected creator-site crop, and the full-width opening gameplay HUD were inspected; integrated loudness is -16.89 LUFS with -4.35 dBTP peak. SHA-256: `e50b8e6cd0b09e911d5bb5b2e1c8953073a7fc40635c1eb2e6d956b02b5ef9ca`. Upload it publicly and verify YouTube duration/visibility. |
| Devpost project | Draft created | The `Manse` project draft and thumbnail exist; Developer Tools answers are prepared for the final submission gate. |
| `/feedback` ID | Captured | Primary integration task: `019f8035-dbb1-7213-8946-84a80b7343f8`. |

## Anonymous judge-path checklist

After public deployment, run from a clean signed-out browser without rebuilding:

1. Open the Showcase root.
2. Open `/playground?provider=simulated` and complete the whole target sequence.
3. Confirm no login, API key, camera, or install is required.
4. Open the owner game from its Showcase card and confirm the origin changes.
5. Fetch the owner's `/.well-known/manse-game.json`, pack, thumbnail, provenance,
   and source links.
6. Disable the network after the first successful game load and repeat the
   documented offline path.
7. Inspect network traffic and confirm Manse transmits no camera frames, pose
   landmarks, or gameplay telemetry.

Record the browser, operating system, date, URLs, and outcome before claiming
the judge path complete.
