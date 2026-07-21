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

describe("version 2 motion contract", () => {
  it("accepts the canonical v2 fixture covering every motion primitive", async () => {
    const pack = parseEpisodePack(await fixture("valid", "manse.pack.v2.json"));
    expect(validateEpisodePackIntegrity(pack)).toEqual([]);
    expect(pack.schemaVersion).toBe(2);
    expect(pack.meta.players).toEqual({ min: 1, max: 2, mode: "coop" });
  });

  it("keeps motion primitives out of schemaVersion 1 packs", async () => {
    const pack = structuredClone(await fixture("valid", "manse.pack.json")) as {
      scenes: Array<{ challenge: unknown }>;
    };
    pack.scenes[1]!.challenge = {
      type: "freeze",
      holdMs: 2000,
      motionThreshold: 0.02,
      graceMs: 250,
      rounds: 1,
      minVisibleJoints: 8,
      timeBudgetMs: 30000,
      successAudioId: "cue-sfx",
      encourageAudioId: "cue-sfx",
    };
    const result = safeParseEpisodePack(pack);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(JSON.stringify(result.error.issues)).toContain("schema_version");
    }
  });

  it("keeps multiplayer declarations out of schemaVersion 1 packs", async () => {
    const pack = structuredClone(await fixture("valid", "manse.pack.json")) as {
      meta: Record<string, unknown>;
    };
    pack.meta.players = { min: 1, max: 2, mode: "coop" };
    expect(safeParseEpisodePack(pack).success).toBe(false);
  });

  it("requires v2 packs to demand an engine that executes them", async () => {
    const pack = structuredClone(await fixture("valid", "manse.pack.v2.json")) as {
      meta: { engine: { minimumVersion: string } };
    };
    pack.meta.engine.minimumVersion = "0.1.0";
    const result = safeParseEpisodePack(pack);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(JSON.stringify(result.error.issues)).toContain("engine_compatibility");
    }
  });

  it("rejects duplicate zone ids inside one body_zone challenge", async () => {
    const pack = structuredClone(await fixture("valid", "manse.pack.v2.json")) as {
      scenes: Array<{ id: string; challenge: { type?: string; zones?: Array<{ id: string }> } | null }>;
    };
    const dodge = pack.scenes.find((scene) => scene.id === "dodge");
    dodge!.challenge!.zones![1]!.id = "left-bubble";
    expect(safeParseEpisodePack(pack).success).toBe(false);
  });

  it("structurally refuses nested sequences", async () => {
    const pack = structuredClone(await fixture("valid", "manse.pack.v2.json")) as {
      scenes: Array<{ id: string; challenge: { steps?: unknown[] } | null }>;
    };
    const finale = pack.scenes.find((scene) => scene.id === "finale");
    finale!.challenge!.steps!.push({ type: "sequence", steps: [], interStepGraceMs: 0 });
    expect(safeParseEpisodePack(pack).success).toBe(false);
  });
});
