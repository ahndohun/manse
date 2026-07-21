import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the public Showcase from the reviewed static catalog", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Every screen can be a/);
  assert.match(html, /Play motion games in any browser\./);
  assert.match(html, /Playable showcase/);
  assert.match(html, /Flagship mission · real gameplay/);
  assert.match(html, /Engine mechanic demo · cover art/);
  assert.match(html, /\/featured\/fire-hose-hero-gameplay\.png/);
  assert.match(html, /Morning Star Catch/);
  assert.match(html, /Fire Hose Hero/);
  assert.match(html, /Fruit Basket Catch/);
  assert.match(html, /Museum Statues/);
  assert.match(html, /Froggy Hops/);
  assert.match(html, /Monkey Bananas/);
  assert.doesNotMatch(html, /camera on · frames stay on device/i);
  assert.match(html, /Install Manse Creator/);
  assert.match(html, /Camera frames are processed on the playing device/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
  assert.doesNotMatch(html, /<iframe\b|signin-with-chatgpt|<form\b/i);
});

test("server-renders anonymous creator docs and listing guidance", async () => {
  const [docsResponse, submitResponse] = await Promise.all([
    render("/docs"),
    render("/submit"),
  ]);
  assert.equal(docsResponse.status, 200);
  assert.equal(submitResponse.status, 200);

  const [docsHtml, submitHtml] = await Promise.all([
    docsResponse.text(),
    submitResponse.text(),
  ]);
  assert.match(docsHtml, /Add Manse Creator to Codex/);
  assert.match(docsHtml, /\.well-known\/manse-game\.json/);
  assert.match(docsHtml, /does not require an OpenAI API key/);
  assert.match(submitHtml, /Publish there\. Get discovered here\./);
  assert.match(submitHtml, /Automation first\. A human last\./);
  assert.match(submitHtml, /Manse lists games\. It does not host them\./);
  assert.doesNotMatch(`${docsHtml}${submitHtml}`, /signin-with-chatgpt|<form\b/i);
});

test("server-renders the camera-free engine playground judge path", async () => {
  const response = await render("/playground");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Try the engine in/);
  assert.match(html, /No camera needed/);
  assert.match(html, /content-neutral Manse engine playground/);
  assert.match(html, /Simulator mode is intentionally first/);
  assert.doesNotMatch(html, /sign in|API key required|<iframe\b/i);
});

test("keeps the six-game catalog local, typed, movement-complete, and storage-free", async () => {
  const [snapshotText, catalogSource, layoutSource, hostingText, packageText] = await Promise.all([
    readFile(new URL("app/catalog/catalog.snapshot.json", projectRoot), "utf8"),
    readFile(new URL("app/catalog/catalog.ts", projectRoot), "utf8"),
    readFile(new URL("app/layout.tsx", projectRoot), "utf8"),
    readFile(new URL(".openai/hosting.json", projectRoot), "utf8"),
    readFile(new URL("package.json", projectRoot), "utf8"),
  ]);
  const snapshot = JSON.parse(snapshotText);
  const hosting = JSON.parse(hostingText);

  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.games.length, 6);
  assert.deepEqual(
    new Set(snapshot.games.flatMap((game) => game.manifest.movementTags)),
    new Set(["touch", "freeze", "dodge", "squat", "jump"]),
  );
  assert.equal(hosting.project_id, "appgprj_6a5ea92484688191b35d04b21d5d5cf9");
  assert.equal(hosting.d1, null);
  assert.equal(hosting.r2, null);
  assert.match(catalogSource, /export interface CatalogGame/);
  assert.match(catalogSource, /export function readCatalogSnapshot/);
  assert.match(catalogSource, /export function filterCatalogGames/);
  assert.match(catalogSource, /parsed\.protocol !== "https:"/);
  assert.doesNotMatch(catalogSource, /fetch\s*\(/);
  for (const tag of ["touch", "freeze", "dodge", "squat", "pose", "jump", "strike", "step", "combo"]) {
    assert.match(catalogSource, new RegExp(`"${tag}"`));
  }
  assert.match(layoutSource, /manse-showcase\.ran584000\.chatgpt\.site/);
  assert.doesNotMatch(layoutSource, /["']manse\.chatgpt\.site["']/);
  assert.doesNotMatch(packageText, /react-loading-skeleton/);
  await assert.rejects(access(new URL("app/_sites-preview", projectRoot)));
  await access(new URL("dist/client/models/pose_landmarker_lite.task", projectRoot));
  await access(new URL("dist/client/vendor/mediapipe/wasm/vision_wasm_internal.wasm", projectRoot));
});

test("records integrity and license metadata for every bundled runtime asset", async () => {
  const provenance = JSON.parse(await readFile(new URL("public/asset-provenance.json", projectRoot), "utf8"));
  assert.equal(provenance.schemaVersion, 1);
  assert.equal(provenance.assets.length, 10);
  for (const asset of provenance.assets) {
    assert.match(asset.path, /^\/(?:models|playground|featured|vendor\/mediapipe\/wasm|og\.png)/);
    assert.equal(typeof asset.license, "string");
    assert.match(asset.sha256, /^[a-f0-9]{64}$/);
    const contents = await readFile(new URL(`public${asset.path}`, projectRoot));
    const digest = createHash("sha256").update(contents).digest("hex");
    assert.equal(digest, asset.sha256, asset.path);
  }
});
