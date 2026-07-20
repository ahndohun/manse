export type DeviceTier = "S" | "A" | "B" | "C";

export interface DeviceTierProfile {
  readonly tier: DeviceTier;
  readonly targetInferenceHz: number;
  readonly minimumInferenceHz: number;
  readonly maximumInferenceHz: number;
  readonly preferredDelegate: "GPU" | "CPU";
  readonly preferredModel: "full" | "lite";
  readonly maximumPoses: number;
  readonly renderScale: number;
}

export const DEVICE_TIER_PROFILES: Readonly<Record<DeviceTier, DeviceTierProfile>> = {
  S: {
    tier: "S",
    targetInferenceHz: 30,
    minimumInferenceHz: 24,
    maximumInferenceHz: 45,
    preferredDelegate: "GPU",
    preferredModel: "full",
    maximumPoses: 2,
    renderScale: 1,
  },
  A: {
    tier: "A",
    targetInferenceHz: 24,
    minimumInferenceHz: 18,
    maximumInferenceHz: 30,
    preferredDelegate: "GPU",
    preferredModel: "full",
    maximumPoses: 1,
    renderScale: 1,
  },
  B: {
    tier: "B",
    targetInferenceHz: 15,
    minimumInferenceHz: 10,
    maximumInferenceHz: 20,
    preferredDelegate: "CPU",
    preferredModel: "lite",
    maximumPoses: 1,
    renderScale: 0.8,
  },
  C: {
    tier: "C",
    targetInferenceHz: 10,
    minimumInferenceHz: 6,
    maximumInferenceHz: 12,
    preferredDelegate: "CPU",
    preferredModel: "lite",
    maximumPoses: 1,
    renderScale: 0.65,
  },
};

export interface DeviceProbeInput {
  readonly search?: string | URLSearchParams;
  readonly hardwareConcurrency?: number;
  readonly deviceMemoryGb?: number;
  readonly hasWebGpu?: boolean;
  readonly hasWebGl2?: boolean;
  readonly hasWasmSimd?: boolean;
  readonly screenPixels?: number;
}

export interface DeviceProbeSignals {
  readonly hardwareConcurrency: number;
  readonly deviceMemoryGb: number | null;
  readonly hasWebGpu: boolean;
  readonly hasWebGl2: boolean;
  readonly hasWasmSimd: boolean;
  readonly screenPixels: number | null;
}

export interface DeviceTierResult {
  readonly tier: DeviceTier;
  readonly source: "override" | "probe";
  readonly profile: DeviceTierProfile;
  readonly signals: DeviceProbeSignals;
  readonly reasons: readonly string[];
}

export function parseTierOverride(
  search?: string | URLSearchParams,
): DeviceTier | null {
  const resolved = search ??
    (typeof location === "undefined" ? "" : location.search);
  const params = typeof resolved === "string"
    ? new URLSearchParams(resolved.startsWith("?") ? resolved.slice(1) : resolved)
    : resolved;
  const raw = params.get("tier")?.toUpperCase();
  return raw === "S" || raw === "A" || raw === "B" || raw === "C" ? raw : null;
}

export function probeDeviceTier(input: DeviceProbeInput = {}): DeviceTierResult {
  const nav = typeof navigator === "undefined" ? undefined : navigator;
  const extendedNavigator = nav as (Navigator & {
    readonly deviceMemory?: number;
    readonly gpu?: unknown;
  }) | undefined;
  const signals: DeviceProbeSignals = {
    hardwareConcurrency: positiveInteger(
      input.hardwareConcurrency ?? extendedNavigator?.hardwareConcurrency ?? 1,
    ),
    deviceMemoryGb: finitePositiveOrNull(
      input.deviceMemoryGb ?? extendedNavigator?.deviceMemory,
    ),
    hasWebGpu: input.hasWebGpu ?? extendedNavigator?.gpu !== undefined,
    hasWebGl2: input.hasWebGl2 ?? detectWebGl2(),
    hasWasmSimd: input.hasWasmSimd ?? detectWasmSimd(),
    screenPixels: finitePositiveOrNull(
      input.screenPixels ?? detectScreenPixels(),
    ),
  };
  const override = parseTierOverride(input.search);
  if (override !== null) {
    return {
      tier: override,
      source: "override",
      profile: DEVICE_TIER_PROFILES[override],
      signals,
      reasons: [`Device tier forced by ?tier=${override}.`],
    };
  }

  const memory = signals.deviceMemoryGb ?? 0;
  let tier: DeviceTier;
  const reasons: string[] = [];
  if (
    signals.hasWebGpu && signals.hardwareConcurrency >= 8 &&
    (memory === 0 || memory >= 8)
  ) {
    tier = "S";
    reasons.push("WebGPU and at least eight logical processors are available.");
  } else if (
    signals.hasWebGl2 && signals.hardwareConcurrency >= 4 &&
    (memory === 0 || memory >= 4)
  ) {
    tier = "A";
    reasons.push("WebGL2 and at least four logical processors are available.");
  } else if (
    (signals.hasWebGl2 || signals.hasWasmSimd) && signals.hardwareConcurrency >= 2 &&
    (memory === 0 || memory >= 2)
  ) {
    tier = "B";
    reasons.push("A local accelerated inference path is available.");
  } else {
    tier = "C";
    reasons.push("Using the compatibility profile for limited or unknown hardware.");
  }
  return { tier, source: "probe", profile: DEVICE_TIER_PROFILES[tier], signals, reasons };
}

function positiveInteger(value: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
}

function finitePositiveOrNull(value: number | undefined): number | null {
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : null;
}

function detectScreenPixels(): number | undefined {
  return typeof screen === "undefined" ? undefined : screen.width * screen.height;
}

function detectWebGl2(): boolean {
  if (typeof document === "undefined") return false;
  try {
    return document.createElement("canvas").getContext("webgl2") !== null;
  } catch {
    return false;
  }
}

function detectWasmSimd(): boolean {
  if (typeof WebAssembly === "undefined") return false;
  // Minimal module containing a v128.const instruction.
  const module = new Uint8Array([
    0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123,
    3, 2, 1, 0, 10, 22, 1, 20, 0, 253, 12, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 11,
  ]);
  try {
    return WebAssembly.validate(module);
  } catch {
    return false;
  }
}
