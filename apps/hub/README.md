# Manse Showcase

The public, Sites-compatible discovery surface for Manse games. It links to independent creator-owned game Sites and never uploads, proxies, or embeds third-party game code.

## Local development

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Routes

- `/` — public product overview and reviewed game catalog
- `/docs` — plugin installation, creator workflow, game contract, runtime, and privacy guidance
- `/submit` — lightweight public manifest and catalog review flow

## Catalog boundary

`app/catalog/catalog.snapshot.json` is the checked-in, reviewed build snapshot. `app/catalog/catalog.ts` provides the typed reader and client filtering contract. The production Site does not fetch creator manifests at runtime.

The Showcase has no login, database, object storage, upload form, analytics, or publishing API. `.openai/hosting.json` deliberately keeps both D1 and R2 set to `null`.

## Sites shape

This project preserves the bundled vinext and Cloudflare Worker scaffold used by ChatGPT Sites. It can also be self-hosted under the repository's MIT license.
