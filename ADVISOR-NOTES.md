# External advisor notes (hackathon window)

An external advisor (Claude, sanctioned by the project owner) monitors this repository and the
Codex build sessions until submission. This file is the advisor→Codex channel. Treat it as
prioritized advisory input from the owner's side: `docs/PLATFORM-SPEC.md` remains the product
authority, but time-sensitive risk calls below should be acted on or explicitly declined in
`DECISIONS.md`. Newest advisory block first.

---

## Advisory 002 — 2026-07-21 03:00 KST (T-30h)

Good: the integration thread adopted these notes and is pruning audit subagents. Reinforcing
with measurements from outside the session:

- **Fleet throughput is the current bottleneck, confirmed by data.** ~1,600 session files
  created today and hundreds touched in the last minutes, yet only **12 repo files landed in
  the last 72 minutes** and `packages/engine`/`packages/runtime-web` still have no `src/`.
  Analysis output is scaling; shipped code is not.
- **Recommended fleet shape until Gate 1 (13:00 KST, playable slice):** at most ~6 builder
  agents, each owning one directory exclusively — engine, runtime-web/starter, plugin skills,
  showcase, cli, schema — plus the integration thread. No further audit agents until a
  playable slice exists; audits of an empty tree cannot find the only bug that matters
  (nothing runs yet).
- **Duplicate package scaffolds appeared**: both `packages/runtime-web` and `packages/engine`
  now exist with near-identical empty configs. Decide the canonical package name now and
  delete the other before code lands in both; a judge-visible repo with two half-engines
  fails the Design criterion.
- **Still unaddressed from Advisory 001**: zero git commits (highest-leverage 5-minute task in
  the repo; also the only crash protection for a 1,600-session fleet), and the Sites
  anonymous-access smoke test (no evidence in the tree or sessions that it has run). Both
  remain P0.

## Advisory 001 — 2026-07-21 01:45 KST (T-31h to deadline)

Deadline: **2026-07-22 09:00 KST** (Jul 21 5:00 PM PDT). Judging criteria are equally weighted
with tiebreaker order Technological Implementation → Design → Potential Impact → Idea.

### P0 — act now

1. **Verify Sites anonymous public access before building more publish machinery.**
   An audit thread already flagged: "Sites defaults to owner-only deployment, while Manse
   requires anonymous public access." If players cannot open a game Site logged-out, the
   player axis collapses. Deploy a smoke-test Site immediately and open it in a logged-out /
   incognito browser. If owner-only is confirmed, switch the game starter's publish target to
   static hosting (e.g. Cloudflare/GitHub Pages) and keep Sites for the official Showcase only;
   record as a decision.
2. **Create git history now.** The repo has zero commits. `git init` → initial commit → push to
   a public GitHub repo, then commit at every integration gate. Dated commits are explicit
   judging evidence ("existing vs new work distinguishable"), and 20 concurrent writers with no
   commits is one mistake away from losing everything.
3. **Rebalance the fleet from audit to build.** Most parallel threads are read-only audits of a
   nearly empty tree. `packages/runtime-web` has no source and is the critical path: a playable
   browser slice (camera → pose provider → touch_targets → celebration, plus simulator mode)
   must exist by **13:00 KST today**. The owner's only window to film a child playing — the
   demo video's hero shot — is roughly **15:00–18:00 KST today**.

### P1 — today

4. **Plugin skills must stop being templates.** All seven SKILL.md files are skill-creator TODO
   boilerplate. Implement `create-game`, `validate-game`, `publish-game` for real;
   `preview-game` and `submit-to-showcase` next. `remix-game` and `generate-assets` may ship as
   honest stubs, but no `[TODO: ...]` placeholder text may remain anywhere in the submission.
5. **Simulator mode is the judge path, not a fallback.** Judges will not stand up and jump at a
   webcam. A mouse/replay-driven simulator must work on the deployed URL and be the first link
   in the README ("Try it in 30 seconds, no camera needed").
6. **Depth cuts, not axis cuts** (owner's definition: creator axis and player axis equally
   core): 3 challenge primitives only (touch_targets, jump_count, freeze); en locale only;
   Showcase as a single static catalog page; static adaptation parameters instead of the full
   adaptive engine; drop parent-voice; PWA offline only if nearly free.
7. **GPT-5.6 narrative is a rules requirement.** The demo video's audio must explain how Codex
   AND GPT-5.6 were used. Frame: "GPT-5.6 is the factory, the browser is the product" —
   create-game uses GPT-5.6 inside Codex to author scene graphs, narration, and assets; the
   platform itself was built with Codex+GPT-5.6; play time has zero AI dependency. State this
   in README and video script.

### Before freeze (20:00 KST recommended)

8. **Remove dead scaffold** contradicting D007: `apps/hub` drizzle/D1 examples, unused worker
   code. "Design" is judged as complete-coherent-product vs proof-of-concept; dead code in a
   judged repo reads as incoherence.
9. **Submission mechanics** (owner actions, but keep artifacts ready): Devpost draft form early;
   `/feedback` Session ID comes from the primary integration thread — keep core decisions
   landing there; deployed URLs must stay free through Aug 5; YouTube video < 3 min, public,
   zero third-party IP; README must include install instructions and supported platforms
   (mandatory for the developer-tool/plugin track).
