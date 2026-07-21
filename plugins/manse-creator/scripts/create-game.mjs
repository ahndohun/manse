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
    fantasy: { type: "string" },
    "player-verb": { type: "string" },
    "target-metaphor": { type: "string" },
    locale: { type: "string", default: "en" },
    creator: { type: "string", default: "Game creator" },
    energy: { type: "string", default: "moderate" },
    mechanic: { type: "string", default: "touch_targets" },
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
  --fantasy <role-and-stakes> --player-verb <continuous physical verb>
  --target-metaphor <themed object the player affects>

Optional:
  --locale en --creator <name> --source-url <https-url>
  --energy gentle|moderate|active
  --mechanic touch_targets|freeze|body_zone|squat|pose_match|jump|velocity_hit|step|sequence
  --age-min 6 --age-max 12 --minutes 3 --target-count 3
  --intro <caption> --instruction <caption> --celebration <caption>

--target-count sets touch/strike targets, or rounds/repetitions/steps for
motion mechanics. touch_targets emits a schemaVersion 1 pack runnable by every
engine; other mechanics emit schemaVersion 2 packs requiring engine 0.2.`);
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
const mechanic = values.mechanic ?? "touch_targets";
const fantasy = required(values.fantasy, "--fantasy");
const playerVerb = required(values["player-verb"], "--player-verb");
const targetMetaphor = required(values["target-metaphor"], "--target-metaphor");

/**
 * Every mechanic ships with conservative, child-safe tunables. Creators adjust
 * them later in pack data; the generator never emits an unsafe starting point.
 */
const MECHANICS = {
  touch_targets: {
    movementTag: "touch",
    instruction: (count) => `Touch all ${count} targets. Move at a pace that feels comfortable.`,
    challenge: (count, timeBudgetMs, audio) => ({
      type: "touch_targets",
      count,
      zone: "reachable",
      targetScale: 1.2,
      dwellMs: 140,
      limb: "hands",
      timeBudgetMs,
      ...audio,
    }),
    adapt: { targetScaleMul: 1.2, dwellMsMul: 0.8, countDelta: -1, timeBudgetMul: 1.2 },
  },
  freeze: {
    movementTag: "freeze",
    instruction: (count) => `Freeze like a statue ${count} ${count === 1 ? "time" : "times"}!`,
    challenge: (count, timeBudgetMs, audio) => ({
      type: "freeze",
      holdMs: 2_500,
      motionThreshold: 0.04,
      graceMs: 400,
      rounds: Math.min(10, count),
      minVisibleJoints: 8,
      timeBudgetMs,
      ...audio,
    }),
    adapt: { targetScaleMul: 1, dwellMsMul: 1, countDelta: 0, timeBudgetMul: 1.2, holdMsMul: 0.8, motionThresholdMul: 1.3 },
  },
  body_zone: {
    movementTag: "dodge",
    instruction: () => "Move your hands into each glowing bubble.",
    challenge: (_count, timeBudgetMs, audio) => ({
      type: "body_zone",
      part: "hands",
      mode: "enter",
      zones: [
        { id: "left-bubble", box: { x0: 0.06, y0: 0.15, x1: 0.38, y1: 0.6 } },
        { id: "top-bubble", box: { x0: 0.32, y0: 0.05, x1: 0.68, y1: 0.35 } },
        { id: "right-bubble", box: { x0: 0.62, y0: 0.15, x1: 0.94, y1: 0.6 } },
      ],
      holdMs: 500,
      timeBudgetMs,
      ...audio,
    }),
    adapt: { targetScaleMul: 1, dwellMsMul: 1, countDelta: 0, timeBudgetMul: 1.2, holdMsMul: 0.8 },
  },
  squat: {
    movementTag: "squat",
    instruction: (count) => `Do ${count} gentle ${count === 1 ? "squat" : "squats"} at your own pace.`,
    challenge: (count, timeBudgetMs, audio) => ({
      type: "squat",
      repetitions: Math.min(10, count),
      depthRatio: 0.2,
      kneeAngleMaxDeg: 140,
      holdMs: 0,
      cooldownMs: 700,
      timeBudgetMs,
      ...audio,
    }),
    adapt: { targetScaleMul: 1, dwellMsMul: 1, countDelta: 0, timeBudgetMul: 1.2, repetitionsDelta: -1, toleranceMul: 1.2 },
  },
  pose_match: {
    movementTag: "pose",
    instruction: () => "Copy the glowing pose and hold it steady.",
    challenge: (count, timeBudgetMs, audio) => ({
      type: "pose_match",
      poses: [
        {
          id: "star-arms",
          joints: [
            { joint: "left_elbow", angleDeg: 170, toleranceDeg: 30 },
            { joint: "right_elbow", angleDeg: 170, toleranceDeg: 30 },
            { joint: "left_shoulder", angleDeg: 150, toleranceDeg: 35 },
            { joint: "right_shoulder", angleDeg: 150, toleranceDeg: 35 },
          ],
          holdMs: 1_500,
        },
        {
          id: "goal-arms",
          joints: [
            { joint: "left_elbow", angleDeg: 90, toleranceDeg: 30 },
            { joint: "right_elbow", angleDeg: 90, toleranceDeg: 30 },
          ],
          holdMs: 1_500,
        },
        {
          id: "one-wing",
          joints: [
            { joint: "left_shoulder", angleDeg: 160, toleranceDeg: 30 },
            { joint: "left_elbow", angleDeg: 170, toleranceDeg: 30 },
          ],
          holdMs: 1_200,
        },
      ].slice(0, Math.max(1, Math.min(3, count))),
      matchRatio: 0.7,
      mirrorPolicy: "either",
      timeBudgetMs,
      ...audio,
    }),
    adapt: { targetScaleMul: 1, dwellMsMul: 1, countDelta: 0, timeBudgetMul: 1.2, toleranceMul: 1.25, holdMsMul: 0.8 },
  },
  jump: {
    movementTag: "jump",
    instruction: (count) => `Jump ${count} ${count === 1 ? "time" : "times"} and land softly.`,
    challenge: (count, timeBudgetMs, audio) => ({
      type: "jump",
      repetitions: Math.min(10, count),
      minRiseRatio: 0.12,
      landingStableMs: 300,
      cooldownMs: 800,
      timeBudgetMs,
      ...audio,
    }),
    adapt: { targetScaleMul: 1, dwellMsMul: 1, countDelta: 0, timeBudgetMul: 1.2, repetitionsDelta: -1, toleranceMul: 1.2 },
  },
  velocity_hit: {
    movementTag: "strike",
    instruction: (count) => `Tap the drums with a quick hand — ${count} to go!`,
    challenge: (count, timeBudgetMs, audio) => ({
      type: "velocity_hit",
      count,
      zone: "reachable",
      targetScale: 1.3,
      limb: "hands",
      minSpeed: 0.7,
      direction: "any",
      timeBudgetMs,
      ...audio,
    }),
    adapt: { targetScaleMul: 1.2, dwellMsMul: 1, countDelta: -1, timeBudgetMul: 1.2, speedMul: 0.8 },
  },
  step: {
    movementTag: "step",
    instruction: () => "Step side to side, following the arrows.",
    challenge: (count, timeBudgetMs, audio) => ({
      type: "step",
      pattern: Array.from({ length: Math.max(2, Math.min(8, count)) }, (_, i) => (i % 2 === 0 ? "left" : "right")),
      stepRatio: 0.25,
      holdMs: 200,
      timeBudgetMs,
      ...audio,
    }),
    adapt: { targetScaleMul: 1, dwellMsMul: 1, countDelta: 0, timeBudgetMul: 1.2, toleranceMul: 1.25 },
  },
  sequence: {
    movementTag: "combo",
    instruction: () => "Squat, jump, then freeze like a statue!",
    challenge: (_count, timeBudgetMs, audio) => ({
      type: "sequence",
      steps: [
        { type: "squat", repetitions: 1, depthRatio: 0.2, kneeAngleMaxDeg: 140, holdMs: 0, cooldownMs: 700 },
        { type: "jump", repetitions: 1, minRiseRatio: 0.12, landingStableMs: 300, cooldownMs: 800 },
        { type: "freeze", holdMs: 1_500, motionThreshold: 0.04, graceMs: 400, rounds: 1, minVisibleJoints: 8 },
      ],
      interStepGraceMs: 2_000,
      timeBudgetMs,
      ...audio,
    }),
    adapt: { targetScaleMul: 1, dwellMsMul: 1, countDelta: 0, timeBudgetMul: 1.2, toleranceMul: 1.2, holdMsMul: 0.85 },
  },
};

if (!(mechanic in MECHANICS)) {
  throw new Error(`--mechanic must be one of: ${Object.keys(MECHANICS).join(", ")}.`);
}
const mechanicPreset = MECHANICS[mechanic];
const intro = values.intro ?? `Welcome to ${title}. Make room around you, then choose simulator or camera.`;
const instruction = values.instruction ?? mechanicPreset.instruction(targetCount);
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
  ["--fantasy", fantasy, 500],
  ["--player-verb", playerVerb, 120],
  ["--target-metaphor", targetMetaphor, 120],
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
const palette = createThemePalette(`${title}\n${theme}`);
const thumbnailPng = createThumbnailPng(palette);

await cp(templateRoot, outputRoot, { recursive: true, errorOnExist: true });
await replaceTemplateTokens(outputRoot, {
  "__GAME_SLUG__": slug,
  "__GAME_CONFIG_JSON__": JSON.stringify({
    slug,
    title: { en: title, ko: title },
    summary: { en: summary, ko: summary },
    creator,
    sourceUrl,
    locale,
    hero: {
      imageUrl: "/thumbnail.png",
      alt: {
        en: `Illustrated ${theme} play scene for ${title}`,
        ko: `${title}의 ${theme} 플레이 장면 일러스트`,
      },
    },
    theme: palette,
  }),
});
await assertNoTemplateTokens(outputRoot);
await cp(vendorRoot, join(outputRoot, "vendor"), { recursive: true });

const packRoot = join(outputRoot, "public", "packs", slug);
const audioRoot = join(packRoot, "assets", "audio");
await mkdir(join(outputRoot, "public", ".well-known"), { recursive: true });
await mkdir(audioRoot, { recursive: true });
await mkdir(join(outputRoot, ".manse"), { recursive: true });

const challengeAudio = { successAudioId: "success-tone", encourageAudioId: "encourage-tone" };
const missionBudgetMs = Math.min(300_000, Math.max(60_000, minutes * 60_000 - 8_000));
const waveBudgets = splitMissionBudget(missionBudgetMs);
const waveCounts = [Math.max(1, targetCount - 1), targetCount, Math.min(12, targetCount + 1)];
const waveChallenges = waveCounts.map((count, index) =>
  challengeForBeat(mechanic, mechanicPreset, count, waveBudgets[index], challengeAudio, index),
);

const pack = {
  // touch_targets stays a v1 pack every released engine executes; motion
  // mechanics require the 0.2 contract and say so explicitly.
  schemaVersion: mechanic === "touch_targets" ? 1 : 2,
  meta: {
    id: gameId,
    title: [{ locale, text: title }],
    summary: [{ locale, text: summary }],
    theme,
    locales: [locale],
    ageBands: ageBands(ageMin, ageMax),
    estMinutes: minutes,
    engine: mechanic === "touch_targets"
      ? { minimumVersion: "0.1.0", maximumVersion: "0.2.0" }
      : { minimumVersion: "0.2.0", maximumVersion: "0.2.0" },
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
      transitions: [{ on: "always", to: "learn-the-verb", adapt: null }],
    },
    {
      id: "learn-the-verb",
      kind: "challenge",
      narration: {
        items: [{ locale, text: `First beat — ${instruction}`, audioAssetId: null }],
        captionDefaultOn: true,
      },
      demo: null,
      challenge: waveChallenges[0],
      learning: { kind: "none", payload: [] },
      artAssetId: null,
      energy: "medium",
      terminal: false,
      transitions: [
        { on: "success", to: "raise-the-stakes", adapt: null },
        { on: "struggle", to: "raise-the-stakes", adapt: mechanicPreset.adapt },
      ],
    },
    {
      id: "raise-the-stakes",
      kind: "challenge",
      narration: {
        items: [{ locale, text: `Second beat — the mission changes. ${instruction}`, audioAssetId: null }],
        captionDefaultOn: true,
      },
      demo: null,
      challenge: waveChallenges[1],
      learning: { kind: "none", payload: [] },
      artAssetId: null,
      energy: "medium",
      terminal: false,
      transitions: [
        { on: "success", to: "finale", adapt: null },
        { on: "struggle", to: "finale", adapt: mechanicPreset.adapt },
      ],
    },
    {
      id: "finale",
      kind: "challenge",
      narration: {
        items: [{ locale, text: `Final beat — use everything you learned. ${instruction}`, audioAssetId: null }],
        captionDefaultOn: true,
      },
      demo: null,
      challenge: waveChallenges[2],
      learning: { kind: "none", payload: [] },
      artAssetId: null,
      energy: energy === "gentle" ? "medium" : "high",
      terminal: false,
      transitions: [
        { on: "success", to: "complete", adapt: null },
        { on: "struggle", to: "recovery", adapt: mechanicPreset.adapt },
      ],
    },
    {
      id: "recovery",
      kind: "story",
      narration: {
        items: [{ locale, text: "Take a breath. The mission still counts, and you can try the finale again when you are ready.", audioAssetId: "encourage-tone" }],
        captionDefaultOn: true,
      },
      demo: null,
      challenge: null,
      learning: null,
      artAssetId: null,
      energy: "calm",
      terminal: false,
      transitions: [
        { on: "always", to: "complete", adapt: null },
      ],
    },
    {
      id: "complete",
      kind: "celebration",
      narration: { items: [{ locale, text: celebration, audioAssetId: "finale-tone" }], captionDefaultOn: true },
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
        locale,
        transcript: "",
        license,
        provenance: originalProvenance,
      },
      {
        id: "encourage-tone",
        path: "assets/audio/encourage.wav",
        mediaType: "audio/wav",
        locale,
        transcript: "",
        license,
        provenance: originalProvenance,
      },
      {
        id: "finale-tone",
        path: "assets/audio/finale.wav",
        mediaType: "audio/wav",
        locale,
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
  engineVersion: "0.2.0",
  locales: [locale],
  ageRange: { min: ageMin, max: ageMax },
  movementTags: [mechanicPreset.movementTag],
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
    alt: [{ locale, text: `Illustrated ${theme} play scene for ${title}` }],
  },
  license,
  contentProvenance: {
    hasGeneratedAssets: true,
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
  createdBy: "Manse Creator 0.2.0",
  createdAt,
  placeholders: ["gameUrl", "thumbnail.url", "contentProvenance.provenanceUrl", ...(sourceUrl.includes("replace-me") ? ["sourceUrl"] : [])],
});
await writeJson(join(outputRoot, ".manse", "experience.json"), {
  schemaVersion: 1,
  status: "design-required",
  identity: {
    fantasy,
    playerVerb,
    targetMetaphor,
    oneSentencePromise: `${title}: ${summary}`,
  },
  beats: [
    { id: "learn-the-verb", purpose: "Teach one readable physical action with immediate themed feedback.", intensity: 1 },
    { id: "raise-the-stakes", purpose: "Change the spatial or timing demand without changing the core verb.", intensity: 2 },
    { id: "finale", purpose: "Deliver the largest visual payoff and a clear resolution.", intensity: 3 },
  ],
  presenter: {
    source: null,
    themedEntities: [],
    reactiveStates: [],
    continuousFeedback: null,
    scoreAndResolution: null,
  },
  qualityGates: {
    themedEntitiesInPlay: false,
    threeReactiveStates: false,
    continuousInputFeedback: false,
    authoredEscalation: true,
    scoreAndResolution: false,
    threeGameplaySounds: true,
    noDebugChrome: false,
    cameraSimulatorParity: false,
    reducedMotionVerified: false,
  },
  evidence: {
    gameplayScreenshot: null,
    completionScreenshot: null,
    playtestNotes: null,
  },
  releaseRule: "Do not mark approved or publish until every quality gate is true and every evidence path exists.",
});
await writeFile(join(audioRoot, "success.wav"), createToneWav(660, 180));
await writeFile(join(audioRoot, "encourage.wav"), createToneWav(440, 160));
await writeFile(join(audioRoot, "finale.wav"), createToneWav(784, 360));
await writeFile(join(outputRoot, "public", "thumbnail.png"), thumbnailPng);
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
      sha256: sha256(thumbnailPng),
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
    {
      path: `/packs/${slug}/assets/audio/finale.wav`,
      origin: "original-procedural",
      creator,
      createdAt,
      license: "MIT",
      sha256: sha256(createToneWav(784, 360)),
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

function defaultPlayerVerb(mechanic) {
  return {
    touch_targets: "reach and hold",
    freeze: "freeze and release",
    body_zone: "move into position",
    squat: "squat and rise",
    pose_match: "shape and hold a pose",
    jump: "jump and land softly",
    velocity_hit: "strike with controlled speed",
    step: "step to the cue",
    sequence: "chain the movements",
  }[mechanic] ?? "move with purpose";
}

function defaultTargetMetaphor(mechanic, theme) {
  const object = {
    touch_targets: "large responsive mission objects",
    freeze: "a living scene that reacts to stillness",
    body_zone: "themed safe zones",
    squat: "world elements powered by rising",
    pose_match: "character silhouettes",
    jump: "launch pads and airborne rewards",
    velocity_hit: "impact objects with readable recoil",
    step: "floor cues with rhythmic trails",
    sequence: "a transforming finale object",
  }[mechanic] ?? "responsive mission objects";
  return `${theme}: ${object}`;
}

function splitMissionBudget(totalMs) {
  const first = Math.max(20_000, Math.round(totalMs * 0.28));
  const second = Math.max(20_000, Math.round(totalMs * 0.32));
  const third = Math.max(20_000, totalMs - first - second);
  return [first, second, Math.min(300_000, third)];
}

function challengeForBeat(mechanic, preset, count, budget, audio, beat) {
  const challenge = preset.challenge(count, budget, audio);
  if (mechanic === "touch_targets") {
    challenge.zone = ["reachable", "upper", "full"][beat];
    challenge.targetScale = [1.45, 1.3, 1.16][beat];
    challenge.dwellMs = [180, 260, 340][beat];
  } else if (mechanic === "freeze") {
    challenge.holdMs = [1_500, 2_100, 2_700][beat];
    challenge.rounds = [1, Math.max(2, Math.min(6, count)), Math.max(3, Math.min(8, count + 1))][beat];
  } else if (mechanic === "body_zone") {
    challenge.zones = challenge.zones.slice(0, beat + 1);
    challenge.holdMs = [350, 500, 650][beat];
  } else if (mechanic === "squat") {
    challenge.repetitions = [Math.max(1, count - 1), count, Math.min(10, count + 1)][beat];
    challenge.depthRatio = [0.16, 0.19, 0.21][beat];
  } else if (mechanic === "pose_match") {
    challenge.matchRatio = [0.62, 0.68, 0.72][beat];
  } else if (mechanic === "jump") {
    challenge.repetitions = [Math.max(1, count - 1), count, Math.min(10, count + 1)][beat];
    challenge.minRiseRatio = [0.09, 0.11, 0.12][beat];
  } else if (mechanic === "velocity_hit") {
    challenge.targetScale = [1.5, 1.32, 1.18][beat];
    challenge.minSpeed = [0.5, 0.62, 0.72][beat];
  } else if (mechanic === "step") {
    challenge.stepRatio = [0.18, 0.22, 0.25][beat];
    challenge.holdMs = [280, 220, 180][beat];
  } else if (mechanic === "sequence") {
    challenge.steps = challenge.steps.slice(0, beat + 1);
    challenge.interStepGraceMs = [2_600, 2_100, 1_800][beat];
  }
  return challenge;
}

function createThemePalette(seed) {
  const digest = createHash("sha256").update(seed).digest();
  const hue = Math.round((digest[0] / 255) * 360);
  const contrastHue = (hue + 128 + digest[1] % 72) % 360;
  return {
    background: hslToHex(hue, 42, 9),
    surface: hslToHex(hue, 35, 16),
    accent: hslToHex(contrastHue, 82, 62),
    highlight: hslToHex((contrastHue + 54) % 360, 78, 69),
    text: hslToHex(hue, 18, 96),
    muted: hslToHex(hue, 18, 74),
  };
}

function hslToHex(hue, saturation, lightness) {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const section = ((hue % 360) + 360) % 360 / 60;
  const x = chroma * (1 - Math.abs(section % 2 - 1));
  const [r1, g1, b1] = section < 1 ? [chroma, x, 0]
    : section < 2 ? [x, chroma, 0]
      : section < 3 ? [0, chroma, x]
        : section < 4 ? [0, x, chroma]
          : section < 5 ? [x, 0, chroma]
            : [chroma, 0, x];
  const m = l - chroma / 2;
  return `#${[r1, g1, b1].map((value) => Math.round((value + m) * 255).toString(16).padStart(2, "0")).join("")}`;
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

function createThumbnailPng(palette) {
  const width = 1200;
  const height = 630;
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  const colors = Object.fromEntries(Object.entries(palette).map(([name, value]) => [name, hexToRgb(value)]));
  for (let y = 0; y < height; y += 1) {
    raw[y * stride] = 0;
    for (let x = 0; x < width; x += 1) {
      const index = y * stride + 1 + x * 4;
      const left = (x - 340) ** 2 + (y - 315) ** 2 < 150 ** 2;
      const right = (x - 860) ** 2 + (y - 315) ** 2 < 150 ** 2;
      const ribbon = Math.abs(y - (315 + Math.sin(x / 105) * 100)) < 24;
      const [red, green, blue] = left
        ? colors.accent
        : right
          ? colors.highlight
          : ribbon
            ? mixRgb(colors.accent, colors.highlight, x / width)
            : mixRgb(colors.surface, colors.background, y / height);
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

function hexToRgb(value) {
  return [1, 3, 5].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
}

function mixRgb(first, second, amount) {
  return first.map((value, index) => Math.round(value + (second[index] - value) * amount));
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
