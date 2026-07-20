import { lstat, readdir } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { CliError, ExitCode } from "./errors.js";
import { readJsonFile } from "./json.js";
import { isPathWithin, pathExists, relativePosix, resolveUserPath, walkRegularFiles } from "./paths.js";
import {
  MANIFEST_RELATIVE_PATH,
  PACK_FILENAME,
  validateCatalog,
  validateCatalogSnapshot,
  validateManifest,
  validatePack,
  validateProvenance,
} from "./schema-adapter.js";

const PROVENANCE_FILENAME = "provenance.json";
const FORBIDDEN_PACK_EXTENSIONS = new Set([".cjs", ".htm", ".html", ".js", ".mjs", ".svg", ".wasm"]);

export type ValidatedKind = "catalog" | "catalog-snapshot" | "manifest" | "pack";

export interface ValidatedDocument {
  readonly document: Record<string, unknown>;
  readonly kind: ValidatedKind;
  readonly path: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function inferKind(input: unknown, filePath: string): ValidatedKind {
  const name = basename(filePath);
  if (name === PACK_FILENAME) return "pack";
  if (name === "manse-game.json") return "manifest";
  if (name.includes("snapshot")) return "catalog-snapshot";
  if (name.includes("catalog")) return "catalog";

  if (isRecord(input)) {
    if ("entrySceneId" in input || "scenes" in input) return "pack";
    if ("gameUrl" in input || "engineVersion" in input) return "manifest";
    if (Array.isArray(input.games)) {
      const first = input.games[0];
      return isRecord(first) && "manifest" in first ? "catalog-snapshot" : "catalog";
    }
  }
  throw new CliError(
    "UNKNOWN_DOCUMENT",
    `Could not determine which Manse document type ${filePath} contains. Use a standard filename.`,
    { exitCode: ExitCode.Usage },
  );
}

export async function validateJsonDocument(
  filePath: string,
  forcedKind?: ValidatedKind,
): Promise<ValidatedDocument> {
  const input = await readJsonFile(filePath);
  const kind = forcedKind ?? inferKind(input, filePath);
  switch (kind) {
    case "manifest": return { document: validateManifest(input, filePath), kind, path: filePath };
    case "pack": return { document: validatePack(input, filePath), kind, path: filePath };
    case "catalog": return { document: validateCatalog(input, filePath), kind, path: filePath };
    case "catalog-snapshot": return {
      document: validateCatalogSnapshot(input, filePath),
      kind,
      path: filePath,
    };
  }
}

function findAssetPaths(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(findAssetPaths);
  if (!isRecord(value)) return [];
  const paths: string[] = [];
  for (const [key, child] of Object.entries(value)) {
    if ((key === "path" || key === "src") && typeof child === "string") paths.push(child);
    if (key !== "provenance") paths.push(...findAssetPaths(child));
  }
  return paths;
}

function assertSafeRelativeAssetPath(assetPath: string, packRoot: string, packPath: string): string {
  const segments = assetPath.split("/");
  if (
    assetPath.length === 0
    || assetPath !== assetPath.normalize("NFC")
    || /[%?#\u0000-\u001f\u007f\\]/u.test(assetPath)
    || segments.some((segment) => segment === "" || segment === "." || segment === "..")
  ) {
    throw new CliError("UNSAFE_ASSET_PATH", `Unsafe asset path in ${packPath}: ${assetPath}`, {
      exitCode: ExitCode.Validation,
    });
  }
  let absoluteUrl = false;
  try {
    new URL(assetPath);
    absoluteUrl = true;
  } catch {
    // Relative paths are expected and do not parse as absolute URLs.
  }
  if (absoluteUrl || assetPath.startsWith("/") || assetPath.split("/").includes("..")) {
    throw new CliError("UNSAFE_ASSET_PATH", `Pack assets must use paths inside the pack: ${assetPath}`, {
      exitCode: ExitCode.Validation,
    });
  }
  const absolute = resolve(packRoot, assetPath);
  if (!isPathWithin(packRoot, absolute)) {
    throw new CliError("ASSET_PATH_ESCAPE", `Pack asset escapes its pack directory: ${assetPath}`, {
      exitCode: ExitCode.Validation,
    });
  }
  return absolute;
}

async function validatePackDirectory(packPath: string): Promise<ValidatedDocument> {
  const packRoot = dirname(packPath);
  const validated = await validateJsonDocument(packPath, "pack");
  const files = await walkRegularFiles(packRoot);
  for (const file of files) {
    if (FORBIDDEN_PACK_EXTENSIONS.has(extname(file.relativePath).toLowerCase())) {
      throw new CliError(
        "EXECUTABLE_PACK_ASSET",
        `Version 1 packs may not contain executable or active-content files: ${file.relativePath}`,
        { exitCode: ExitCode.Validation },
      );
    }
  }

  const provenancePath = join(packRoot, PROVENANCE_FILENAME);
  if (!(await pathExists(provenancePath))) {
    throw new CliError(
      "PROVENANCE_MISSING",
      `Every project pack must include ${PROVENANCE_FILENAME}: ${relativePosix(packRoot, provenancePath)}`,
      { exitCode: ExitCode.Validation },
    );
  }
  const provenance = await readJsonFile(provenancePath);
  validateProvenance(provenance, provenancePath, validated.document);

  const declaredPaths = [...new Set(findAssetPaths(validated.document.assets))].sort();
  for (const assetPath of declaredPaths) {
    const absolute = assertSafeRelativeAssetPath(assetPath, packRoot, packPath);
    try {
      const metadata = await lstat(absolute);
      if (!metadata.isFile() || metadata.isSymbolicLink()) throw new Error("not a regular file");
    } catch (error) {
      throw new CliError("ASSET_NOT_FOUND", `Declared pack asset was not found: ${assetPath}`, {
        cause: error,
        exitCode: ExitCode.Validation,
      });
    }
  }
  return validated;
}

async function collectPackFiles(packsRoot: string): Promise<string[]> {
  if (!(await pathExists(packsRoot))) return [];
  const results: string[] = [];

  async function visit(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);
    for (const entry of entries) {
      const absolute = join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        throw new CliError("SYMLINK_NOT_ALLOWED", `Pack directories may not contain symlinks: ${absolute}`, {
          exitCode: ExitCode.LocalIo,
        });
      }
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile() && entry.name === PACK_FILENAME) results.push(absolute);
    }
  }
  await visit(packsRoot);
  return results.sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
}

