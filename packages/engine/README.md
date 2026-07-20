# `@manse/engine`

Pure, renderer-agnostic gameplay logic for Manse. The package contains no camera,
DOM, storage, network, audio, or rendering side effects. Browser integrations feed
normalized pose frames into this package and render its snapshots and events.

The public API includes a bounded fixed-timestep clock, `GameSpace`, object pools,
all six v1 challenge detectors, the MANSE pose, terminal-aware episode execution,
bounded adaptation, accessibility policy, tier fairness assistance, and local
session-stat recording.

Run `npm test`, `npm run typecheck`, and `npm run build` from this directory.
