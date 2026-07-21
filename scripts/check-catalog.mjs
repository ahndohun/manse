import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const expectedPath = join(repositoryRoot, "apps/hub/app/catalog/catalog.snapshot.json");
const temporaryRoot = await mkdtemp(join(tmpdir(), "manse-catalog-check-"));
const actualPath = join(temporaryRoot, "catalog.snapshot.json");

try {
  const result = spawnSync(process.execPath, [
    join(repositoryRoot, "packages/cli/dist/cli.js"),
    "catalog",
    "build",
    join(repositoryRoot, "catalog/catalog.json"),
    "--out",
    actualPath,
    "--json",
  ], { cwd: repositoryRoot, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`Catalog build failed:\n${result.stderr || result.stdout}`);
  }
  const [expected, actual] = await Promise.all([readFile(expectedPath), readFile(actualPath)]);
  if (!expected.equals(actual)) {
    throw new Error("The checked-in Showcase snapshot is stale. Run npm run catalog:build and review the diff.");
  }
  console.log("Catalog source and checked-in Showcase snapshot match.");
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
