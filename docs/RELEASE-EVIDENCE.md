# v0.1 release evidence

This page separates verified implementation evidence from the remaining owner
actions. Update it whenever the release artifact or public URLs change.

## Current post-submission state

- Deployed Showcase source commit:
  `93e3a8e8d6dfae8af1bc5d0eb1b5fc2466c5daaf`
- Repository: https://github.com/ahndohun/manse
- Public Showcase Sites version: **15**
- Public Showcase origin:
  `https://manse-showcase.ran584000.chatgpt.site`
- Current access state: **public; no Manse or ChatGPT account required**
- Installed Manse Creator version:
  `0.1.0+codex.20260722011014`
- Devpost submission: https://devpost.com/software/manse (submission ID
  `1112468`)
- Public demo video: https://www.youtube.com/watch?v=yFgUyrsdgfo

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

Version 12 replaced the placeholder-like catalog treatments with a real Fire
Hose Hero play frame, labeled the other five entries according to their state at
that release, and placed the flagship's 3-alarm / 12-fire proof above the fold.
Fresh signed-out desktop and
390-pixel mobile checks verified all six cards, working filters and outbound
game links, no horizontal overflow, and zero page or console errors. The public
Playground again completed 3 / 3 without an account, camera, API key, or
rebuild.

Version 13 promotes the other five entries to playable worlds after each game
received its own trusted, Site-bundled renderer, authored reaction states,
continuous input feedback, progression HUD, and completion celebration. Fresh
local pointer-mode visual QA confirmed the themed stages for all five games;
their independent repositories then passed typecheck, production build, tests,
content validation, release validation, and production dependency audit before
deployment. Showcase version 14 published the new `Playable world · original
game art` treatment from source commit
`26440f9bc0e3d906add57a232aba0b8786e2321c` and removed the former mechanic-demo
label.

Showcase version 15 deployed the shared MANSE platform shell from source commit
`93e3a8e8d6dfae8af1bc5d0eb1b5fc2466c5daaf`. A fresh anonymous audit covered
the Showcase and all six creator-game Sites at 1280 pixels. Every Site showed
the exact `MANSE` wordmark, exact Showcase back-link destination
`https://manse-showcase.ran584000.chatgpt.site`, a present `<main>` landmark,
and no horizontal overflow. A fresh interactive round trip then clicked Fire
Hose Hero from the Showcase, reached its independent public origin in the same
tab, clicked the localized `게임 둘러보기` action, and returned to the exact
Showcase origin in that same tab.

## Six public creator game Sites

Each game is an independent public ChatGPT Site backed by its own public GitHub
repository. On 2026-07-22 KST, every game passed its content validator, release
validator, production build, and production-only npm audit before Sites version
4 was deployed publicly. Version 3 added a generated install-time precache for
the navigation shell, hashed client assets, and game pack while leaving the
heavy camera model and WebAssembly payloads lazy.

| Game | Public Site | Version | Deployed source commit |
| --- | --- | --- | --- |
| Morning Star Catch | https://morning-star-catch.ran584000.chatgpt.site | 9 | `9651c65091fc8583421b048293f2d89741fc89f7` |
| Fire Hose Hero | https://fire-hose-hero.ran584000.chatgpt.site | 9 | `417c0c2cce6db8885f255d26958c4d55973c9dc0` |
| Fruit Basket Catch | https://fruit-basket.ran584000.chatgpt.site | 9 | `25526e34b30177b6193a2035f0d64485a505b5c5` |
| Museum Statues | https://museum-statues.ran584000.chatgpt.site | 9 | `af8b13961f523afce991aaf227d9d564d0e3ee26` |
| Froggy Hops | https://froggy-hops.ran584000.chatgpt.site | 9 | `671cd20116f6538e8eaa7f631807ddaa5dbe64b4` |
| Monkey Bananas | https://monkey-bananas.ran584000.chatgpt.site | 9 | `1bcdc97a8c056d6af2d153c134a14c4010c99d5c` |

