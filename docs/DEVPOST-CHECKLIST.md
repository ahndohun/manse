# OpenAI Build Week submission checklist

Verified against the official Devpost overview, rules, resources, updates, and
signed-in project dashboard on 2026-07-22.

## Account and deadline

- [x] Entrant is registered for OpenAI Build Week.
- [ ] Create a Devpost project draft. The signed-in dashboard still showed no project at 03:25 KST. This changes external state and must be done by or explicitly approved by the entrant.
- [ ] Select **Developer Tools** in the Devpost project. The prepared submission copy uses this track because the core submission is an installable creator/publisher plugin plus an open-source game engine and platform.
- [ ] Submit before **July 21, 2026 at 5:00 PM PT / July 22, 2026 at 9:00 AM KST**.
- [ ] Keep the deployed project available free of charge through August 5, 2026 at 5:00 PM PT under the official rules, and conservatively through August 9 at 5:00 PM PT because the live schedule currently shows the later judging end.

## Required submission material

- [x] Working project built with Codex and meaningfully using GPT-5.6
- [x] English project description prepared in `docs/DEVPOST-SUBMISSION.md`
- [ ] Public YouTube demo, no longer than three minutes
- [ ] Demo audio explains what was built, how Codex was used, and how GPT-5.6 was used
- [x] Repository URL is public and MIT licensed
- [x] README has setup, fixture data, testing path, Codex collaboration, key decisions, and GPT-5.6 usage
- [ ] `/feedback` Session ID from the primary task where most core functionality was built

## Additional plugin and developer-tool requirements

- [x] Installation instructions
- [x] Supported platforms
- [x] Test path that does not require judges to rebuild: public Showcase Site, hosted engine/starter playground, and an installable plugin marketplace entry
- [ ] Working demo must match the video and written claims

## Repository and legal checks

- [x] MIT `LICENSE`
- [x] Third-party dependency license inventory
- [x] Asset provenance and license metadata
- [ ] No unlicensed trademarks, copyrighted music, characters, or third-party footage in the video
- [x] All submission and testing instructions are English
- [x] Existing and new work are distinguishable through dated commits and the decision log

## Judge experience

- [x] Public catalog opens without sign-in
- [x] Engine/starter playground starts without a build step or API key
- [x] Simulator path works when camera access is unavailable
- [x] Signed-out browser and GitHub release workflow complete the deployed simulator 3 / 3
- [x] Clean Linux CI runs the full repository validation from `npm ci`
- [x] Plugin install can be completed from documented steps
- [x] Creator can produce, validate, and publish a new game Site, then prepare a Showcase catalog entry
- [x] README links directly to the live platform, reference game, plugin instructions, architecture, and privacy model
- [ ] README links to the final public demo video and records the `/feedback` Session ID

## Before final submission

- [x] Run the repository eligibility and security audit; evidence is in `docs/RELEASE-EVIDENCE.md`
- [x] Verify the deployed URL in a clean browser session
- [x] Verify the reference game after disabling the network following first load
- [x] Verify the repository is accessible to judges
- [ ] Verify the YouTube video is public and under three minutes
- [ ] Capture the primary task's `/feedback` Session ID
- [ ] Save a local copy of all submitted text and URLs before the deadline
