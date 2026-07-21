# Publishing a Manse game

Manse uses federated publishing. A creator owns and deploys an independent game
Site; the official Manse Showcase stores only a reviewed reference to that
Site's public manifest.

```text
idea -> Codex + Manse Creator -> preview -> validate -> independent game Site
     -> public manifest -> catalog pull request -> CI -> maintainer approval
```

There is no Manse account, central game upload, publishing token, or hosted
generation service. The v0.1 creator workflow uses the active Codex session and
does not require an OpenAI API key. The published game also has no runtime AI
dependency.

## Before you begin

You need:

- the Codex app, with the Codex CLI available as the `codex` command in your
  terminal — the plugin install commands below use it. Check with
  `codex --version`; if it is missing, install it with
  `npm install -g @openai/codex` once Node.js (next item) is set up;
- Git;
- Node.js 22.13 or newer — Manse Creator generates the project, runs the
  local preview server, and validates the game with Node on your computer,
  even though Codex types those commands for you;
- access to ChatGPT Sites for the official publishing path;
- a folder in which Codex may create the game project; and
- a public source repository before Showcase submission. A free GitHub
  account is enough, and it is only needed at the Showcase step — you can
  create, preview, and validate a game without one.

A camera is not required while authoring. Preview with the simulator first.
Camera access should be tested only after the simulated path works.

### First-time setup if you have never used Git or Node.js

This is a one-time setup of about ten minutes. After it, you will not need
to touch these tools directly again — Codex runs every command for you once
they exist on your computer.

1. Open the terminal: on macOS the **Terminal** app, on Windows
   **PowerShell**. Check what is already installed by running these two
   lines, one at a time:

   ```bash
   git --version
   node --version
   ```

   If each prints a version number, that tool is ready. `node` must print
   `v22.13` or newer.
2. If Git is missing on macOS, running `git --version` offers to install
   Apple's command line tools — accept the dialog and let it finish. On
   Windows, download Git from <https://git-scm.com/downloads> and install
   it with the default options.
3. If Node.js is missing or too old, download the **LTS** installer from
   <https://nodejs.org> and install it with the default options.
4. Close the terminal, open it again, and run the two version commands once
   more to confirm.

If any of these steps fails or prints something confusing, copy the exact
message into a Codex task and ask what it means. That is the intended way to
get unstuck — it is not a sign that you did something wrong.

Publishing a Site and opening a catalog pull request change external state.
Manse Creator should show the intended target and ask for confirmation before
performing either action.

## Install Manse Creator

### Install from the repository marketplace

The Manse repository contains a Codex marketplace at
`.agents/plugins/marketplace.json`. Until a permanent public marketplace URL is
announced, clone the public repository and register that checkout:

```bash
git clone https://github.com/ahndohun/manse.git manse
cd manse
codex plugin marketplace add "$(pwd)"
codex plugin add manse-creator@manse
```

`manse` is the stable marketplace name declared in
`.agents/plugins/marketplace.json`.

Start a **new Codex task** after installation. Plugin skills are loaded when a
task starts; an already-open task may not see a newly installed version.

### Test a local plugin checkout

Maintainers can register an existing checkout without cloning it again:

```bash
cd /absolute/path/to/manse
codex plugin marketplace add "$(pwd)"
codex plugin add manse-creator@manse
```

The marketplace entry resolves directly to `plugins/manse-creator`. Confirm the
loaded source in both of these files before testing:

- `.agents/plugins/marketplace.json`
- `plugins/manse-creator/.codex-plugin/plugin.json`

After changing the plugin, reinstall or refresh it using the plugin commands
supported by the installed Codex build, then start a new task. Run
`codex plugin --help` rather than guessing cache or removal commands.

## The non-developer golden workflow

The prompts below are requests to Codex, not shell commands. The creator should
not need to edit source files.

### 1. Create

Open a new Codex task in the folder that should contain the game and ask:

