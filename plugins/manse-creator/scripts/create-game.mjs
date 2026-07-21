#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { deflateSync } from "node:zlib";

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const starterRoot = resolve(pluginRoot, "assets/game-starter");
const templateRoot = resolve(starterRoot, "template");
const vendorRoot = resolve(starterRoot, "vendor");
const supportedLocales = new Set(["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]);
const mediaPipeWasmAssets = [
  ["vision_wasm_internal.js", "e7fd9858e8e8f221d9b96eddc11f8e077f263e0b7bbd79d3cbe882b134274f8c"],
  ["vision_wasm_internal.wasm", "6a5c64584c2ab61c763b6e204afbdbc7ce1caf7f5216187322bca8df94f646bc"],
  ["vision_wasm_nosimd_internal.js", "438d1fe8ff7f4d946025bc211c291543c037d8a3785ed4eee60f1f521b236296"],
  ["vision_wasm_nosimd_internal.wasm", "8a3092d34c79d3f57e6ba8592105e8a90f6b07c27891ffecd14cca428bfd3e31"],
];

const { values } = parseArgs({
  options: {
    output: { type: "string" },
    slug: { type: "string" },
    title: { type: "string" },
    summary: { type: "string" },
    theme: { type: "string" },
    locale: { type: "string", default: "en" },
    creator: { type: "string", default: "Game creator" },
    energy: { type: "string", default: "moderate" },
    "source-url": { type: "string" },
    "age-min": { type: "string", default: "6" },
    "age-max": { type: "string", default: "12" },
    minutes: { type: "string", default: "3" },
    "target-count": { type: "string", default: "3" },
    intro: { type: "string" },
    instruction: { type: "string" },
    celebration: { type: "string" },
    help: { type: "boolean", short: "h" },
  },
  strict: true,
});

if (values.help === true) {
  console.log(`Create a standalone Manse game Site

Required:
  --output <new-directory> --slug <kebab-case> --title <title>
  --summary <summary> --theme <theme>

Optional:
  --locale en --creator <name> --source-url <https-url>
  --energy gentle|moderate|active
  --age-min 6 --age-max 12 --minutes 3 --target-count 3
  --intro <caption> --instruction <caption> --celebration <caption>`);
  process.exit(0);
}

const output = required(values.output, "--output");
const slug = required(values.slug, "--slug");
const title = required(values.title, "--title");
const summary = required(values.summary, "--summary");
const theme = required(values.theme, "--theme");
const locale = values.locale ?? "en";
const creator = values.creator ?? "Game creator";
const energy = values.energy ?? "moderate";
const ageMin = integer(values["age-min"], "--age-min", 2, 120);
const ageMax = integer(values["age-max"], "--age-max", ageMin, 120);
const minutes = integer(values.minutes, "--minutes", 1, 60);
const targetCount = integer(values["target-count"], "--target-count", 1, 12);
const intro = values.intro ?? `Welcome to ${title}. Make room around you, then choose simulator or camera.`;
const instruction = values.instruction ?? `Touch all ${targetCount} targets. Move at a pace that feels comfortable.`;
const celebration = values.celebration ?? "You completed the round.";

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug) || slug.length > 80) {
  throw new Error("--slug must be lowercase kebab-case and at most 80 characters.");
}
if (!supportedLocales.has(locale)) throw new Error(`Unsupported locale '${locale}'.`);
if (!new Set(["gentle", "moderate", "active"]).has(energy)) {
  throw new Error("--energy must be gentle, moderate, or active.");
}
for (const [label, value, maximum] of [
  ["--title", title, 200],
  ["--summary", summary, 5_000],
  ["--theme", theme, 500],
  ["--creator", creator, 200],
  ["--intro", intro, 5_000],
  ["--instruction", instruction, 5_000],
  ["--celebration", celebration, 5_000],
]) {
  if (value.trim().length === 0 || value.length > maximum) throw new Error(`${label} has an invalid length.`);
}

const outputRoot = resolve(output);
if (existsSync(outputRoot)) throw new Error(`Refusing to overwrite existing path: ${outputRoot}`);
if (!existsSync(templateRoot) || !existsSync(vendorRoot)) {
  throw new Error("The Manse Creator starter bundle is incomplete. Reinstall the plugin.");
}

