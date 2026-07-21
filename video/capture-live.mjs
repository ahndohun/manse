import assert from 'node:assert/strict';
import {mkdir, rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(here, 'public', 'clips');
const temporaryDir = path.join(here, '.capture-tmp');
const origin = new URL(
  process.env.MANSE_SHOWCASE_URL ??
    'https://manse-showcase.ran584000.chatgpt.site',
);
const fireOrigin = new URL(
  process.env.MANSE_FIRE_URL ??
    'https://fire-hose-hero.ran584000.chatgpt.site',
);

assert.equal(
  origin.protocol,
  'https:',
  'Live submission captures must use the public HTTPS deployment.',
);
assert.equal(
  fireOrigin.protocol,
  'https:',
  'Flagship gameplay capture must use the public HTTPS deployment.',
);

await rm(temporaryDir, {recursive: true, force: true});
await mkdir(temporaryDir, {recursive: true});
await mkdir(outputDir, {recursive: true});

const browser = await chromium.launch({headless: true});

async function capture(name, run) {
  const context = await browser.newContext({
    viewport: {width: 1280, height: 720},
    recordVideo: {dir: temporaryDir, size: {width: 1280, height: 720}},
    colorScheme: 'light',
    locale: 'en-US',
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') pageErrors.push(`console: ${message.text()}`);
  });
  page.on('requestfailed', (request) => {
    pageErrors.push(`request: ${request.url()} (${request.failure()?.errorText ?? 'failed'})`);
  });

  try {
    await run(page);
    assert.deepEqual(pageErrors, [], `${name} page errors: ${pageErrors.join('; ')}`);
    const video = page.video();
    assert(video !== null, `${name} did not start a video recording.`);
    await context.close();
    await video.saveAs(path.join(outputDir, `${name}.webm`));
  } catch (error) {
    await context.close().catch(() => undefined);
    throw error;
  }
}

try {
  await capture('fire-hose-hero', async (page) => {
    const response = await page.goto(fireOrigin.href, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    assert.equal(response?.status(), 200, 'Public Fire Hose Hero must return 200.');

    const stage = page.locator('.stage');
    await page.getByRole('button', {name: 'Start pointer training'}).click();
    await page.waitForFunction(() => {
      const raw = document.querySelector('.stage')?.getAttribute('data-manse-targets') ?? '[]';
      return JSON.parse(raw).length > 0;
    });
    await stage.scrollIntoViewIfNeeded();
    await page.waitForTimeout(3_350);

    const deadline = Date.now() + 35_000;
    while (Date.now() < deadline) {
      if (await page.getByText('Complete', {exact: true}).isVisible().catch(() => false)) break;
      const targets = JSON.parse((await stage.getAttribute('data-manse-targets')) ?? '[]');
      const target = targets.find((candidate) => !candidate.hit);
      if (target === undefined) {
        await page.waitForTimeout(120);
        continue;
      }
      const bounds = await stage.boundingBox();
      assert(bounds !== null, 'Fire Hose Hero stage has no visible bounds.');
      await page.mouse.move(
        bounds.x + target.x * bounds.width,
        bounds.y + target.y * bounds.height,
        {steps: 18},
      );
      await page.waitForTimeout(1_180);
    }
    await page.getByText('Complete', {exact: true}).waitFor({state: 'visible', timeout: 5_000});
    assert.equal(
      (await page.locator('.player-footer strong').textContent())?.trim(),
      '12 / 12',
      'The captured flagship run must reach 12 / 12.',
    );
    await page.waitForTimeout(2_000);
  });

  await capture('playground', async (page) => {
    const response = await page.goto(
      new URL('/playground?provider=simulated', origin).href,
      {waitUntil: 'domcontentloaded', timeout: 30_000},
    );
    assert.equal(response?.status(), 200, 'The public Playground must return 200.');

    const stage = page.locator('.playground-stage');
    await page.getByText('0 / 3', {exact: true}).waitFor({
      state: 'visible',
      timeout: 20_000,
    });
    await stage.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1_200);

    const bounds = await stage.boundingBox();
    assert(bounds !== null, 'The public Playground stage has no visible bounds.');
    const targetCenters = [
      [0.3768, 0.3918],
      [0.6232, 0.3918],
      [0.3768, 0.6682],
    ];

    for (const [index, [x, y]] of targetCenters.entries()) {
      await page.mouse.move(
        bounds.x + bounds.width * x,
        bounds.y + bounds.height * y,
        {steps: 24},
      );
      await page.getByText(`${index + 1} / 3`, {exact: true}).waitFor({
        state: 'visible',
        timeout: 3_000,
      });
      await page.waitForTimeout(700);
    }

    await page.getByText('Runtime check complete.', {exact: true}).waitFor({
      state: 'visible',
      timeout: 3_000,
    });
    await page.waitForTimeout(1_500);
  });

  await capture('showcase', async (page) => {
    const response = await page.goto(origin.href, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    assert.equal(response?.status(), 200, 'The public Showcase must return 200.');
    await page.locator('h1').waitFor({state: 'visible', timeout: 15_000});
    await page.waitForTimeout(800);

    const gamesHeading = page.getByRole('heading', {
      name: 'Play something that moves you.',
    });
    await gamesHeading.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(1_200);

    const movement = page.getByRole('combobox', {
      name: 'Movement',
      exact: true,
    });
    await movement.selectOption({label: 'Jump'});
    await page.getByText('1 game', {exact: true}).waitFor({
      state: 'visible',
      timeout: 3_000,
    });
    await page.waitForTimeout(1_200);
    await movement.selectOption({label: 'All movement'});
    await page.getByText('6 games', {exact: true}).waitFor({
      state: 'visible',
      timeout: 3_000,
    });
    await page.waitForTimeout(1_200);
  });
} finally {
  await browser.close();
  await rm(temporaryDir, {recursive: true, force: true});
}

console.log(`Captured signed-out public clips in ${outputDir}`);