The current public release for every game is Sites version 9. The anonymous
seven-Site shell audit verified the exact platform wordmark, back-link label
and `href`, main landmark, and absence of horizontal overflow at 1280 pixels.
Morning Star Catch additionally completed its public v9 pointer path
from 0 / 3 through 3 / 3 using trusted pointer input and reached the DOM status
`완료`. The capture is checked in at
`evidence/platform-morning-public-complete.png`.

Four dash-only version 10 source commits are prepared but **not deployed**:

| Game | Prepared v10 source commit | Deployment state |
| --- | --- | --- |
| Froggy Hops | `c736a70ce111f603cdb0cc878f80d92447c17a19` | Not deployed |
| Fruit Basket Catch | `9b44e73dac8737dfe21c6f4a1ebd41a13e4d806d` | Not deployed |
| Monkey Bananas | `4d839baed20c4898e52593fa4eea8189ea5cdab6` | Not deployed |
| Morning Star Catch | `98558ec9779f674ba70fb15cbdf030e1ee99814e` | Not deployed |

The attempted Sites update was stopped by the connector response HTTP 451,
`no_biscuit_no_service`. Consequently the public origins and authoritative
table above remain on version 9; the prepared v10 SHAs must not be represented
as live.

Fresh signed-out checks after the version 7 roll-out returned HTTP 200 for all
six Site roots and manifests. Pointer mode entered the themed play field on all
five newly promoted games with WebGL2 grade S, no visible runtime error, and the
expected frog pond, orchard basket, jungle banana course, constellation sky,
and moonlit museum renderer respectively.

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
- zero dependency vulnerabilities in both full and production-only npm audits
  after pinning patched PostCSS, Sharp, and fast-uri releases; a fresh temporary
  checkout repeated `npm ci`, the complete validation suite, lint, both
  production builds, and both audits successfully; and
- no required runtime CDN, analytics, camera-frame upload, or child-data
  transmission added by Manse.

Run `npm run licenses:check -- --json` for the complete dependency license
inventory and see `docs/THIRD-PARTY.md` for the release policy.

## Independent shipping review

A pre-shell read-only Fable 5 High review returned **FINAL PASS** after inspecting
the then-current flagship source and captures, public signed-out URLs, Showcase v12,
the installed creator-plugin contract, the final Remotion export, and the
submission documents. It found no release-blocking defect. Its two remaining
presentation notes were resolved before upload: the opening gameplay frame now
shows the full HUD without edge cropping, and a failed Fire Hose Hero mission
uses a retry-specific shell status instead of the successful-completion label.
A focused follow-up review of those exact deltas returned **DELTA PASS** with no
blockers.
Those PASS results are historical pre-shell evidence, not a review of the
current version 15 / version 9 final state. The latest requested post-shell
Fable review is blocked because Claude Code OAuth has expired. No newer Fable
PASS is claimed. Automated validation and public browser checks remain the
authoritative current release evidence.

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

The current plugin reinstall uses cachebuster version
`0.1.0+codex.20260722011014`. A clean-room contract run generated both touch and
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
rendered Showcase catalog, and the rendered final video. The video is now public
at https://www.youtube.com/watch?v=yFgUyrsdgfo, and the Devpost entry is submitted
at https://devpost.com/software/manse with submission ID `1112468`.

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
| Demo video | Verified public | The 2:27 demo is public at https://www.youtube.com/watch?v=yFgUyrsdgfo. The reproducible Remotion edit is 146.624 seconds at 1920×1080/30 fps, H.264/AAC (20,681,273 bytes), with SHA-256 `e50b8e6cd0b09e911d5bb5b2e1c8953073a7fc40635c1eb2e6d956b02b5ef9ca`. The current public video uses the prior macOS Samantha narration. A later ChatGPT TTS replacement remains blocked because `OPENAI_API_KEY` is unavailable and is not part of the public artifact. |
| Devpost project | Submitted | Public entry: https://devpost.com/software/manse; submission ID `1112468`. |
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