const draftOrigin = `https://${slug}.example.invalid`;
const sourceUrl = values["source-url"] ?? `https://github.com/replace-me/${slug}`;
assertHttpsUrl(sourceUrl, "--source-url");
const gameId = `manse.${slug}`;
const createdAt = new Date().toISOString();
const license = {
  spdxId: "MIT",
  name: "MIT License",
  url: "https://spdx.org/licenses/MIT.html",
  attribution: `${creator} — ${title}`,
};
const originalProvenance = { kind: "original", creator, createdAt };

await cp(templateRoot, outputRoot, { recursive: true, errorOnExist: true });
await replaceTemplateTokens(outputRoot, {
  "__GAME_SLUG__": slug,
  "__GAME_CONFIG_JSON__": JSON.stringify({ slug, title, summary, creator, sourceUrl, locale }),
});
await assertNoTemplateTokens(outputRoot);
await cp(vendorRoot, join(outputRoot, "vendor"), { recursive: true });

const packRoot = join(outputRoot, "public", "packs", slug);
const audioRoot = join(packRoot, "assets", "audio");
await mkdir(join(outputRoot, "public", ".well-known"), { recursive: true });
await mkdir(audioRoot, { recursive: true });
await mkdir(join(outputRoot, ".manse"), { recursive: true });

const pack = {
  schemaVersion: 1,
  meta: {
    id: gameId,
    title: [{ locale, text: title }],
    summary: [{ locale, text: summary }],
    theme,
    locales: [locale],
    ageBands: ageBands(ageMin, ageMax),
    estMinutes: minutes,
    engine: { minimumVersion: "0.1.0", maximumVersion: "0.1.0" },
    compiler: {
      model: "GPT-5.6 via Codex",
      reasoningEffort: "creator-session",
      generatedAt: createdAt,
    },
  },
  permissions: { camera: true, deviceLocalStorage: true },
  cast: [{
    id: "guide",
    name: [{ locale, text: "Guide" }],
    artAssetId: null,
    description: "A neutral runtime guide rendered without a character asset.",
  }],
  entrySceneId: "welcome",
  scenes: [
    {
      id: "welcome",
      kind: "story",
      narration: { items: [{ locale, text: intro, audioAssetId: null }], captionDefaultOn: true },
      demo: null,
      challenge: null,
      learning: null,
      artAssetId: null,
      energy: "calm",
      terminal: false,
      transitions: [{ on: "always", to: "touch-round", adapt: null }],
    },
    {
      id: "touch-round",
      kind: "challenge",
      narration: { items: [{ locale, text: instruction, audioAssetId: null }], captionDefaultOn: true },
      demo: null,
      challenge: {
        type: "touch_targets",
        count: targetCount,
        zone: "reachable",
        targetScale: 1.2,
        dwellMs: 140,
        limb: "hands",
        timeBudgetMs: Math.min(300_000, Math.max(20_000, minutes * 60_000 - 8_000)),
        successAudioId: "success-tone",
        encourageAudioId: "encourage-tone",
      },
      learning: { kind: "none", payload: [] },
      artAssetId: null,
      energy: "medium",
      terminal: false,
      transitions: [
        { on: "success", to: "complete", adapt: null },
        {
          on: "struggle",
          to: "easier-round",
          adapt: { targetScaleMul: 1.2, dwellMsMul: 0.8, countDelta: -1, timeBudgetMul: 1.2 },
        },
      ],
    },
    {
      id: "easier-round",
      kind: "challenge",
      narration: { items: [{ locale, text: instruction, audioAssetId: null }], captionDefaultOn: true },
      demo: null,
      challenge: {
        type: "touch_targets",
        count: targetCount,
        zone: "reachable",
        targetScale: 1.2,
        dwellMs: 140,
        limb: "hands",
        timeBudgetMs: Math.min(300_000, Math.max(20_000, minutes * 60_000 - 8_000)),
        successAudioId: "success-tone",
        encourageAudioId: "encourage-tone",
      },
      learning: { kind: "none", payload: [] },
      artAssetId: null,
      energy: "medium",
      terminal: false,
      transitions: [
        { on: "success", to: "complete", adapt: null },
        { on: "struggle", to: "complete", adapt: null },
      ],
    },
    {
      id: "complete",
      kind: "celebration",
      narration: { items: [{ locale, text: celebration, audioAssetId: null }], captionDefaultOn: true },
      demo: null,
      challenge: null,
      learning: null,
      artAssetId: null,
      energy: "calm",
      terminal: true,
      transitions: [],
    },
  ],
  adaptPolicy: { targetSuccessBand: [0.65, 0.85], maxStruggleStreak: 2, maxHighEnergyMs: 60_000 },
  assets: {
    images: [],
    audio: [
      {
        id: "success-tone",
        path: "assets/audio/success.wav",
        mediaType: "audio/wav",
        locale: null,
        transcript: "",
        license,
        provenance: originalProvenance,
      },
      {
        id: "encourage-tone",
        path: "assets/audio/encourage.wav",
        mediaType: "audio/wav",
        locale: null,
        transcript: "",
        license,
        provenance: originalProvenance,
      },
    ],
    music: [],
  },
};

