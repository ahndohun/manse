import { mkdir, copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { chromium } from "@playwright/test";

const origin = process.env.MANSE_FIRE_URL ?? "http://127.0.0.1:4173";
const persistGameEvidence = !origin.startsWith("https://");
const root = resolve(import.meta.dirname, "..");
const gameplayPath = resolve(root, "screenshots/fire-hose-hero-gameplay-final.png");
const victoryPath = resolve(root, "screenshots/fire-hose-hero-victory-final.png");
const showcasePath = resolve(root, "apps/hub/public/featured/fire-hose-hero-gameplay.png");
const videoPath = resolve(root, "video/public/screens/fire-hose-hero-gameplay-final.png");
const gameEvidencePath = resolve(root, "demo-games/fire-hose-hero/evidence/fire-hose-hero-gameplay.png");
const gameVictoryPath = resolve(root, "demo-games/fire-hose-hero/evidence/fire-hose-hero-victory.png");

const outputPaths = [gameplayPath, victoryPath, showcasePath, videoPath];
if (persistGameEvidence) outputPaths.push(gameEvidencePath, gameVictoryPath);
for (const path of outputPaths) {
  await mkdir(dirname(path), { recursive: true });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  locale: "en-US",
  reducedMotion: "no-preference",
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const browserErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") browserErrors.push(`console: ${message.text()}`);
});
page.on("pageerror", (error) => browserErrors.push(`page: ${error.message}`));
page.on("requestfailed", (request) => {
  browserErrors.push(`request: ${request.url()} (${request.failure()?.errorText ?? "failed"})`);
});

try {
  const response = await page.goto(origin, { waitUntil: "networkidle" });
  if (response === null || !response.ok()) {
    throw new Error(`Fire Hose Hero returned ${response?.status() ?? "no response"}.`);
  }

  const stage = page.locator(".stage");
  await stage.scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Start pointer training" }).click();
  await page.waitForFunction(() => {
    const raw = document.querySelector(".stage")?.getAttribute("data-manse-targets") ?? "[]";
    return JSON.parse(raw).length > 0;
  });

  // The game intentionally ignores the synthetic pointer while the start card
  // disappears. Wait for that safety window before creating honest play evidence.
  await page.waitForTimeout(3_350);
  const first = await readTargets(stage).then((targets) => targets.find((target) => !target.hit));
  if (first === undefined) throw new Error("No live first-wave fire was available for evidence capture.");
  await aimAt(stage, first);
  await page.waitForTimeout(260);
  await stage.screenshot({ path: gameplayPath, animations: "disabled" });
  const gameplayCopies = [
    copyFile(gameplayPath, showcasePath),
    copyFile(gameplayPath, videoPath),
  ];
  if (persistGameEvidence) gameplayCopies.push(copyFile(gameplayPath, gameEvidencePath));
  await Promise.all(gameplayCopies);

  const deadline = Date.now() + 100_000;
  while (Date.now() < deadline) {
    if (await page.getByText("Complete", { exact: true }).isVisible().catch(() => false)) break;
    const targets = await readTargets(stage);
    const next = targets.find((target) => !target.hit);
    if (next === undefined) {
      await page.waitForTimeout(150);
      continue;
    }
    await aimAt(stage, next);
    await page.waitForTimeout(1_180);
  }

  await page.getByText("Complete", { exact: true }).waitFor({ state: "visible", timeout: 5_000 });
  await stage.screenshot({ path: victoryPath, animations: "disabled" });
  if (persistGameEvidence) await copyFile(victoryPath, gameVictoryPath);

  if (browserErrors.length > 0) {
    throw new Error(`Browser errors during evidence capture:\n${browserErrors.join("\n")}`);
  }

  const firesOut = (await page.locator(".player-footer strong").textContent())?.trim();
  if (firesOut !== "12 / 12") throw new Error(`Expected 12 / 12 fires out, received ${firesOut ?? "nothing"}.`);
  process.stdout.write(`Captured full-stage gameplay and victory evidence from ${origin} (${firesOut}).\n`);
} finally {
  await context.close();
  await browser.close();
}

async function readTargets(stage) {
  const raw = await stage.getAttribute("data-manse-targets");
  const parsed = JSON.parse(raw ?? "[]");
  return parsed.filter((target) =>
    typeof target?.id === "string" &&
    typeof target?.x === "number" &&
    typeof target?.y === "number" &&
    typeof target?.hit === "boolean"
  );
}

async function aimAt(stage, target) {
  const box = await stage.boundingBox();
  if (box === null) throw new Error("Game stage has no visible bounds.");
  await stage.page().mouse.move(box.x + target.x * box.width, box.y + target.y * box.height);
}