export function sourceManifestPath(projectRoot: string): string {
  return join(projectRoot, "public", ...MANIFEST_RELATIVE_PATH.split("/"));
}

export function deployedManifestPath(deployRoot: string): string {
  return join(deployRoot, ...MANIFEST_RELATIVE_PATH.split("/"));
}

export async function validateProjectRoot(projectRoot: string): Promise<ValidatedDocument[]> {
  const sourceManifest = sourceManifestPath(projectRoot);
  const directManifest = deployedManifestPath(projectRoot);
  const usesSourceLayout = await pathExists(sourceManifest);
  const manifestPath = usesSourceLayout ? sourceManifest : directManifest;
  if (!(await pathExists(manifestPath))) {
    throw new CliError(
      "MANIFEST_NOT_FOUND",
      `No public Manse manifest was found. Expected ${sourceManifest}.`,
      { exitCode: ExitCode.LocalIo },
    );
  }
  const packsRoot = usesSourceLayout ? join(projectRoot, "public", "packs") : join(projectRoot, "packs");
  const packPaths = await collectPackFiles(packsRoot);
  if (packPaths.length === 0) {
    throw new CliError("PACK_NOT_FOUND", `No ${PACK_FILENAME} was found below ${packsRoot}.`, {
      exitCode: ExitCode.LocalIo,
    });
  }

  const documents: ValidatedDocument[] = [await validateJsonDocument(manifestPath, "manifest")];
  for (const packPath of packPaths) documents.push(await validatePackDirectory(packPath));
  return documents;
}

export async function validateTarget(rawTarget: string, cwd: string): Promise<ValidatedDocument[]> {
  const target = resolveUserPath(rawTarget, cwd);
  let metadata;
  try {
    metadata = await lstat(target);
  } catch (error) {
    throw new CliError("TARGET_NOT_FOUND", `No file or directory exists at ${target}.`, {
      cause: error,
      exitCode: ExitCode.LocalIo,
    });
  }
  if (metadata.isSymbolicLink()) {
    throw new CliError("SYMLINK_NOT_ALLOWED", "Validation targets may not be symlinks.", {
      exitCode: ExitCode.LocalIo,
    });
  }
  if (metadata.isFile()) return [await validateJsonDocument(target)];
  if (!metadata.isDirectory()) {
    throw new CliError("UNSUPPORTED_TARGET", "Validation accepts a JSON file or project/pack directory.", {
      exitCode: ExitCode.Usage,
    });
  }

  const directPack = join(target, PACK_FILENAME);
  if (await pathExists(directPack)) return [await validatePackDirectory(directPack)];
  return validateProjectRoot(target);
}

export async function readProjectManifest(rawProject: string, cwd: string): Promise<ValidatedDocument> {
  const projectRoot = resolveUserPath(rawProject, cwd);
  const manifestPath = sourceManifestPath(projectRoot);
  if (!(await pathExists(manifestPath))) {
    throw new CliError(
      "MANIFEST_NOT_FOUND",
      `No source manifest found at ${manifestPath}. Pass the game project root.`,
      { exitCode: ExitCode.LocalIo },
    );
  }
  return validateJsonDocument(manifestPath, "manifest");
}
