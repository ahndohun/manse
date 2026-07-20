# Manse repository working agreement

## Source of truth

- `docs/PLATFORM-SPEC.md` is the authoritative product and architecture spec.
- `docs/DEVPOST-CHECKLIST.md` is the authoritative submission checklist.
- `ADVISOR-NOTES.md` carries time-sensitive advisory guidance during the hackathon window;
  read the newest advisory block before starting new work.
- `docs/KICKOFF.md` and `docs/CORE-SPEC.md` are historical game-first drafts. Do not implement from them when they conflict with the platform spec.
- Record material product and engineering decisions in `DECISIONS.md`.

## Product invariants

- Manse is an open-source AR active-game engine and publishing platform, not a single game.
- The official Showcase and every creator-owned game are independent ChatGPT Sites. The source remains self-hostable under the MIT license.
- Creators author, preview, validate, and publish games through the Manse Codex plugin.
- Version 1 game packs are declarative data. Never execute arbitrary JavaScript from uploaded packs.
- Camera frames and child data stay on the playing device. Do not add analytics or transmit camera frames.
- Public game Sites must work without an account.
- The Showcase links to independently hosted game Sites; it does not proxy or execute third-party game code.
- A game is listed only after its public manifest passes CI and a maintainer approves the catalog change.

## Repository rules

- All user-facing and repository-facing copy is English. Korean is a content locale.
- Keep game feel and designer-tunable values in configuration or pack data, not component literals.
- Keep the pack schema, validator, runtime loader, and publisher on one versioned contract.
- Bundle each game's runtime assets in its Site. A published game must not require a runtime CDN.
- Use only original, licensed, or generated assets. Persist provenance and license metadata for every uploaded asset.
- Never commit credentials or generated secret-bearing environment files.
- Keep changes in small vertical slices. Each slice must end in a runnable or testable result.

## Verification

- Run the relevant typecheck, tests, and production build before declaring a slice complete.
- Test pack validation on both valid and intentionally invalid fixtures.
- Test the judge path without rebuilding: public Showcase URL, generated starter preview, plugin install instructions, and valid fixtures.
- Keep the primary Codex task as the integration thread for the `/feedback` Session ID.
