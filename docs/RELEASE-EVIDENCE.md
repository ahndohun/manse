# v0.1 release evidence

This page separates verified implementation evidence from owner actions and
public checks that have not happened yet. Update it whenever the release
artifact or public URLs change.

## Current release candidate

- Source commit: `9208f3851b6f0150115a44707a9ae376405657d6`
- Repository: https://github.com/ahndohun/manse
- Packaged Showcase content hash:
  `sha256:dc23c089e34e7cf8eca93cd7887003befc4206eafad3531636cd6ca934d51862`
- Public Showcase origin:
  `https://manse-showcase.ran584000.chatgpt.site`
- Current access state: **public; no Manse or ChatGPT account required**

On 2026-07-21 KST, the owner approved public access, the saved release artifact
was deployed again, and zero-cookie HTTPS requests returned 200 for the home,
simulator playground, docs, submission guide, and provenance document. The
bundled lite pose model also returned 200 and matched its recorded SHA-256 digest
`59929e1d1ee95287735ddd833b19cf4ac46d29bc7afddbbf6753c459690d574a`.

## Verified repository gate

The following checks passed on 2026-07-21 KST against the release candidate:

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
- 30 unit and rendered-route tests across Showcase, CLI, runtime, and schema;
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

This audit covers the repository and generated starter. The final owner game,
public Site, video, and Devpost form still require their own release checks.

## Public deployment smoke test

The packaged static Showcase artifact was first checked owner-only, then changed
to public access with explicit owner approval and deployed as the same saved
version. Anonymous requests reached the home route, simulator playground, docs,
submission guide, asset provenance document, and exact bundled pose model. No
access bypass, cookie, account, API key, or rebuild was used for the public
check.

## Open release gates

| Gate | Current state | Required evidence or owner action |
| --- | --- | --- |
| Public Showcase | Verified | Public deployment and zero-cookie judge-path requests passed. |
| D008 anonymous Sites decision | Recorded | Public Sites access is the v0.1 judge path; no fallback host is needed. |
| GitHub catalog CI | Workflow prepared locally | Owner runs `gh auth refresh -h github.com -s workflow`; then commit and push `.github/workflows/ci.yml`. |
| Real creator-owned game | Not published | Owner creates the game through Manse Creator, approves its Site publication, and submits its manifest. |
| Full creator loop | Partially verified | Prove public manifest reachability, catalog contribution, CI, and Showcase rendering with the owner game. |
| Demo video | Not recorded | Record from `docs/DEMO-SCRIPT.md`, upload publicly to YouTube, and verify duration. |
| Devpost project | Not drafted here | Owner creates/approves the external project, selects Developer Tools, and pastes the reviewed submission copy. |
| `/feedback` ID | Not captured | Run `/feedback` in the primary Codex task and record the resulting Session ID. |

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
