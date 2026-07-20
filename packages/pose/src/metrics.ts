import type { InferenceSchedulerSnapshot } from "./scheduler.js";
import type { PosePerformanceMetrics } from "./types.js";

export interface PoseMetricsMonitorOptions {
  readonly windowMs?: number;
  readonly now?: () => number;
}

interface InferenceSample {
  readonly timestampMs: number;
  readonly durationMs: number;
  readonly successful: boolean;
}

export class PoseMetricsMonitor {
  private readonly windowMs: number;
  private readonly now: () => number;
  private readonly inferenceSamples: InferenceSample[] = [];
  private readonly outputTimestamps: number[] = [];
  private inferenceAttempts = 0;
  private inferenceErrors = 0;
  private framesProduced = 0;
  private schedulerSkips = 0;

  constructor(options: PoseMetricsMonitorOptions = {}) {
    this.windowMs = options.windowMs ?? 5000;
    this.now = options.now ?? (() =>
      typeof performance === "undefined" ? Date.now() : performance.now());
    if (!Number.isFinite(this.windowMs) || this.windowMs <= 0) {
      throw new RangeError("Metrics window must be a positive finite number.");
    }
  }

  recordScheduleOpportunity(ran: boolean): void {
    if (!ran) this.schedulerSkips += 1;
  }

  recordInference(timestampMs: number, durationMs: number, successful: boolean): void {
    this.inferenceAttempts += 1;
    if (!successful) this.inferenceErrors += 1;
    this.inferenceSamples.push({ timestampMs, durationMs, successful });
    this.prune(timestampMs);
  }

  recordOutput(timestampMs: number): void {
    this.framesProduced += 1;
    this.outputTimestamps.push(timestampMs);
    this.prune(timestampMs);
  }

  snapshot(
    scheduler?: Pick<InferenceSchedulerSnapshot, "targetHz" | "dutyCycle">,
    timestampMs = this.now(),
  ): PosePerformanceMetrics {
    this.prune(timestampMs);
    const successfulDurations = this.inferenceSamples
      .filter((sample) => sample.successful)
      .map((sample) => sample.durationMs)
      .sort((left, right) => left - right);
    const averageInferenceMs = successfulDurations.length === 0
      ? 0
      : successfulDurations.reduce((total, value) => total + value, 0) /
        successfulDurations.length;
    const elapsedInferenceMs = eventSpan(this.inferenceSamples.map((sample) => sample.timestampMs));
    const elapsedOutputMs = eventSpan(this.outputTimestamps);
    return {
      sampleWindowMs: this.windowMs,
      framesProduced: this.framesProduced,
      inferenceAttempts: this.inferenceAttempts,
      inferenceErrors: this.inferenceErrors,
      schedulerSkips: this.schedulerSkips,
      averageInferenceMs,
      p95InferenceMs: percentile95(successfulDurations),
      inferenceHz: rate(this.inferenceSamples.length, elapsedInferenceMs),
      outputHz: rate(this.outputTimestamps.length, elapsedOutputMs),
      targetInferenceHz: scheduler?.targetHz ?? 0,
      dutyCycle: scheduler?.dutyCycle ?? 0,
    };
  }

  reset(): void {
    this.inferenceSamples.length = 0;
    this.outputTimestamps.length = 0;
    this.inferenceAttempts = 0;
    this.inferenceErrors = 0;
    this.framesProduced = 0;
    this.schedulerSkips = 0;
  }

  private prune(timestampMs: number): void {
    const cutoff = timestampMs - this.windowMs;
    while ((this.inferenceSamples[0]?.timestampMs ?? Infinity) < cutoff) {
      this.inferenceSamples.shift();
    }
    while ((this.outputTimestamps[0] ?? Infinity) < cutoff) {
      this.outputTimestamps.shift();
    }
  }
}

function percentile95(sorted: readonly number[]): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1);
  return sorted[index] ?? 0;
}

function eventSpan(timestamps: readonly number[]): number {
  if (timestamps.length < 2) return 0;
  return (timestamps[timestamps.length - 1] ?? 0) - (timestamps[0] ?? 0);
}

function rate(count: number, elapsedMs: number): number {
  return elapsedMs <= 0 || count < 2 ? 0 : ((count - 1) * 1000) / elapsedMs;
}