> Use Manse Creator's `create-game` workflow. Create an original
> `<DURATION>`-minute motion game for `<AGE_RANGE>` with the theme `<THEME>` and
> locales `<LOCALES>`. Keep it accessible for `<ACCESS_NEEDS>`. Show me the game
> brief, movement plan, safety notes, and asset plan before generating files.

Codex should create a project from the Manse starter, use only declarative v1
pack data, and keep designer-tunable values in the pack or configuration. It
must not place arbitrary JavaScript, HTML, or executable WebAssembly in a pack.

For every generated or third-party asset, the project must record its origin
and license. All runtime media, model files, packs, and engine assets needed to
play must be bundled with the Site; a deployed game may not depend on a runtime
CDN.

### 2. Preview

Ask:

> Use `preview-game`. Start the local preview in simulator mode, explain the
> controls, and walk me through every scene. Do not enable the camera yet.

After the complete simulator path works, optionally ask Codex to test the real
camera path. Camera permission must follow an explicit player action. Camera
frames and inferred player data must stay on the device.

There is intentionally no `manse preview` CLI command in v0.1. The plugin uses
the generated project's own development server and browser workflow.

### 3. Validate

Ask:

> Use `validate-game`. Run every blocking project, pack, manifest,
> accessibility, path, asset-provenance, typecheck, test, and production-build
> check. Repair failures and summarize the evidence.

Validation must include both valid and intentionally invalid contract fixtures.
A publishable v1 project must, at minimum, have:

- a strict supported schema version with no unknown pack fields;
- an explicit terminal scene and resolvable scene and asset references;
- relative asset paths that cannot escape the pack root;
- direct narration-to-audio mappings when audio is present;
- declared accessibility and content-disclosure metadata;
- origin and license metadata for every generated or third-party asset; and
- only the closed permissions supported by the current contract.

The plugin is the primary interface. Developers may inspect the deterministic
CLI manually after building the checkout:

```bash
npm install
npm run build --workspace @manse/cli
node packages/cli/dist/cli.js --help
```

The supported command surface is:

```bash
manse doctor --json
manse validate <GAME_PROJECT_OR_PACK> --json
manse manifest <GAME_PROJECT> --json
manse pack <GAME_PROJECT> --out <RELEASE_OUTPUT> --json
manse catalog add <MANIFEST_URL> --catalog <CATALOG_SOURCE_PATH> --json
manse catalog build <CATALOG_SOURCE_PATH> --out <CATALOG_SNAPSHOT_PATH> --json
```

Use these commands only when they appear in the built checkout's `manse --help`.
The CLI has no `init`, `preview`, or `publish` command: Codex performs authoring
and preview, and ChatGPT Sites performs hosting.

### 4. Publish an independent ChatGPT Site

Ask:

> Use `publish-game`. Re-run release validation, show me the Site and source
> repository targets, then publish this project as an independent public
> ChatGPT Site. After deployment, verify the game and public manifest from a
> clean signed-out browser session.

The deployment must be self-contained and expose:

```text
<PUBLIC_GAME_URL>
<PUBLIC_GAME_URL>/.well-known/manse-game.json
<PUBLIC_GAME_URL>/packs/<PACK_ID>/manse.pack.json
```

The first URL must open without a Manse account or player sign-in. Test it in a
private or signed-out browser window; an owner-only preview is not a public
release. Also test the simulator on the deployed URL so a player without a
camera has a usable path.

ChatGPT Sites availability and sharing controls depend on the creator's Codex
and ChatGPT environment. If that environment cannot produce an anonymously
reachable Site, do not claim that it can. Use the self-hosting path below or
wait until public sharing is available.

## Verify the public manifest

Set the released URLs and fetch the exact well-known route:

```bash
PUBLIC_GAME_URL='<PUBLIC_GAME_URL>'
MANIFEST_URL="${PUBLIC_GAME_URL%/}/.well-known/manse-game.json"
curl --fail --location --show-error --silent "$MANIFEST_URL"
```

