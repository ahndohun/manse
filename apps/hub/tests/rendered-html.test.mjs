import assert from "node:assert/strict";
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
  assert.match(html, /Community showcase/);
  assert.match(html, /0 games/);
  assert.match(html, /The stage is open/);
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

test("keeps catalog data local, typed, empty-ready, and storage-free", async () => {
  const [snapshotText, catalogSource, hostingText, packageText] = await Promise.all([
    readFile(new URL("app/catalog/catalog.snapshot.json", projectRoot), "utf8"),
    readFile(new URL("app/catalog/catalog.ts", projectRoot), "utf8"),
    readFile(new URL(".openai/hosting.json", projectRoot), "utf8"),
    readFile(new URL("package.json", projectRoot), "utf8"),
  ]);
  const snapshot = JSON.parse(snapshotText);
  const hosting = JSON.parse(hostingText);

  assert.deepEqual(snapshot, { schemaVersion: 1, generatedAt: null, games: [] });
  assert.deepEqual(hosting, { d1: null, r2: null });
  assert.match(catalogSource, /export interface CatalogGame/);
  assert.match(catalogSource, /export function readCatalogSnapshot/);
  assert.match(catalogSource, /export function filterCatalogGames/);
  assert.match(catalogSource, /parsed\.protocol !== "https:"/);
  assert.doesNotMatch(catalogSource, /fetch\s*\(/);
  assert.doesNotMatch(packageText, /react-loading-skeleton/);
  await assert.rejects(access(new URL("app/_sites-preview", projectRoot)));
});
