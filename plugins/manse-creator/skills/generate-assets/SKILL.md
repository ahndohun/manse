---
name: generate-assets
description: Generate or integrate original, licensed visual and audio assets for a Manse game and keep pack and Site provenance exact. Use when a creator asks for art, thumbnails, characters, backgrounds, sound, or asset replacement.
---

# Generate Assets

Create assets that are safe to ship, locally bundled, accessible, and traceable.

## Required contract

Read `../../references/creator-contract.md` before creating or downloading any asset.

## Workflow

1. Inspect the game's manifest, pack, `provenance.json`, and `public/asset-provenance.json`. Determine the exact asset IDs, dimensions, formats, locales, alt text, and scene references needed before generation.
2. For bitmap art, use the available image-generation capability. Preserve the complete prompt and the returned model/tool identity. Avoid recognizable copyrighted characters, logos, public figures, photorealistic children, unsafe movement, text baked into art, and deceptive UI.
3. For original programmatic audio, create short non-startling cues at conservative volume. Do not synthesize or clone a person's voice without explicit authority. Store narration transcripts and locales exactly.
4. For any third-party input, verify the source and license before copying it. If the license, creator, or source URL is unclear, stop and ask for a different asset.
5. Put files beneath `public/packs/<slug>/assets/` and use only relative paths such as `assets/images/guide.webp` in the pack.
6. Add the asset to the correct pack collection and add the exact matching record to `provenance.json`:

```json
{
  "kind": "generated",
  "tool": "OpenAI image generation",
  "model": "<reported model>",
  "prompt": "<complete prompt>",
  "generatedAt": "<ISO-8601 time>"
}
```

Include a real SPDX license declaration and attribution. Mirror shipped-file origin, license, and checksum information in `public/asset-provenance.json`.
7. Update alt text, scene references, thumbnail declarations, and `contentProvenance` summary honestly. Do not claim generated assets are original human-authored assets.
8. Run `npm run validate`, visually inspect the result, and report every file and provenance record changed.

## Constraints

- Never hotlink an asset or add a runtime fetch dependency.
- Never omit provenance to make validation pass.
- Never place secrets, personal data, or private source material in an image prompt or metadata.
