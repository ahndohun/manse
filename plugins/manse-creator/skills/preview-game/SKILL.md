---
name: preview-game
description: Run and inspect a Manse game locally through its safe pointer simulator, with optional user-authorized camera testing. Use when a creator asks to preview, playtest, debug the experience, or check device layouts.
---

# Preview Game

Exercise the actual built experience and return evidence, not a screenshot-only opinion.

## Required contract

Read `../../references/creator-contract.md` before starting the preview.

## Workflow

1. Confirm the project root contains `.openai/hosting.json`, the public manifest, and at least one pack. Run `npm install` if dependencies are absent.
2. Run `npm run validate:content` before preview. Fix only when the user asked to build or repair; for a diagnosis-only request, report the failure without modifying files.
3. Start `npm run dev` in a reusable terminal session and wait for the local URL. Keep the session available for logs.
4. Use browser automation when available. Start with **Play with pointer**, never camera. Complete the entire reachable scene path and verify captions, target progress, completion, restart, touch/pointer input, console errors, and network failures.
5. Check at least a desktop viewport and a narrow phone viewport. Verify no horizontal overflow, hidden controls, unreadable captions, or inaccessible focus order. Exercise reduced-motion behavior when practical.
6. Only test the camera path after the user explicitly requests camera QA. Explain that permission will be requested, then let the user grant or deny it. Confirm denial or unavailable hardware leaves simulator play usable. Never capture, save, upload, or attach camera frames.
7. Stop the local server when it is no longer useful. Report tested paths, viewport/device assumptions, completed scenes, errors, and anything not tested.

## Evidence standard

A loading page is not a passing preview. A pass requires reaching the terminal scene through the simulator with no unexplained console or runtime error.
