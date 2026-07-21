import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import { isDirectCliInvocation } from "../src/cli.js";
import {
  buildCatalogSnapshot,
  packPublication,
  validateProjectRoot,
  validateTarget,
  type NetworkDependencies,
} from "../src/index.js";

async function readFixture(filename: string): Promise<Record<string, unknown>> {
  const path = new URL(`../../schema/fixtures/valid/${filename}`, import.meta.url);
  return JSON.parse(await readFile(path, "utf8")) as Record<string, unknown>;
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function seedGame(
  webRoot: string,
  options: {
    readonly engineVersion?: string;
    readonly html?: string;
    readonly packFixture?: string;
    readonly provenance?: unknown;
  } = {},
): Promise<{ readonly manifestPath: string; readonly packPath: string; readonly packRoot: string }> {
  const manifest = await readFixture("manse-game.json");
  if (options.engineVersion !== undefined) manifest.engineVersion = options.engineVersion;
  const pack = await readFixture(options.packFixture ?? "manse.pack.json");
  const provenance = options.provenance ?? await readFixture("provenance.json");
  const manifestPath = join(webRoot, ".well-known", "manse-game.json");
  const packRoot = join(webRoot, "packs", "example");
  const packPath = join(packRoot, "manse.pack.json");

  await writeJson(manifestPath, manifest);
  await writeJson(packPath, pack);
  await writeJson(join(packRoot, "provenance.json"), provenance);
  await mkdir(join(packRoot, "assets", "audio"), { recursive: true });
  await writeFile(join(packRoot, "assets", "audio", "intro-en.mp3"), "fixture narration", "utf8");
  await writeFile(join(packRoot, "assets", "audio", "cue.wav"), "fixture cue", "utf8");
  if (options.html !== undefined) await writeFile(join(webRoot, "index.html"), options.html, "utf8");

  return { manifestPath, packPath, packRoot };
}

async function withTempRoot(run: (root: string) => Promise<void>): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), "manse-cli-test-"));
  try {
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

describe("P0 project validation", () => {
  it("recognizes an npm-style symlink as a direct CLI invocation", async () => {
    await withTempRoot(async (root) => {
      const cliPath = join(root, "cli.js");
      const binPath = join(root, "manse");
      await writeFile(cliPath, "// fixture\n", "utf8");
      await symlink(cliPath, binPath);

      expect(isDirectCliInvocation(pathToFileURL(cliPath).href, binPath)).toBe(true);
      expect(isDirectCliInvocation(pathToFileURL(cliPath).href, join(root, "missing"))).toBe(false);
    });
  });

  it("validates a source project and a direct pack target with provenance", async () => {
    await withTempRoot(async (root) => {
      const seeded = await seedGame(join(root, "public"));
      const projectDocuments = await validateProjectRoot(root);
      const packDocuments = await validateTarget(seeded.packPath, root);

      expect(projectDocuments.map(({ kind }) => kind)).toEqual(["manifest", "pack"]);
      expect(packDocuments.map(({ kind }) => kind)).toEqual(["pack"]);
    });
  });

  it("rejects executable content inside declarative packs", async () => {
    await withTempRoot(async (root) => {
      const { packRoot } = await seedGame(join(root, "public"));
      await writeFile(join(packRoot, "payload.js"), "export default 1;\n", "utf8");

      await expect(validateProjectRoot(root)).rejects.toMatchObject({ code: "EXECUTABLE_PACK_ASSET" });
    });
  });

  it("rejects packs outside the manifest engine compatibility range", async () => {
    await withTempRoot(async (root) => {
      await seedGame(join(root, "public"), { engineVersion: "0.0.9" });

      await expect(validateProjectRoot(root)).rejects.toMatchObject({ code: "ENGINE_INCOMPATIBLE" });
    });
  });

  it("validates a schemaVersion 2 motion pack against a 0.2 engine", async () => {
    await withTempRoot(async (root) => {
      await seedGame(join(root, "public"), {
        engineVersion: "0.2.0",
        packFixture: "manse.pack.v2.json",
        provenance: MOTION_PACK_PROVENANCE,
      });
      const documents = await validateProjectRoot(root);
      expect(documents.map(({ kind }) => kind)).toEqual(["manifest", "pack"]);
    });
  });

  it("rejects a schemaVersion 2 motion pack on a 0.1 engine", async () => {
    await withTempRoot(async (root) => {
      await seedGame(join(root, "public"), {
        engineVersion: "0.1.0",
        packFixture: "manse.pack.v2.json",
        provenance: MOTION_PACK_PROVENANCE,
      });
      await expect(validateProjectRoot(root)).rejects.toMatchObject({ code: "ENGINE_INCOMPATIBLE" });
    });
  });
});

const MOTION_PACK_PROVENANCE = {
  schemaVersion: 1,
  assets: [
    {
      assetId: "cue-sfx",
      path: "assets/audio/cue.wav",
      license: {
        spdxId: "CC0-1.0",
        name: "CC0 1.0 Universal",
        url: "https://creativecommons.org/publicdomain/zero/1.0/",
        attribution: null,
      },
      provenance: {
        kind: "original",
        creator: "Example Creator",
        createdAt: "2026-07-21T00:00:00.000Z",
      },
    },
  ],
};

describe("P0 publication safety", () => {
  it("builds the exact versioned snapshot consumed by the Showcase", async () => {
    await withTempRoot(async (root) => {
      const manifest = await readFixture("manse-game.json");
      const manifestUrl = "https://game.example/.well-known/manse-game.json";
      const catalogPath = join(root, "catalog.json");
      const snapshotPath = join(root, "catalog.snapshot.json");
      await writeJson(catalogPath, { schemaVersion: 1, games: [{ manifestUrl }] });
      const network: NetworkDependencies = {
        async resolveHostname() {
          return ["203.0.113.10"];
        },
        async fetch(input) {
          const url = new URL(input);
          if (url.pathname === "/.well-known/manse-game.json") {
            return Response.json(manifest, { headers: { "content-type": "application/json" } });
          }
          if (url.pathname === "/") {
            return new Response("<!doctype html><title>Game</title>", {
              headers: { "content-type": "text/html" },
            });
          }
          if (url.pathname === "/assets/thumbnail.webp") {
            return new Response(new Uint8Array([82, 73, 70, 70]), {
              headers: { "content-type": "image/webp", "content-length": "4" },
            });
          }
          return new Response("Not found", { status: 404 });
        },
      };

      const result = await buildCatalogSnapshot(catalogPath, snapshotPath, root, network);
      const expected = { schemaVersion: 1, games: [{ manifestUrl, manifest }] };
      expect(result.snapshot).toEqual(expected);
      expect(JSON.parse(await readFile(snapshotPath, "utf8"))).toEqual(expected);
    });
  });

  it("creates byte-for-byte deterministic local-only ZIP artifacts", async () => {
    await withTempRoot(async (root) => {
      const projectRoot = join(root, "game");
      const deployRoot = join(projectRoot, "dist");
      await seedGame(deployRoot, {
        html: '<!doctype html><script type="module" src="/assets/app.js"></script>',
      });
      await mkdir(join(deployRoot, "assets"), { recursive: true });
      await writeFile(join(deployRoot, "assets", "app.js"), "console.log('local runtime');\n", "utf8");

      const first = await packPublication(projectRoot, join(root, "first.zip"), root);
      const second = await packPublication(projectRoot, join(root, "second.zip"), root);

      expect(first.sha256).toMatch(/^[a-f0-9]{64}$/u);
      expect(second.sha256).toBe(first.sha256);
      expect(await readFile(first.outputPath)).toEqual(await readFile(second.outputPath));
    });
  });

  it("blocks remote runtime resources and secret-bearing files", async () => {
    await withTempRoot(async (root) => {
      const remoteProject = join(root, "remote-game");
      await seedGame(join(remoteProject, "dist"), {
        html: '<!doctype html><script src="https://cdn.example/runtime.js"></script>',
      });
      await expect(
        packPublication(remoteProject, join(root, "remote.zip"), root),
      ).rejects.toMatchObject({ code: "RUNTIME_CDN_BLOCKED" });

      const secretProject = join(root, "secret-game");
      const secretDeployRoot = join(secretProject, "dist");
      await seedGame(secretDeployRoot, { html: "<!doctype html><title>Local game</title>" });
      await writeFile(join(secretDeployRoot, ".env"), "TOKEN=do-not-publish\n", "utf8");
      await expect(
        packPublication(secretProject, join(root, "secret.zip"), root),
      ).rejects.toMatchObject({ code: "PRIVATE_FILE_BLOCKED" });
    });
  });
});
