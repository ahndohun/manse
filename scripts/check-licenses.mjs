#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import process from "node:process";

const lockPath = new URL("../package-lock.json", import.meta.url);
const blockedMarkers = /(?:^|\b)(?:UNLICENSED|UNKNOWN)(?:\b|$)|SEE LICENSE IN/i;

function packageNameFromPath(packagePath) {
  const marker = "node_modules/";
  const index = packagePath.lastIndexOf(marker);
  return index === -1 ? packagePath : packagePath.slice(index + marker.length);
}

function normalizeLicense(value) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeLicense).filter(Boolean).join(" OR ");
  }

  if (value && typeof value === "object" && typeof value.type === "string") {
    return value.type.trim();
  }

  return "";
}

const lock = JSON.parse(await readFile(lockPath, "utf8"));
const inventory = new Map();

for (const [packagePath, metadata] of Object.entries(lock.packages ?? {})) {
  if (!packagePath.includes("node_modules/") || !metadata.version || metadata.link) {
    continue;
  }

  const name = metadata.name ?? packageNameFromPath(packagePath);
  const key = `${name}@${metadata.version}`;
  const license = normalizeLicense(metadata.license);
  const previous = inventory.get(key);

  inventory.set(key, {
    name,
    version: metadata.version,
    license,
    developmentOnly: previous
      ? previous.developmentOnly && metadata.dev === true
      : metadata.dev === true,
  });
}

const packages = [...inventory.values()].sort(
  (left, right) =>
    left.name.localeCompare(right.name) || left.version.localeCompare(right.version),
);
const missing = packages.filter(
  (entry) => !entry.license || blockedMarkers.test(entry.license),
);
const licenseCounts = Object.fromEntries(
  [...packages.reduce((counts, entry) => {
    counts.set(entry.license, (counts.get(entry.license) ?? 0) + 1);
    return counts;
  }, new Map())].sort(([left], [right]) => left.localeCompare(right)),
);

const report = {
  lockfileVersion: lock.lockfileVersion,
  packageCount: packages.length,
  runtimePackageCount: packages.filter((entry) => !entry.developmentOnly).length,
  developmentOnlyPackageCount: packages.filter((entry) => entry.developmentOnly).length,
  licenseCounts,
  missingOrBlocked: missing,
  packages,
};

if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  process.stdout.write(
    `License inventory: ${report.packageCount} external package versions ` +
      `(${report.runtimePackageCount} runtime, ${report.developmentOnlyPackageCount} development-only).\n`,
  );
  process.stdout.write(`Declared license expressions: ${Object.keys(licenseCounts).length}.\n`);
}

if (missing.length > 0) {
  process.stderr.write(
    `Missing or blocked license metadata: ${missing
      .map((entry) => `${entry.name}@${entry.version}`)
      .join(", ")}\n`,
  );
  process.exitCode = 1;
}
