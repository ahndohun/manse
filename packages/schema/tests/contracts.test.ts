import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import {
  parseEpisodePack,
  parsePackProvenance,
  safeParseCatalog,
  safeParseCatalogSnapshot,
  safeParseEpisodePack,
  safeParseGameManifest,
  safeParsePackProvenance,
  validateEpisodePackIntegrity,
  validatePackProvenance,
} from "../src/index.js";

type SafeParser = (input: unknown) => { readonly success: boolean };

async function fixture(group: "invalid" | "valid", filename: string): Promise<unknown> {
  const path = new URL(`../fixtures/${group}/${filename}`, import.meta.url);
  return JSON.parse(await readFile(path, "utf8")) as unknown;
}

describe("version 1 public contracts", () => {
  const validCases: ReadonlyArray<readonly [string, SafeParser]> = [
    ["manse-game.json", safeParseGameManifest],
    ["catalog.json", safeParseCatalog],
    ["catalog-snapshot.json", safeParseCatalogSnapshot],
    ["manse.pack.json", safeParseEpisodePack],
    ["provenance.json", safeParsePackProvenance],
  ];

  it.each(validCases)("accepts the canonical valid fixture %s", async (filename, parser) => {
    expect(parser(await fixture("valid", filename)).success).toBe(true);
  });

  const invalidCases: ReadonlyArray<readonly [string, SafeParser]> = [
    ["catalog-duplicate.json", safeParseCatalog],
    ["manse-game-http.json", safeParseGameManifest],
    ["manse.pack-unknown-field.json", safeParseEpisodePack],
    ["provenance-traversal.json", safeParsePackProvenance],
  ];

  it.each(invalidCases)("rejects the canonical invalid fixture %s", async (filename, parser) => {
    expect(parser(await fixture("invalid", filename)).success).toBe(false);
  });

  it("keeps pack references and provenance on the same contract", async () => {
    const pack = parseEpisodePack(await fixture("valid", "manse.pack.json"));
    const provenance = parsePackProvenance(await fixture("valid", "provenance.json"));

    expect(validateEpisodePackIntegrity(pack)).toEqual([]);
    expect(validatePackProvenance(pack, provenance)).toEqual([]);
  });

  it("rejects challenge mechanics that runtime 0.1 cannot execute", async () => {
    const pack = structuredClone(await fixture("valid", "manse.pack.json")) as {
      scenes: Array<{ challenge: unknown }>;
    };
    pack.scenes[1]!.challenge = {
      type: "jump_count",
      count: 3,
      countAloud: true,
      timeBudgetMs: 15_000,
      successAudioId: "cue-sfx",
      encourageAudioId: "cue-sfx",
    };

    expect(safeParseEpisodePack(pack).success).toBe(false);
  });

  it("rejects movement metadata that runtime 0.1 cannot execute", async () => {
    const manifest = structuredClone(await fixture("valid", "manse-game.json")) as {
      movementTags: string[];
    };
    manifest.movementTags = ["jumping"];

    expect(safeParseGameManifest(manifest).success).toBe(false);
  });
});
