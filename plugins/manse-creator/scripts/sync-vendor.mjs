import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(pluginRoot, "../..");
const vendorRoot = resolve(pluginRoot, "assets/game-starter/vendor");

const packages = [
  {
    source: "packages/schema",
    destination: "manse-schema",
    manifest: {
      name: "@manse/schema",
      version: "0.2.0",
      license: "MIT",
      type: "module",
      sideEffects: false,
      main: "./lib/index.js",
      types: "./lib/index.d.ts",
      exports: { ".": { types: "./lib/index.d.ts", import: "./lib/index.js" } },
      dependencies: { zod: "3.25.76" },
    },
  },
  {
    source: "packages/cli",
    destination: "manse-cli",
    manifest: {
      name: "@manse/cli",
      version: "0.2.0",
      license: "MIT",
      type: "module",
      main: "./lib/index.js",
      types: "./lib/index.d.ts",
      bin: { manse: "./lib/cli.js" },
      exports: { ".": { types: "./lib/index.d.ts", import: "./lib/index.js" } },
      dependencies: { "@manse/schema": "0.2.0" },
    },
  },
  {
    source: "packages/runtime-web",
    destination: "manse-runtime-web",
    manifest: {
      name: "@manse/runtime-web",
      version: "0.2.0",
      license: "MIT",
      type: "module",
      sideEffects: false,
      main: "./lib/index.js",
      types: "./lib/index.d.ts",
      exports: {
        ".": { types: "./lib/index.d.ts", import: "./lib/index.js" },
        "./testing": { types: "./lib/testing.d.ts", import: "./lib/testing.js" },
      },
      dependencies: {
        "@manse/schema": "0.2.0",
        "@mediapipe/tasks-vision": "0.10.35",
      },
    },
  },
];

await rm(vendorRoot, { recursive: true, force: true });
await mkdir(vendorRoot, { recursive: true });

for (const packageSpec of packages) {
  const sourceRoot = resolve(repositoryRoot, packageSpec.source);
  const destinationRoot = resolve(vendorRoot, packageSpec.destination);
  const sourceDist = resolve(sourceRoot, "dist");
  try {
    await readFile(resolve(sourceDist, "index.js"));
  } catch {
    throw new Error(`Build ${packageSpec.source} before syncing the plugin vendor.`);
  }
  await mkdir(destinationRoot, { recursive: true });
  await cp(sourceDist, resolve(destinationRoot, "lib"), { recursive: true });
  const license = `${(await readFile(resolve(repositoryRoot, "LICENSE"), "utf8")).trimEnd()}\n`;
  await writeFile(resolve(destinationRoot, "LICENSE"), license, "utf8");
  await writeFile(
    resolve(destinationRoot, "package.json"),
    `${JSON.stringify(packageSpec.manifest, null, 2)}\n`,
    "utf8",
  );
  if (packageSpec.destination === "manse-runtime-web") {
    await cp(resolve(sourceRoot, "assets"), resolve(destinationRoot, "assets"), { recursive: true });
  }
}

console.log(`Synced Manse 0.2.0 packages to ${vendorRoot}`);
