# OpenAI Build Week demo script

Final duration: **2:26.624**. The uploaded YouTube video must remain under three
minutes, be public, include audio, and match the final deployed build.

Replace every placeholder before recording. Do not show owner-only URLs,
credentials, private tabs, camera footage without consent, or functionality the
release does not perform.

## Storyboard and voiceover

| Time | Screen | Voiceover |
| --- | --- | --- |
| 0:00–0:13 | Open directly on the public Fire Hose Hero mission: sweep the continuous hose across reactive fires, show the score/timer/pressure HUD, and reach the next alarm. | “This is Manse: an open-source engine and publishing ecosystem for camera-based active games. A normal link turns a phone, computer, tablet, or compatible display into the play surface.” |
| 0:13–0:29 | Showcase architecture and privacy promise. | “Closed motion-game platforms own the format and storefront. Manse opens the engine, declarative game format, creator tools, and catalog. Players need no Manse account, controller, subscription, or runtime AI service.” |
| 0:29–0:45 | Show the plain-language creator brief and the generated movement, accessibility, asset, and version plan. | “For creators, Codex is the studio. I describe a game in plain language. The Manse Creator plugin uses GPT-5.6 to plan movement, accessibility, original assets, and a versioned project before it writes files.” |
| 0:45–1:02 | Show the generated creator-owned project, provenance, bundled runtime, and seven plugin workflows. | “The output is not opaque code from a central service. It is a creator-owned Site, a strict data-only pack, and auditable provenance. Seven workflows cover creation, assets, preview, validation, remixing, publishing, and Showcase submission.” |
| 1:02–1:20 | Show the six-site public catalog and signed-out simulator path. | “The simulator is the fastest judge path and uses the same engine session as camera play. The public catalog includes touch, dodge, freeze, squat, and jump games. Camera permission starts only after an explicit action, and Manse never transmits camera frames or pose data.” |
| 1:20–1:38 | Show the one-contract validation gate, including successful checks and intentional invalid-fixture rejection. | “One contract drives the schema, validator, runtime loader, starter, publisher, and catalog. Validation checks paths, accessibility, licenses, provenance, tests, types, and the production build—and intentionally invalid packs must fail.” |
| 1:38–1:53 | Show an independently hosted creator Site plus its public manifest evidence. | “With my approval, Codex packages the self-contained game and publishes an independent public Site. Runtime code, models, WebAssembly, packs, and media are bundled; play needs no API key or external runtime CDN.” |
| 1:53–2:09 | Show the manifest-only catalog flow from public URL through CI and maintainer approval to the outbound link. | “The Showcase receives only a public manifest URL. CI validates it, a maintainer approves it, and the catalog links to the creator's Site. Manse never uploads, proxies, iframes, or executes that third-party game.” |
| 2:09–2:27 | Close on the repository, MIT/self-hostable/privacy/open-format proof, and public Showcase URL. | “Codex and GPT-5.6 built the platform and power the creator workflow: GPT-5.6 is the factory; the browser is the product. Manse is MIT licensed, self-hostable, privacy-first, and ready for creators to extend.” |

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

- [x] Final runtime is below 2:55, leaving upload/transcode margin.
- [x] Audio explicitly says what was built and how both Codex and GPT-5.6 were used.
- [x] Every capability shown exists in the exact deployed release.
- [x] The public Showcase and owner game URLs work signed out.
- [x] The video contains no secrets, personal notifications, or unlicensed media.
- [ ] The YouTube visibility is Public, not Unlisted or Private.
- [ ] The final URL is copied into README and `docs/DEVPOST-SUBMISSION.md`.

## YouTube release metadata

Use this exact metadata for the public upload so the release remains
reproducible and the judge path is visible without opening the description
editor again.

- **Title:** Manse — Open-Source Motion Games Built with Codex + GPT-5.6
- **Audience:** Confirm with the channel owner at upload time. The video is a
  developer-tool demonstration, while the games themselves support family play.
- **Visibility:** Public
- **Thumbnail:** Use the approved 16:9 opening-gameplay frame with the complete
  Fire Hose Hero HUD visible.

```text
Manse turns Codex into an open studio for camera-based active games. Create,
validate, preview, and publish independent motion-game Sites from a
plain-language brief—without a central game runner or runtime AI dependency.

Live Showcase:
https://manse-showcase.ran584000.chatgpt.site

Flagship game — Fire Hose Hero:
https://fire-hose-hero.ran584000.chatgpt.site

Source and Manse Creator installation:
https://github.com/ahndohun/manse

Built for OpenAI Build Week with Codex and GPT-5.6. Camera frames and inferred
pose data stay on the playing device. The engine, declarative pack format,
creator plugin, validator, publisher workflow, and Showcase are MIT licensed
and self-hostable.
```
