---
name: publish-game
description: Connect and publish a validated Manse game as its own ChatGPT Site, then verify anonymous access and public metadata. Use when a creator explicitly asks to deploy, release, host, or make a Manse game public.
---

# Publish Game

Publish the creator-owned Site without turning Manse into an upload service or central runtime.

## Required contract

Read `../../references/creator-contract.md` and `../../references/release-checklist.md`. Use the installed Sites building and Sites hosting skills for all Sites project and deployment operations. If those capabilities are unavailable, stop and explain rather than inventing commands.

## Workflow

1. Run `$validate-game` or perform all of its blocking checks. Do not publish a project with failing content, types, tests, build, production audit, provenance, or privacy checks.
2. Confirm the intended public source repository and license. Pushing source changes external state; ask immediately before a push unless the user already authorized that exact push.
3. Connect `.openai/hosting.json` to a new creator-owned Sites project. Each game gets its own project; never deploy it into the official Manse Showcase project.
4. Determine the stable Sites origin. Update the manifest's `gameUrl`, thumbnail URL, and provenance URL to that exact origin; update `sourceUrl` to the public source. Remove draft placeholders and set `.manse/project.json` to a release-candidate state.
5. Re-run:

```bash
npm run validate
npm run validate:release
npm audit --omit=dev
```

6. Show the user the project, source commit, exact access change, and intended production URL. Ask for explicit approval immediately before creating the production deployment or changing access to public unless that exact action was already authorized in the current request.
7. Save and deploy the Sites version through the Sites hosting workflow. Do not print access tokens, bypass tokens, credentials, or secret-bearing tool output.
8. Verify from an anonymous session that the root page and `/.well-known/manse-game.json` are public, valid, and same-origin with all runtime assets. Complete the simulator path. A private owner preview is not a release.
9. Report the public game URL, manifest URL, source commit, validation evidence, and any untested camera/device path. Suggest `$submit-to-showcase` only after anonymous verification passes.

## Failure handling

If Sites availability, permissions, or public access is unavailable, leave the project private/draft and state the exact blocker. Never claim success from an authenticated preview.
