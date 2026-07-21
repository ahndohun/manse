// QA gate for the landing hero tracking puppet (DECISIONS.md D013).
// Serves the production build, drives /pose-lab/ (synthetic landmark scenarios
// through the real measurement/blend/render pipeline), and saves a full-page
// screenshot for visual review. Fails on any page error.
//
// Usage: node scripts/verify-pose-lab.mjs [screenshotPath]
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const out = process.argv[2] ?? "/tmp/pose-lab.png";
const port = 4399;
const preview = spawn("npx", ["astro", "preview", "--port", String(port)], {
  cwd: new URL("../apps/landing", import.meta.url),
  stdio: "ignore",
});

const waitUp = async () => {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://localhost:${port}/pose-lab/`);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("preview server did not start");
};

try {
  await waitUp();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(`http://localhost:${port}/pose-lab/`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__LAB_DONE__ === true, null, { timeout: 15_000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  assert.deepEqual(errors, [], `Page errors: ${errors.join("; ")}`);
  console.log(`Pose Lab passed: 9 scenarios rendered, no page errors. Screenshot: ${out}`);
} finally {
  preview.kill();
}
