# Manse release checklist

## Local blocking gates

Run from the game project root:

```bash
npm install
npm run validate
npm run validate:release
npm audit --omit=dev
```

Also inspect the production output for the manifest, pack, thumbnail, pose models, MediaPipe WASM, and provenance. Search source and public files for credentials, analytics, remote runtime URLs, iframe embeds, and unresolved `example.invalid` or `replace-me` values.

## Experience gates

- Start in simulator mode and complete every reachable scene.
- Confirm captions, progress, restart, errors, pointer/touch input, reduced motion, mobile layout, and keyboard focus.
- Test camera only after the user explicitly asks for that check and grants permission.
- Verify that camera denial leaves the simulator usable.

## External-state gates

Creating a production deployment, changing Site access to public, pushing source, and opening a Showcase pull request change external state. Explain the exact action and ask the user immediately before doing it unless they already explicitly authorized that exact action in the current request.

After publishing, verify from an anonymous session:

- the game URL returns success without sign-in;
- `/.well-known/manse-game.json` is public and valid;
- the manifest URLs use the deployment origin and the linked source is public;
- the pack, thumbnail, provenance, models, and WASM are same-origin and reachable;
- no credential, bypass token, or private URL appears in output or source.

Do not call a private owner preview a public release.
