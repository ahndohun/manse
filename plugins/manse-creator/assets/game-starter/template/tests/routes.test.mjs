import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the anonymous game start experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Play with pointer|포인터로 플레이/);
  assert.match(html, /Camera frames stay on this device|카메라 영상은 이 기기에만 남습니다/);
  assert.match(html, />KO<.*>EN</s);
  assert.match(html, /class="hero-visual hero-fallback"/);
  assert.doesNotMatch(html, /class="hero-image"/);
  assert.doesNotMatch(html, /signin-with-chatgpt|<iframe\b|<form\b/i);
});

test("generated UI wires localization, theme, source, and safe player reset contracts", async () => {
  const manifest = JSON.parse(await readFile("public/.well-known/manse-game.json", "utf8"));
  const [html, configSource, clientSource] = await Promise.all([
    render().then((response) => response.text()),
    readFile("app/game-config.ts", "utf8"),
    readFile("app/GameClient.tsx", "utf8"),
  ]);

  assert.match(html, new RegExp(`href="${manifest.sourceUrl.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}"`));
  assert.match(html, /style="--game-background:#[0-9a-f]{6};--game-surface:#[0-9a-f]{6};--game-accent:#[0-9a-f]{6}/i);
  assert.match(configSource, /"title":\{"en":/);
  assert.match(configSource, /"summary":\{"en":/);
  assert.match(configSource, /"imageUrl":null/);
  assert.match(configSource, /"theme":\{"background":"#[0-9a-f]{6}"/i);
  assert.doesNotMatch(configSource, /__[A-Z][A-Z0-9_]*__/);
  assert.match(clientSource, /createMansePlayer\(\{[\s\S]*?locale,/);
  assert.match(clientSource, /navigator\.languages\[0\]/);
  assert.match(clientSource, /await player\?\.destroy\(\)/);
  assert.match(clientSource, /Play with pointer/);
  assert.match(clientSource, /포인터로 플레이/);
  assert.match(clientSource, /Local play · no analytics/);
  assert.doesNotMatch(clientSource, /runtime ready|device tier|런타임 준비됨|기기 등급/i);
});

test("build bundles the public contract and pose runtime", async () => {
  const manifest = JSON.parse(await readFile("public/.well-known/manse-game.json", "utf8"));
  assert.equal(typeof manifest.slug, "string");
  assert.equal(manifest.slug.length > 0, true);
  await access(`public/packs/${manifest.slug}/manse.pack.json`);
  await access("dist/client/sw.js");
  await access("dist/client/models/pose_landmarker_lite.task");
  await access("dist/client/vendor/mediapipe/wasm/vision_wasm_internal.wasm");
  const clientEntries = await readdir("dist/client", { recursive: true });
  const scripts = await Promise.all(
    clientEntries.filter((entry) => entry.endsWith(".js")).map((entry) => readFile(`dist/client/${entry}`, "utf8")),
  );
  assert.equal(
    scripts.some((script) => script.includes("serviceWorker") && script.includes("/sw.js")),
    true,
    "the production client must register the bundled service worker",
  );
});