The manifest and deployment must agree on:

- stable game id and slug;
- title, summary, locales, age range, and movement tags;
- game and public source-repository URLs;
- compatible engine version;
- accessibility and content disclosures;
- thumbnail URL and safe display media type; and
- game license, asset origins, and content provenance.

Confirm that the game URL, source URL, thumbnail, pack, and every referenced
asset are publicly reachable. Run the game in a clean browser session rather
than relying on an authenticated owner preview. A passing local manifest is not
evidence that the deployed manifest is reachable.

## Submit to the Manse Showcase

Only submit after the independent deployment and its manifest have passed the
public checks above. Ask:

> Use `submit-to-showcase`. Verify `<MANIFEST_URL>`, add only its reference to
> the Manse catalog contribution format, run the catalog and repository checks,
> show me the diff, and ask before opening a pull request.

For a manual maintainer workflow, use the paths declared by the current
Showcase checkout:

```bash
manse catalog add <MANIFEST_URL> --catalog <CATALOG_SOURCE_PATH> --json
manse catalog build <CATALOG_SOURCE_PATH> --out <CATALOG_SNAPSHOT_PATH> --json
npm run validate
git diff --check
git diff
```

The pull request contributes a manifest reference, not a copy of the game or
its assets. Showcase CI resolves the public deployment again and checks HTTPS
reachability, schema and engine compatibility, unique id and slug, source and
license fields, disclosures, thumbnail safety, and agreement between the
submitted URL and manifest.

Automated validation is necessary but not sufficient. A maintainer performs the
v0.1 semantic and safety review before merging the catalog change. After merge,
the Showcase builds a reviewed static snapshot and links the creator-owned
Site. It does not proxy, iframe, upload, or execute that Site's code.

Delisting later changes only the catalog. The creator retains control of the
independent deployment and its license obligations.

## Self-hosting

ChatGPT Sites is the official publishing surface, not a proprietary runtime
dependency. A compatible game can be served from any static-capable HTTPS host.

Before deploying elsewhere, package the project with the output form supported
by the current CLI:

```bash
manse validate <GAME_PROJECT> --json
manse manifest <GAME_PROJECT> --json
manse pack <GAME_PROJECT> --out <RELEASE_OUTPUT> --json
```

Follow the chosen host's deployment instructions; Manse intentionally does not
provide a universal upload command or central publishing API. The resulting
deployment must preserve the same contract:

- public HTTPS access without a Manse login;
- `/.well-known/manse-game.json` at the deployed origin;
- same-origin, relative pack and asset paths;
- bundled runtime dependencies with no required runtime CDN;
- camera permission only after an explicit user action; and
- no analytics, camera-frame upload, or child-data transmission added by Manse.

An organization may also fork `apps/hub`, maintain a separate reviewed catalog,
and operate an independent compatible Showcase. The official Showcase is a
curated discovery layer, not a hosting gatekeeper.

## What is deliberately absent

The v0.1 workflow has no:

- Manse creator account or player login;
- central game or asset upload;
- object-storage or publishing token;
- Manse publishing API;
- required OpenAI API key;
- runtime GPT request; or
- automatic semantic moderation.

Codex is the creator studio, the independent Site is the product players open,
and the Showcase is a small reviewed index.

## Release checklist

Before announcing or submitting a game, verify all of the following:

- [ ] The simulator completes the full game on the production URL.
- [ ] The camera path requests permission only after an explicit action.
- [ ] A signed-out player can open the production URL.
- [ ] `/.well-known/manse-game.json` returns valid public JSON.
- [ ] Packs and assets use public same-origin paths and need no runtime CDN.
- [ ] The source repository and declared licenses are public and correct.
- [ ] Generated and third-party assets include provenance and license metadata.
- [ ] Local validation, tests, typecheck, and production build pass.
- [ ] The catalog change contains the intended manifest reference only.
- [ ] Showcase CI passes and a maintainer has approved the listing.
