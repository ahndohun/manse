# Contributing Games to the Manse Showcase

The official Manse Showcase is a curated directory of independently hosted
motion games. Contributing a game means adding one public manifest URL to the
catalog. It does **not** upload the game, transfer ownership, or execute the game
inside the Showcase.

```text
creator-owned Site -> public manifest -> catalog pull request
                   -> automated checks -> maintainer review -> static listing
```

Anyone may publish a compatible game without joining the official Showcase.
Anyone may also fork the MIT-licensed Showcase and curate a different catalog.

## Listing prerequisites

Before opening a catalog pull request, the game must:

- be deployed at a stable public HTTPS URL
- open and reach its start/setup experience without an account
- expose `/.well-known/manse-game.json` at its deployment origin
- use a manifest and packs accepted by the current Manse validator
- declare a compatible engine version and bundle its runtime dependencies
- use only same-Site, relative pack assets; no runtime engine CDN
- publish a source repository under a declared license
- declare supported locales, age range, movement, energy, and accessibility
  metadata honestly
- include a safe public thumbnail and traceable asset provenance
- keep camera frames, pose landmarks, and child data on the playing device
- avoid analytics and undeclared permissions
- provide a working simulator or documented alternate test path when camera
  access is unavailable

A passing schema check is necessary but not sufficient. Maintainers also review
the title, description, media, instructions, movement safety, audience claims,
licenses, and privacy behavior.

## Prepare the game with Manse Creator

The recommended non-developer path is to ask the installed Manse Creator plugin:

> Validate my public game, verify its manifest, and prepare a Manse Showcase
> submission.

The plugin should run deterministic local validation, inspect the deployed Site,
and prepare the smallest catalog change. Review its findings and the final diff
before opening a pull request.

The equivalent CLI building blocks are:

```bash
manse validate ./my-game
manse manifest ./my-game
manse catalog add https://game.example/.well-known/manse-game.json \
  --catalog ./catalog/catalog.json
manse catalog build ./catalog/catalog.json \
  --out ./apps/hub/app/catalog/catalog.snapshot.json
```

All commands support `--json` for automation. Use `manse --help` from the built
checkout as the authority for the current command surface. The CLI does not
publish to Sites and does not upload game files to Manse.

## Catalog contribution

The source catalog has one intentionally small entry per game:

```json
{
  "schemaVersion": 1,
  "games": [
    {
      "manifestUrl": "https://game.example/.well-known/manse-game.json"
    }
  ]
}
```

Do not copy title, description, thumbnails, or other game metadata into the
source entry by hand. The catalog build resolves the public manifest, validates
it, and produces the checked-in static snapshot consumed by the Showcase. This
prevents metadata drift and keeps production rendering independent of live
third-party catalog requests.

Only add a manifest URL. Do not add game bundles, camera captures, user data,
credentials, executable pack code, or a creator access token.

## Pull request process

1. Fork the Manse repository and create a focused branch.
2. Add the deployed manifest URL to the source catalog, preferably through Manse
   Creator or `manse catalog add`.
3. Regenerate the static catalog snapshot with the current CLI.
4. Run the catalog validator and relevant Showcase production build.
5. Open a pull request containing only the catalog source/snapshot changes that
   the workflow requires.
6. In the description, identify the game, creator, source repository, test
   devices, camera and simulator paths, and any accessibility limitations.
7. Let CI fetch the public Site and manifest. Do not replace failed checks with
   screenshots or locally edited metadata.
8. Respond to maintainer safety, provenance, compatibility, or copy questions.
9. A maintainer approves and merges only after automated checks pass.

The official release repository and pull request form will be linked from
`<REPOSITORY_URL>`.

## Automated checks

Showcase CI is expected to reject a listing when any of the following is true:

- the game or manifest URL is not public HTTPS
- the manifest is unreachable, redirects unexpectedly, or is invalid
- the stable id or slug conflicts with another game
- the engine compatibility range is unsupported
- required discovery, accessibility, license, source, or provenance fields are
  absent
