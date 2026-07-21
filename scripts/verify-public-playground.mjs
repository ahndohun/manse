import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const DEFAULT_SHOWCASE_ORIGIN = "https://manse-showcase.ran584000.chatgpt.site";
const requestedOrigin = process.env.MANSE_SHOWCASE_URL ?? DEFAULT_SHOWCASE_ORIGIN;
const origin = new URL(requestedOrigin);
assert.equal(origin.protocol, "https:", "The public release gate requires an HTTPS Showcase URL.");

const playgroundUrl = new URL("/playground?provider=simulated", origin);
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const response = await page.goto(playgroundUrl.href, { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200, `Playground returned ${response?.status() ?? "no response"}.`);

  const stage = page.locator(".playground-stage");
  await stage.scrollIntoViewIfNeeded();
  await page.getByText("0 / 3", { exact: true }).waitFor({ state: "visible", timeout: 15_000 });

  assert.equal(await stage.locator("[data-manse-renderer]").count(), 1, "Expected one mounted renderer.");
  assert.equal(
    await stage.locator("[data-manse-renderer] canvas").count(),
    2,
    "The WebGL renderer must contain one camera canvas and one overlay canvas.",
  );

  const bounds = await stage.boundingBox();
  assert(bounds !== null && bounds.width > 0 && bounds.height > 0, "Playground stage has no visible bounds.");

  // These are the deterministic centers produced by the public three-target
  // challenge: reachable box 0.16..0.84/0.90, target scale 1.2, tier A.
  const targetCenters = [
    [0.3768, 0.3918],
    [0.6232, 0.3918],
    [0.3768, 0.6682],
  ];

  for (const [index, [x, y]] of targetCenters.entries()) {
    await page.mouse.move(bounds.x + bounds.width * x, bounds.y + bounds.height * y);
    await page.waitForTimeout(350);
    await page.getByText(`${index + 1} / 3`, { exact: true }).waitFor({ state: "visible", timeout: 3_000 });
  }

  await page.getByText("Targets cleared", { exact: true }).waitFor({ state: "visible", timeout: 3_000 });
  assert.deepEqual(pageErrors, [], `Browser errors: ${pageErrors.join("; ")}`);

  console.log(`Public Playground passed: ${playgroundUrl.href} completed 3 / 3 signed out.`);
} finally {
  await browser.close();
}
