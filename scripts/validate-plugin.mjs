import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = join(repositoryRoot, "plugins/manse-creator");
const manifest = await readJson(join(pluginRoot, ".codex-plugin/plugin.json"));
const marketplace = await readJson(join(repositoryRoot, ".agents/plugins/marketplace.json"));
const expectedSkills = [
  "create-game",
  "generate-assets",
  "preview-game",
  "publish-game",
  "remix-game",
  "submit-to-showcase",
  "validate-game",
];

assert(manifest.name === "manse-creator", "Plugin manifest name must be manse-creator.");
assert(
  manifest.version === "0.1.0" || /^0\.1\.0\+codex\.(?:local-[0-9]{8}-[0-9]{6}|[0-9]{14})$/u.test(manifest.version),
  "Plugin manifest must use engine release 0.1.0 with at most one local Codex cachebuster.",
);
assert(manifest.skills === "./skills/", "Plugin skills path must use the archive-relative contract.");
assert(typeof manifest.author?.name === "string" && manifest.author.name.length > 0, "Plugin author is required.");
assert(Array.isArray(manifest.interface?.capabilities) && manifest.interface.capabilities.length > 0, "Plugin capabilities are required.");
assert(
  Array.isArray(manifest.interface?.defaultPrompt)
    && manifest.interface.defaultPrompt.length >= 1
    && manifest.interface.defaultPrompt.length <= 3
    && manifest.interface.defaultPrompt.every((prompt) => typeof prompt === "string" && prompt.length <= 128),
  "Plugin default prompts must contain one to three strings of at most 128 characters.",
);
assert(marketplace.name === "manse", "Repository marketplace must use the stable manse name.");
const marketplaceEntry = marketplace.plugins?.find((entry) => entry.name === manifest.name);
assert(marketplaceEntry?.source?.source === "local", "Marketplace must declare a local plugin source.");
assert(marketplaceEntry?.source?.path === "./plugins/manse-creator", "Marketplace plugin path is invalid.");
assert(marketplaceEntry?.policy?.installation === "AVAILABLE", "Marketplace installation policy must be AVAILABLE.");
assert(marketplaceEntry?.policy?.authentication === "ON_INSTALL", "Marketplace authentication policy must be explicit.");

