import {
  MANSE_GAME_MANIFEST_PATH,
  MANSE_PACK_FILENAME,
  safeParseCatalog,
  safeParseCatalogSnapshot,
  safeParseEpisodePack,
  safeParseGameManifest,
  safeParsePackProvenance,
  validateEpisodePackIntegrity,
  validatePackProvenance,
  type EpisodePack,
  type PackProvenance,
} from "@manse/schema";
import { CliError, ExitCode } from "./errors.js";
import type { Diagnostic } from "./types.js";

export const MANIFEST_URL_PATH = MANSE_GAME_MANIFEST_PATH;
export const MANIFEST_RELATIVE_PATH = MANIFEST_URL_PATH.replace(/^\/+/, "");
export const PACK_FILENAME = MANSE_PACK_FILENAME;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function escapePointerSegment(value: string | number): string {
  return String(value).replaceAll("~", "~0").replaceAll("/", "~1");
}

function pointerFromPath(path: unknown): string | undefined {
  if (typeof path === "string") {
    if (path.length === 0) return undefined;
    return path.startsWith("/") ? path : `/${escapePointerSegment(path)}`;
  }
  if (!Array.isArray(path) || path.length === 0) return undefined;
  return `/${path.map((part) => escapePointerSegment(String(part))).join("/")}`;
}

function issuesFromError(error: unknown, filePath: string, fallbackCode: string): Diagnostic[] {
  if (!isRecord(error)) {
    return [{ code: fallbackCode, message: "The document does not match the Manse schema.", path: filePath, severity: "error" }];
  }
  const rawIssues = Array.isArray(error.issues) ? error.issues : [];
  if (rawIssues.length === 0) {
    return [{
      code: fallbackCode,
      message: typeof error.message === "string" ? error.message : "The document does not match the Manse schema.",
      path: filePath,
      severity: "error",
    }];
  }
  return rawIssues.map((issue): Diagnostic => {
    if (!isRecord(issue)) {
      return { code: fallbackCode, message: String(issue), path: filePath, severity: "error" };
    }
    return {
      code: typeof issue.code === "string" ? issue.code.toUpperCase() : fallbackCode,
      message: typeof issue.message === "string" ? issue.message : "Invalid value.",
      path: filePath,
      pointer: pointerFromPath(issue.pointer ?? issue.path),
      severity: "error",
    };
  });
}

function validationError(
  code: string,
  label: string,
  filePath: string,
  error: unknown,
): CliError {
  return new CliError(code, `${filePath} is not a valid Manse ${label}.`, {
    diagnostics: issuesFromError(error, filePath, code),
    exitCode: ExitCode.Validation,
  });
}

export function validateManifest(input: unknown, filePath: string): Record<string, unknown> {
  const result = safeParseGameManifest(input);
  if (!result.success) throw validationError("INVALID_MANIFEST", "manifest", filePath, result.error);
  return result.data as unknown as Record<string, unknown>;
}

export function validatePack(input: unknown, filePath: string): Record<string, unknown> {
  const result = safeParseEpisodePack(input);
  if (!result.success) throw validationError("INVALID_PACK", "pack", filePath, result.error);
  const integrityIssues = validateEpisodePackIntegrity(result.data);
  if (integrityIssues.length > 0) {
    throw new CliError("PACK_INTEGRITY", `${filePath} contains unresolved or unsafe references.`, {
      diagnostics: issuesFromError({ issues: integrityIssues }, filePath, "PACK_INTEGRITY"),
      exitCode: ExitCode.Validation,
    });
  }
  return result.data as unknown as Record<string, unknown>;
}

export function validateCatalog(input: unknown, filePath: string): Record<string, unknown> {
  const result = safeParseCatalog(input);
  if (!result.success) throw validationError("INVALID_CATALOG", "catalog", filePath, result.error);
  return result.data as unknown as Record<string, unknown>;
}

export function validateCatalogSnapshot(input: unknown, filePath: string): Record<string, unknown> {
  const result = safeParseCatalogSnapshot(input);
  if (!result.success) throw validationError("INVALID_CATALOG_SNAPSHOT", "catalog snapshot", filePath, result.error);
  return result.data as unknown as Record<string, unknown>;
}

export function validateProvenance(
  input: unknown,
  filePath: string,
  pack: Record<string, unknown>,
): Record<string, unknown> {
  const result = safeParsePackProvenance(input);
  if (!result.success) throw validationError("INVALID_PROVENANCE", "provenance document", filePath, result.error);
  const issues = validatePackProvenance(
    pack as unknown as EpisodePack,
    result.data as PackProvenance,
  );
  if (issues.length > 0) {
    throw new CliError("PROVENANCE_INTEGRITY", `${filePath} does not match its pack assets.`, {
      diagnostics: issuesFromError({ issues }, filePath, "PROVENANCE_INTEGRITY"),
      exitCode: ExitCode.Validation,
    });
  }
  return result.data as unknown as Record<string, unknown>;
}