const provenance = {
  schemaVersion: 1,
  assets: pack.assets.audio.map((asset) => ({
    assetId: asset.id,
    path: asset.path,
    license: asset.license,
    provenance: asset.provenance,
  })),
};

const manifest = {
  schemaVersion: 1,
  id: gameId,
  slug,
  title: [{ locale, text: title }],
  summary: [{ locale, text: summary }],
  creator,
  energy,
  gameUrl: `${draftOrigin}/`,
  sourceUrl,
  engineVersion: "0.1.0",
  locales: [locale],
  ageRange: { min: ageMin, max: ageMax },
  movementTags: ["touch"],
  accessibility: {
    captions: true,
    seatedMode: true,
    highContrast: true,
    reducedStimulation: true,
    audioCues: true,
  },
  thumbnail: {
    url: `${draftOrigin}/thumbnail.png`,
    mediaType: "image/png",
    alt: [{ locale, text: `Abstract motion-game artwork for ${title}` }],
  },
  license,
  contentProvenance: {
    hasGeneratedAssets: false,
    hasThirdPartyAssets: true,
    provenanceUrl: `${draftOrigin}/asset-provenance.json`,
  },
  permissions: pack.permissions,
};

await writeJson(join(packRoot, "manse.pack.json"), pack);
await writeJson(join(packRoot, "provenance.json"), provenance);
await writeJson(join(outputRoot, "public", ".well-known", "manse-game.json"), manifest);
await writeJson(join(outputRoot, ".manse", "project.json"), {
  schemaVersion: 1,
  state: "draft",
  createdBy: "Manse Creator 0.1.0",
  createdAt,
  placeholders: ["gameUrl", "thumbnail.url", "contentProvenance.provenanceUrl", ...(sourceUrl.includes("replace-me") ? ["sourceUrl"] : [])],
});
await writeFile(join(audioRoot, "success.wav"), createToneWav(660, 180));
await writeFile(join(audioRoot, "encourage.wav"), createToneWav(440, 160));
await writeFile(join(outputRoot, "public", "thumbnail.png"), createThumbnailPng());
await writeFile(join(outputRoot, "LICENSE"), mitLicense(creator, new Date().getUTCFullYear()), "utf8");

const runtimeProvenance = JSON.parse(
  await readFile(join(vendorRoot, "manse-runtime-web", "assets", "asset-provenance.json"), "utf8"),
);
await writeJson(join(outputRoot, "public", "asset-provenance.json"), {
  schemaVersion: 1,
  assets: [
    {
      path: "/thumbnail.png",
      origin: "original-procedural",
      creator,
      createdAt,
      license: "MIT",
      sha256: sha256(createThumbnailPng()),
    },
    {
      path: `/packs/${slug}/assets/audio/success.wav`,
      origin: "original-procedural",
      creator,
      createdAt,
      license: "MIT",
      sha256: sha256(createToneWav(660, 180)),
    },
    {
      path: `/packs/${slug}/assets/audio/encourage.wav`,
      origin: "original-procedural",
      creator,
      createdAt,
      license: "MIT",
      sha256: sha256(createToneWav(440, 160)),
    },
    ...runtimeProvenance.assets.map((asset) => ({
      path: `/${asset.path}`,
      origin: "third-party",
      source: asset.sourceUrl,
      creator: asset.creator,
      license: asset.license,
      sha256: asset.sha256,
    })),
    ...mediaPipeWasmAssets.map(([filename, digest]) => ({
      path: `/vendor/mediapipe/wasm/${filename}`,
      origin: "third-party-package",
      source: "@mediapipe/tasks-vision@0.10.35",
      creator: "Google MediaPipe Authors",
      license: "Apache-2.0",
      sha256: digest,
    })),
  ],
});