const actualSkills = (await readdir(join(pluginRoot, "skills"), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
assert(JSON.stringify(actualSkills) === JSON.stringify(expectedSkills), "Plugin must ship exactly the seven documented skills.");
for (const skill of expectedSkills) {
  const markdown = await readFile(join(pluginRoot, "skills", skill, "SKILL.md"), "utf8");
  const agent = await readFile(join(pluginRoot, "skills", skill, "agents/openai.yaml"), "utf8");
  assert(markdown.startsWith(`---\nname: ${skill}\n`), `${skill} has invalid frontmatter.`);
  assert(/^description: .+/mu.test(markdown), `${skill} needs a trigger description.`);
  assert(!/\[TODO:|\bTODO\b/u.test(markdown), `${skill} contains a TODO placeholder.`);
  assert(agent.includes(`$${skill}`), `${skill} default prompt must invoke its own skill.`);
}

await compareTrees(
  join(repositoryRoot, "packages/schema/dist"),
  join(pluginRoot, "assets/game-starter/vendor/manse-schema/lib"),
);
await compareTrees(
  join(repositoryRoot, "packages/cli/dist"),
  join(pluginRoot, "assets/game-starter/vendor/manse-cli/lib"),
);
await compareTrees(
  join(repositoryRoot, "packages/runtime-web/dist"),
  join(pluginRoot, "assets/game-starter/vendor/manse-runtime-web/lib"),
);
await compareTrees(
  join(repositoryRoot, "packages/runtime-web/assets"),
  join(pluginRoot, "assets/game-starter/vendor/manse-runtime-web/assets"),
);

const qaRoot = await mkdtemp(join(tmpdir(), "manse-plugin-contract-"));
const gameRoot = join(qaRoot, "contract-game");
try {
  run(process.execPath, [
    join(pluginRoot, "scripts/create-game.mjs"),
    "--output", gameRoot,
    "--slug", "contract-game",
    "--title", "Contract \"Game\" <QA>",
    "--summary", "Generated safely from the bundled Manse starter.",
    "--theme", "Accessible paper targets",
    "--source-url", "https://github.com/ahndohun/contract-game",
    "--minutes", "60",
    "--target-count", "12",
  ]);
  await mkdir(join(gameRoot, "node_modules/@manse"), { recursive: true });
  await symlink(join(gameRoot, "vendor/manse-schema"), join(gameRoot, "node_modules/@manse/schema"));
  await symlink(join(repositoryRoot, "packages/schema/node_modules/zod"), join(gameRoot, "node_modules/zod"));
  const result = run(process.execPath, [
    join(gameRoot, "vendor/manse-cli/lib/cli.js"),
    "validate",
    gameRoot,
    "--json",
  ], gameRoot);
  const validation = JSON.parse(result.stdout);
  assert(validation.ok === true, "Generated starter must pass the vendored Manse validator.");
  const pack = await readJson(join(gameRoot, "public/packs/contract-game/manse.pack.json"));
  const siteProvenance = await readJson(join(gameRoot, "public/asset-provenance.json"));
  const challenge = pack.scenes.find((scene) => scene.challenge !== null)?.challenge;
  assert(challenge?.type === "touch_targets", "The default mechanic must remain the universally runnable touch_targets.");
  assert(pack.schemaVersion === 1, "touch_targets games must stay schemaVersion 1 packs runnable by every engine.");
  assert(challenge?.timeBudgetMs === 300_000, "Long briefs must respect the challenge time-budget schema ceiling.");
  const firstRound = pack.scenes.find((scene) => scene.id === "round-one");
  const easierRound = pack.scenes.find((scene) => scene.id === "round-two");
  const struggle = firstRound?.transitions.find((transition) => transition.on === "struggle");
  assert(struggle?.to === "round-two" && struggle.adapt !== null, "Generated games must include an executable adaptive retry.");
  assert(easierRound?.challenge?.type === "touch_targets", "The adaptive retry must keep the declared mechanic.");
  const wasmProvenance = siteProvenance.assets.filter((asset) => asset.path.startsWith("/vendor/mediapipe/wasm/"));
  assert(wasmProvenance.length === 4, "Generated games must record all four MediaPipe WASM files.");
  assert(wasmProvenance.every((asset) => /^[a-f0-9]{64}$/u.test(asset.sha256)), "WASM provenance must include SHA-256 integrity.");
  const config = await readFile(join(gameRoot, "app/game-config.ts"), "utf8");
  assert(config.includes('Contract \\"Game\\" <QA>'), "Generated source must safely encode creator text.");

  // A motion mechanic must generate a valid schemaVersion 2 pack pinned to the
  // 0.2 engine it bundles.
  const motionRoot = join(qaRoot, "motion-game");
  run(process.execPath, [
    join(pluginRoot, "scripts/create-game.mjs"),
    "--output", motionRoot,
    "--slug", "motion-game",
    "--title", "Motion QA",
    "--summary", "Generated freeze mechanic from the bundled Manse starter.",
    "--theme", "Statue garden",
    "--mechanic", "freeze",
    "--target-count", "3",
  ]);
  await mkdir(join(motionRoot, "node_modules/@manse"), { recursive: true });
  await symlink(join(motionRoot, "vendor/manse-schema"), join(motionRoot, "node_modules/@manse/schema"));
  await symlink(join(repositoryRoot, "packages/schema/node_modules/zod"), join(motionRoot, "node_modules/zod"));
  const motionResult = run(process.execPath, [
    join(motionRoot, "vendor/manse-cli/lib/cli.js"),
    "validate",
    motionRoot,
    "--json",
  ], motionRoot);
  assert(JSON.parse(motionResult.stdout).ok === true, "Generated motion games must pass the vendored Manse validator.");
  const motionPack = await readJson(join(motionRoot, "public/packs/motion-game/manse.pack.json"));
  assert(motionPack.schemaVersion === 2, "Motion mechanics must emit schemaVersion 2 packs.");
  assert(
    motionPack.meta.engine.minimumVersion === "0.2.0",
    "Motion packs must demand the 0.2 engine so older runtimes reject them cleanly.",
  );
  const motionChallenge = motionPack.scenes.find((scene) => scene.challenge !== null)?.challenge;
  assert(motionChallenge?.type === "freeze", "The requested mechanic must be generated, not reinterpreted.");
  const motionManifest = await readJson(join(motionRoot, "public/.well-known/manse-game.json"));
  assert(
    Array.isArray(motionManifest.movementTags) && motionManifest.movementTags.includes("freeze"),
    "Motion games must advertise their movement tag honestly.",
  );
} finally {
  await rm(qaRoot, { recursive: true, force: true });
}

console.log("Manse Creator contract passed: manifest, seven skills, vendored runtime, and generated game validated.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(command, args, cwd = repositoryRoot) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`Command failed (${basename(command)} ${args.join(" ")}):\n${result.stderr || result.stdout}`);
  }
  return result;
}

async function compareTrees(sourceRoot, destinationRoot) {
  const [sourceFiles, destinationFiles] = await Promise.all([listFiles(sourceRoot), listFiles(destinationRoot)]);
  assert(
    JSON.stringify(sourceFiles) === JSON.stringify(destinationFiles),
    `Vendored file list is stale for ${relative(repositoryRoot, sourceRoot)}. Run npm run plugin:sync.`,
  );
  for (const path of sourceFiles) {
    const [source, destination] = await Promise.all([
      readFile(join(sourceRoot, path)),
      readFile(join(destinationRoot, path)),
    ]);
    assert(
      digest(source) === digest(destination),
      `Vendored file is stale: ${relative(repositoryRoot, join(destinationRoot, path))}. Run npm run plugin:sync.`,
    );
  }
}

async function listFiles(root) {
  const files = [];
  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) files.push(relative(root, path));
    }
  }
  await visit(root);
  return files.sort();
}

function digest(contents) {
  return createHash("sha256").update(contents).digest("hex");
}
