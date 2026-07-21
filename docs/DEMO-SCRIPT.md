# OpenAI Build Week demo script

Target duration: **2:40–2:50**. The uploaded YouTube video must remain under
three minutes, be public, include audio, and match the final deployed build.

Replace every placeholder before recording. Do not show owner-only URLs,
credentials, private tabs, camera footage without consent, or functionality the
release does not perform.

## Storyboard and voiceover

| Time | Screen | Voiceover |
| --- | --- | --- |
| 0:00–0:12 | Open directly on the public Fire Hose Hero mission: sweep the continuous hose across reactive fires, show the score/timer/pressure HUD, and reach the next alarm. | “This is Manse: an open-source engine and publishing ecosystem for camera-based active games. A normal link turns a phone, computer, tablet, or compatible display into the play surface.” |
| 0:12–0:28 | Showcase home, architecture strip, and privacy statement. | “Closed motion-game platforms own the format and storefront. Manse opens the engine, declarative game format, creator tools, and catalog. Players need no Manse account, controller, subscription, or runtime AI service.” |
| 0:28–0:48 | Codex with Manse Creator installed; show the plain-language owner brief and the generated brief/safety plan. | “For creators, Codex is the studio. I describe a game in plain language. The Manse Creator plugin uses GPT-5.6 to plan movement, accessibility, original assets, and a versioned project before it writes files.” |
| 0:48–1:08 | Fast cuts: generated pack, provenance record, seven plugin skills, then simulator preview. | “The output is not opaque code from a central service. It is a creator-owned Site, a strict data-only pack, and auditable provenance. Seven workflows cover creation, assets, preview, validation, remixing, publishing, and Showcase submission.” |
| 1:08–1:30 | Complete the full `/playground?provider=simulated` sequence with mouse or touch; briefly show the optional camera setup button. | “The simulator is the fastest judge path and uses the same engine session as camera play. The public catalog includes touch, dodge, freeze, squat, and jump games. Camera permission starts only after an explicit action, and Manse never transmits camera frames or pose data.” |
| 1:30–1:48 | Terminal or Codex summary of `npm run validate`; show valid and intentionally invalid fixtures and the production build result. | “One contract drives the schema, validator, runtime loader, starter, publisher, and catalog. Validation checks paths, accessibility, licenses, provenance, tests, types, and the production build—and intentionally invalid packs must fail.” |
| 1:48–2:08 | Publish confirmation, then open `https://fire-hose-hero.ran584000.chatgpt.site` and `/.well-known/manse-game.json` signed out. | “With my approval, Codex packages the self-contained game and publishes an independent public Site. Runtime code, models, WebAssembly, packs, and media are bundled; play needs no API key or external runtime CDN.” |
| 2:08–2:28 | Show the manifest-only catalog change, CI result, and the game card linking out from Showcase. | “The Showcase receives only a public manifest URL. CI validates it, a maintainer approves it, and the catalog links to the creator's Site. Manse never uploads, proxies, iframes, or executes that third-party game.” |
| 2:28–2:47 | Repository map, MIT license, decision log, then final hero frame. | “Codex and GPT-5.6 built the platform and power the creator workflow: GPT-5.6 is the factory; the browser is the product. Manse is MIT licensed, self-hostable, privacy-first, and ready for creators to extend.” |

## Capture order

Record clean source clips before editing:

1. Signed-out Showcase home and simulator playground.
2. Owner game play, first in simulator and then the optional real camera path.
3. Manse Creator installation state and the exact creation brief.
4. Generated files, asset provenance, and validation result.
5. Publish approval and the signed-out public game plus manifest.
6. Catalog contribution, CI success, and rendered Showcase card.
7. Repository architecture, decision log, privacy page, and MIT license.

Use only original, licensed, or generated visual and audio assets. Prefer clean
voiceover without background music. If a child appears, obtain the necessary
guardian consent and avoid showing names, location, notifications, or unrelated
personal data.

## Final export gate

- [ ] Final runtime is below 2:55, leaving upload/transcode margin.
- [ ] Audio explicitly says what was built and how both Codex and GPT-5.6 were used.
- [ ] Every capability shown exists in the exact deployed release.
- [ ] The public Showcase and owner game URLs work signed out.
- [ ] The video contains no secrets, personal notifications, or unlicensed media.
- [ ] The YouTube visibility is Public, not Unlisted or Private.
- [ ] The final URL is copied into README and `docs/DEVPOST-SUBMISSION.md`.
