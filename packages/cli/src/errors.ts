import type { Diagnostic } from "./types.js";

export enum ExitCode {
  Success = 0,
  Validation = 1,
  Usage = 2,
  LocalIo = 3,
  Network = 4,
  Conflict = 5,
  Unsupported = 6,
  Internal = 70,
  Interrupted = 130,
}

export interface CliErrorOptions {
  readonly cause?: unknown;
  readonly diagnostics?: readonly Diagnostic[];
  readonly exitCode?: ExitCode;
}

export class CliError extends Error {
  readonly code: string;
  readonly diagnostics: readonly Diagnostic[];
  readonly exitCode: ExitCode;

  constructor(code: string, message: string, options: CliErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = "CliError";
    this.code = code;
    this.exitCode = options.exitCode ?? ExitCode.Validation;
    this.diagnostics = options.diagnostics ?? [
      { code, message, severity: "error" },
    ];
  }
}

export function toCliError(error: unknown): CliError {
  if (error instanceof CliError) return error;
  if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
    return new CliError("INTERRUPTED", "The operation was interrupted.", {
      cause: error,
      exitCode: ExitCode.Interrupted,
    });
  }
  return new CliError("INTERNAL_ERROR", "An unexpected internal error occurred.", {
    cause: error,
    exitCode: ExitCode.Internal,
  });
}
