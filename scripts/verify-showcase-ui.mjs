import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const origin = process.env.MANSE_SHOWCASE_URL ?? "http://127.0.0.1:4174";
const output = resolve(import.meta.dirname, "../screenshots");
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  await verifyDesktop(browser);
  await verifyMobile(browser);
} finally {
  await browser.close();
}

async function verifyDesktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const errors = collectErrors(page);
  try {
    const response = await page.goto(origin, { waitUntil: "networkidle" });
    if (response === null || !response.ok()) throw new Error("Desktop Showcase request failed.");
    await page.screenshot({ path: resolve(output, "showcase-desktop-final.png") });
    await assertLayout(page, "desktop");

    const proof = page.getByRole("link", { name: "Play the Fire Hose Hero flagship mission" });
    await proof.waitFor({ state: "visible" });
    const proofBox = await proof.boundingBox();
    if (proofBox === null || proofBox.y + proofBox.height > 900 + 8) {
      throw new Error(`Desktop flagship proof is not visible in the first viewport: ${JSON.stringify(proofBox)}.`);
    }

    const catalog = page.locator(".catalog-section");
    await catalog.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await page.screenshot({ path: resolve(output, "showcase-catalog-final.png") });
    const actionOverflow = await page.locator(".game-card-actions").evaluateAll((actions) =>
      actions.map((action) => action.scrollWidth - action.clientWidth),
    );
    if (actionOverflow.some((value) => value > 1)) throw new Error(`Desktop card actions overflow: ${actionOverflow.join(", ")}.`);

    const search = page.getByRole("searchbox", { name: "Search showcase games" });
    await search.fill("Fire Hose");
    await page.getByText("1 game", { exact: true }).waitFor({ state: "visible" });
    if ((await page.locator(".game-card").count()) !== 1) throw new Error("Catalog search did not narrow to one card.");
    await page.getByRole("button", { name: "Clear filters" }).click();
    await page.getByText("6 games", { exact: true }).waitFor({ state: "visible" });

    if (errors.length > 0) throw new Error(`Desktop browser errors:\n${errors.join("\n")}`);
    process.stdout.write("SHOWCASE PASS desktop: proof above fold, six cards, filters, no overflow or browser errors.\n");
  } finally {
    await context.close();
  }
}

async function verifyMobile(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", isMobile: true });
  const page = await context.newPage();
  const errors = collectErrors(page);
  try {
    const response = await page.goto(origin, { waitUntil: "networkidle" });
    if (response === null || !response.ok()) throw new Error("Mobile Showcase request failed.");
    await page.screenshot({ path: resolve(output, "showcase-mobile-final.png") });
    await assertLayout(page, "mobile");

    const ctas = await page.locator(".hero-ctas .button").evaluateAll((buttons) =>
      buttons.map((button) => ({ width: button.getBoundingClientRect().width, overflow: button.scrollWidth - button.clientWidth })),
    );
    if (ctas.length !== 2 || ctas.some(({ width, overflow }) => width < 350 || overflow > 1)) {
      throw new Error(`Mobile hero CTAs are not full-width and intact: ${JSON.stringify(ctas)}.`);
    }

    await page.locator(".catalog-section").scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);
    await page.screenshot({ path: resolve(output, "showcase-mobile-catalog-final.png") });
    const cardColumns = await page.locator(".game-card").evaluateAll((cards) =>
      cards.map((card) => Math.round(card.getBoundingClientRect().width)),
    );
    if (cardColumns.length !== 6 || cardColumns.some((width) => width < 350)) {
      throw new Error(`Mobile catalog is not a six-card single column: ${cardColumns.join(", ")}.`);
    }

    if (errors.length > 0) throw new Error(`Mobile browser errors:\n${errors.join("\n")}`);
    process.stdout.write("SHOWCASE PASS mobile-reduced: full-width CTAs, six single-column cards, no overflow or browser errors.\n");
  } finally {
    await context.close();
  }
}

async function assertLayout(page, label) {
  const metrics = await page.evaluate(() => ({
    body: document.body.scrollWidth - innerWidth,
    root: document.documentElement.scrollWidth - innerWidth,
    image: document.querySelector('img[alt^="Fire Hose Hero gameplay"]')?.getBoundingClientRect().width ?? 0,
  }));
  if (metrics.body > 1 || metrics.root > 1) throw new Error(`${label}: horizontal overflow ${JSON.stringify(metrics)}.`);
  if (metrics.image < 300) throw new Error(`${label}: flagship gameplay image is missing or too small.`);
}

function collectErrors(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  page.on("requestfailed", (request) => errors.push(`request: ${request.url()} (${request.failure()?.errorText ?? "failed"})`));
  return errors;
}