console.log(JSON.stringify({
  created: outputRoot,
  pack: join(packRoot, "manse.pack.json"),
  manifest: join(outputRoot, "public", ".well-known", "manse-game.json"),
  next: ["npm install", "npm run validate", "npm run dev"],
}, null, 2));

function required(value, option) {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${option} is required.`);
  return value.trim();
}

function integer(value, option, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${option} must be an integer from ${minimum} to ${maximum}.`);
  }
  return parsed;
}

function assertHttpsUrl(value, option) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username !== "" || url.password !== "") {
    throw new Error(`${option} must be an absolute HTTPS URL without credentials.`);
  }
}

function ageBands(minimum, maximum) {
  const bands = [];
  if (minimum <= 3 && maximum >= 2) bands.push("2-3");
  if (minimum <= 5 && maximum >= 4) bands.push("4-5");
  if (minimum <= 7 && maximum >= 6) bands.push("6-7");
  if (maximum >= 8) bands.push("8+");
  return bands;
}

async function replaceTemplateTokens(root, replacements) {
  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) {
        let text = await readFile(path, "utf8");
        for (const [token, value] of Object.entries(replacements)) text = text.replaceAll(token, value);
        await writeFile(path, text, "utf8");
      }
    }
  }
  await visit(root);
}

async function assertNoTemplateTokens(root) {
  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) {
        const text = await readFile(path, "utf8");
        const token = text.match(/__[A-Z][A-Z0-9_]*__/u)?.[0];
        if (token !== undefined) throw new Error(`Unresolved starter token ${token} in ${path}.`);
      }
    }
  }
  await visit(root);
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function createToneWav(frequency, durationMs) {
  const sampleRate = 22_050;
  const sampleCount = Math.round(sampleRate * durationMs / 1_000);
  const buffer = Buffer.alloc(44 + sampleCount * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + sampleCount * 2, 4);
  buffer.write("WAVEfmt ", 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(sampleCount * 2, 40);
  for (let index = 0; index < sampleCount; index += 1) {
    const envelope = Math.sin(Math.PI * index / Math.max(1, sampleCount - 1)) ** 2;
    const sample = Math.sin(2 * Math.PI * frequency * index / sampleRate) * envelope * 0.2;
    buffer.writeInt16LE(Math.round(sample * 32_767), 44 + index * 2);
  }
  return buffer;
}

function createThumbnailPng() {
  const width = 1200;
  const height = 630;
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * stride] = 0;
    for (let x = 0; x < width; x += 1) {
      const index = y * stride + 1 + x * 4;
      const left = (x - 340) ** 2 + (y - 315) ** 2 < 150 ** 2;
      const right = (x - 860) ** 2 + (y - 315) ** 2 < 150 ** 2;
      const ribbon = Math.abs(y - (315 + Math.sin(x / 105) * 100)) < 24;
      const [red, green, blue] = left
        ? [255, 100, 72]
        : right
          ? [201, 244, 93]
          : ribbon
            ? [39, 116, 255]
            : [247 - Math.round(y / 90), 243 - Math.round(y / 120), 234 - Math.round(y / 150)];
      raw[index] = red;
      raw[index + 1] = green;
      raw[index + 2] = blue;
      raw[index + 3] = 255;
    }
  }
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([signature, pngChunk("IHDR", ihdr), pngChunk("IDAT", deflateSync(raw)), pngChunk("IEND", Buffer.alloc(0))]);
}

function pngChunk(type, data) {
  const name = Buffer.from(type, "ascii");
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  name.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([name, data])), 8 + data.length);
  return chunk;
}

function crc32(data) {
  let crc = 0xffff_ffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb8_8320 : 0);
  }
  return (crc ^ 0xffff_ffff) >>> 0;
}

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

function mitLicense(name, year) {
  return `MIT License

Copyright (c) ${year} ${name}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}