- the declared game URL or source URL does not match the submission
- the thumbnail is an unsafe URL or unsupported media type
- pack references escape their root, use forbidden executable content, or fail
  integrity checks
- the generated snapshot does not match the reviewed public metadata

CI validates structure and objective policy. It does not decide whether a
movement is age-appropriate, whether a description is misleading, or whether a
license declaration is truthful; those remain review responsibilities.

## Maintainer review

Maintainers evaluate:

- **Playable access:** a clean browser can open the Site without sign-in,
  rebuilding, an API key, or a Manse account.
- **Clear setup:** camera permission, framing, play-space, stop, and fallback
  behavior are understandable.
- **Physical safety:** required movements match the declared audience and space;
  instructions do not encourage dangerous behavior.
- **Privacy:** the deployed game follows the local-camera contract and has no
  hidden analytics or player-data collection.
- **Accessibility:** captions, language, reduced-movement, reduced-stimulation,
  and other claimed features actually work.
- **Content:** public copy and media are suitable for the declared age range and
  do not impersonate an official Manse endorsement.
- **Provenance:** generated and third-party assets have credible origin, license,
  and attribution metadata.
- **Compatibility:** device and performance claims are supported by reported
  evidence rather than broad marketing language.
- **Source correspondence:** the public Site, public manifest, and linked source
  describe the same game release.

Maintainers may ask a creator to narrow an age, device, accessibility, or
performance claim without rejecting the underlying game.

## Content and brand rules

Do not submit games that:

- collect personal information from children or upload camera/pose data
- contain sexual, exploitative, hateful, graphic, or age-inappropriate content
- instruct dangerous physical activity or conceal meaningful health/safety risk
- use unlicensed music, video, characters, artwork, voices, or trademarks
- include deceptive links, credential prompts, malware, or arbitrary code in a
  v1 pack
- present themselves as endorsed, reviewed for medical use, or guaranteed safe
  by Manse
- require payment, an account, or a subscription to reach the listed experience

The creator may use the Manse name to describe format compatibility. The creator
must not use it to imply ownership or endorsement by the Manse maintainers.

## Accessibility disclosure

The manifest is a discovery aid, not a place for aspirational checkboxes. Claim a
feature only after testing it. At minimum, describe:

- spoken-language locales and caption locales
- movement types and whether seated or reduced-movement alternatives exist
- expected play-space and whether the game requires the full body in frame
- audio-only or color-only information and its alternative
- flashing, rapid motion, or high-stimulation content
- input alternatives when camera access is unavailable

If a game cannot support an audience or device, say so plainly. Honest limits
help players choose safely.

## Updating a listed game

Creators control their Sites and may deploy updates, but a listing is based on a
reviewed manifest and observed release. For a material update:

1. validate the new deployment and packs
2. keep the stable game id unchanged for the same game
3. update version, compatibility, provenance, and disclosures
4. regenerate the catalog snapshot
5. open a catalog pull request describing the material changes

Changes to privacy behavior, movement intensity, age range, engine compatibility,
license, source URL, or ownership always require re-review.

## Delisting and ownership changes

Delisting removes the discovery link; it does not delete or disable the
creator-owned Site. Maintainers may delist a game that becomes unavailable,
unsafe, misleading, incompatible, unlicensed, or inconsistent with its reviewed
manifest.

A creator can request delisting through a focused catalog pull request. An
ownership transfer must update the source and manifest declarations and be
reviewed like a material release.

## Creating an independent Showcase

The official Showcase is not a gatekeeper. To operate another compatible
directory:

1. fork the MIT-licensed repository
2. maintain a catalog of public manifest URLs
3. run the same schema and catalog build
4. publish the generated static snapshot with the Showcase app
5. document your own review, removal, and privacy policies

An independent Showcase must not describe itself as the official Manse catalog
unless authorized by the project maintainers.
