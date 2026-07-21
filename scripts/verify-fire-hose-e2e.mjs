import { chromium } from "@playwright/test";

const origin = process.env.MANSE_FIRE_URL ?? "http://127.0.0.1:4173";
const cases = [
  { name: "desktop", viewport: { width: 1280, height: 900 }, reducedMotion: "no-preference" },
  { name: "mobile-reduced", viewport: { width: 390, height: 844 }, reducedMotion: "reduce" },
];

const browser = await chromium.launch({ headless: true });
try {
  for (const testCase of cases) await verifyCase(browser, testCase);
  await verifyFailureStatus(browser);
} finally {
  await browser.close();
}

async function verifyCase(browser, testCase) {
  const context = await browser.newContext({
    locale: "en-US",
    viewport: testCase.viewport,
    reducedMotion: testCase.reducedMotion,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  page.on("requestfailed", (request) => errors.push(`request: ${request.url()} (${request.failure()?.errorText ?? "failed"})`));

  try {
    const response = await page.goto(origin, { waitUntil: "networkidle" });
    if (response === null || !response.ok()) throw new Error(`${testCase.name}: initial request failed.`);
    await assertNoHorizontalOverflow(page, `${testCase.name} start`);
    const reduced = await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (reduced !== (testCase.reducedMotion === "reduce")) {
      throw new Error(`${testCase.name}: reduced-motion media query did not match the requested mode.`);
    }

    const start = page.getByRole("button", { name: "Start pointer training" });
    await start.focus();
    if (!(await start.evaluate((button) => document.activeElement === button))) {
      throw new Error(`${testCase.name}: start control could not receive keyboard focus.`);
    }
    await start.press("Enter");
    const stage = page.locator(".stage");
    await page.waitForFunction(() => {
      const raw = document.querySelector(".stage")?.getAttribute("data-manse-targets") ?? "[]";
      return JSON.parse(raw).length > 0;
    });
    await page.waitForTimeout(3_350);
    await assertNoHorizontalOverflow(page, `${testCase.name} mission`);
    const caption = await page.locator(".player-footer .sr-only").textContent();
    if (!caption?.includes("Three fires")) throw new Error(`${testCase.name}: the first mission caption was not exposed.`);

    const deadline = Date.now() + 100_000;
    while (Date.now() < deadline) {
      if (await page.getByText("Complete", { exact: true }).isVisible().catch(() => false)) break;
      const targets = await readTargets(stage);
      const target = targets.find((candidate) => !candidate.hit);
      if (target === undefined) {
        await page.waitForTimeout(150);
        continue;
      }
      await aimAt(stage, target);
      await page.waitForTimeout(1_180);
    }

    await page.getByText("Complete", { exact: true }).waitFor({ state: "visible", timeout: 5_000 });
    const tally = (await page.locator(".player-footer strong").textContent())?.trim();
    if (tally !== "12 / 12") throw new Error(`${testCase.name}: expected 12 / 12, received ${tally ?? "nothing"}.`);
    await assertNoHorizontalOverflow(page, `${testCase.name} completion`);

    await page.getByRole("button", { name: "Restart with pointer" }).click();
    await page.waitForFunction(() => document.querySelector(".player-footer strong")?.textContent?.trim() === "0 / 12");
    await page.waitForFunction(() => {
      const raw = document.querySelector(".stage")?.getAttribute("data-manse-targets") ?? "[]";
      const targets = JSON.parse(raw);
      return targets.length === 3 && targets.every((target) => target.hit === false);
    });

    if (errors.length > 0) throw new Error(`${testCase.name}: browser errors:\n${errors.join("\n")}`);
    process.stdout.write(`E2E PASS ${testCase.name}: 12/12, restart, focus, captions, overflow, errors.\n`);
  } finally {
    await context.close();
  }
}

async function verifyFailureStatus(browser) {
  const context = await browser.newContext({
    locale: "en-US",
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  page.on("requestfailed", (request) => errors.push(`request: ${request.url()} (${request.failure()?.errorText ?? "failed"})`));

  try {
    const response = await page.goto(origin, { waitUntil: "networkidle" });
    if (response === null || !response.ok()) throw new Error("failure-status: initial request failed.");
    await page.getByRole("button", { name: "Start pointer training" }).click();
    await page.waitForFunction(() => {
      const raw = document.querySelector(".stage")?.getAttribute("data-manse-targets") ?? "[]";
      return JSON.parse(raw).length === 3;
    });

    await page.getByText("Ready to retry", { exact: true }).waitFor({ state: "visible", timeout: 45_000 });
    const caption = await page.locator(".player-footer .sr-only").textContent();
    if (!caption?.includes("The alarm is still active")) {
      throw new Error("failure-status: terminal failure caption was not exposed.");
    }
    await page.getByRole("button", { name: "Restart with pointer" }).waitFor({ state: "visible" });
    await assertNoHorizontalOverflow(page, "failure-status terminal");
    if (errors.length > 0) throw new Error(`failure-status: browser errors:\n${errors.join("\n")}`);
    process.stdout.write("E2E PASS failure-status: timed out naturally, retry label, caption, restart, overflow, errors.\n");
  } finally {
    await context.close();
  }
}

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth - window.innerWidth,
    root: document.documentElement.scrollWidth - window.innerWidth,
  }));
  if (overflow.body > 1 || overflow.root > 1) {
    throw new Error(`${label}: horizontal overflow ${JSON.stringify(overflow)}.`);
  }
}

async function readTargets(stage) {
  const raw = await stage.getAttribute("data-manse-targets");
  return JSON.parse(raw ?? "[]");
}

async function aimAt(stage, target) {
  const box = await stage.boundingBox();
  if (box === null) throw new Error("Game stage has no visible bounds.");
  await stage.page().mouse.move(box.x + target.x * box.width, box.y + target.y * box.height);
}
