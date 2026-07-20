import { DEVICE_TIER_PROFILES, type DeviceTier } from "./tier.js";

export interface AdaptiveInferenceSchedulerOptions {
  readonly tier?: DeviceTier;
  readonly targetHz?: number;
  readonly minimumHz?: number;
  readonly maximumHz?: number;
  readonly overloadRatio?: number;
  readonly recoveryRatio?: number;
  readonly decreaseAfterSamples?: number;
  readonly increaseAfterSamples?: number;
}

export interface InferenceScheduleDecision {
  readonly shouldInfer: boolean;
  readonly reason: "due" | "paused" | "duty-cycle";
  readonly targetHz: number;
  readonly dutyCycle: number;
}

export interface InferenceSchedulerSnapshot {
  readonly targetHz: number;
  readonly minimumHz: number;
  readonly maximumHz: number;
  readonly dutyCycle: number;
  readonly renderHz: number;
  readonly averageInferenceMs: number;
  readonly paused: boolean;
}

export class AdaptiveInferenceScheduler {
  private readonly minimumHz: number;
  private readonly maximumHz: number;
  private readonly overloadRatio: number;
  private readonly recoveryRatio: number;
  private readonly decreaseAfterSamples: number;
  private readonly increaseAfterSamples: number;
  private targetHz: number;
  private paused = false;
  private nextDueMs: number | null = null;
  private previousOpportunityMs: number | null = null;
  private renderIntervalEmaMs = 1000 / 60;
  private inferenceDurationEmaMs = 0;
  private overloadSamples = 0;
  private recoverySamples = 0;

  constructor(options: AdaptiveInferenceSchedulerOptions = {}) {
    const profile = DEVICE_TIER_PROFILES[options.tier ?? "A"];
    this.minimumHz = options.minimumHz ?? profile.minimumInferenceHz;
    this.maximumHz = options.maximumHz ?? profile.maximumInferenceHz;
    this.targetHz = options.targetHz ?? profile.targetInferenceHz;
    this.overloadRatio = options.overloadRatio ?? 0.8;
    this.recoveryRatio = options.recoveryRatio ?? 0.45;
    this.decreaseAfterSamples = options.decreaseAfterSamples ?? 3;
    this.increaseAfterSamples = options.increaseAfterSamples ?? 30;
    if (
      this.minimumHz <= 0 || this.maximumHz < this.minimumHz ||
      this.targetHz < this.minimumHz || this.targetHz > this.maximumHz
    ) {
      throw new RangeError("Scheduler frequencies must satisfy 0 < minimum <= target <= maximum.");
    }
    if (this.recoveryRatio <= 0 || this.overloadRatio <= this.recoveryRatio) {
      throw new RangeError("Scheduler recovery ratio must be below overload ratio.");
    }
  }

  consider(timestampMs: number): InferenceScheduleDecision {
    if (!Number.isFinite(timestampMs)) throw new TypeError("Timestamp must be finite.");
    if (this.previousOpportunityMs !== null && timestampMs > this.previousOpportunityMs) {
      const interval = timestampMs - this.previousOpportunityMs;
      this.renderIntervalEmaMs = ema(this.renderIntervalEmaMs, interval, 0.1);
    }
    this.previousOpportunityMs = timestampMs;
    if (this.paused) return this.decision(false, "paused");
    if (this.nextDueMs !== null && timestampMs + 0.001 < this.nextDueMs) {
      return this.decision(false, "duty-cycle");
    }
    this.nextDueMs = timestampMs + 1000 / this.targetHz;
    return this.decision(true, "due");
  }

  recordInference(durationMs: number, successful = true): void {
    if (!Number.isFinite(durationMs) || durationMs < 0) {
      throw new TypeError("Inference duration must be a non-negative finite number.");
    }
    this.inferenceDurationEmaMs = this.inferenceDurationEmaMs === 0
      ? durationMs
      : ema(this.inferenceDurationEmaMs, durationMs, 0.15);
    const budgetMs = 1000 / this.targetHz;
    if (!successful || durationMs > budgetMs * this.overloadRatio) {
      this.overloadSamples += 1;
      this.recoverySamples = 0;
      if (this.overloadSamples >= this.decreaseAfterSamples) {
        this.targetHz = Math.max(this.minimumHz, this.targetHz * 0.8);
        this.overloadSamples = 0;
        this.nextDueMs = null;
      }
      return;
    }
    this.overloadSamples = 0;
    if (durationMs < budgetMs * this.recoveryRatio) {
      this.recoverySamples += 1;
      if (this.recoverySamples >= this.increaseAfterSamples) {
        this.targetHz = Math.min(this.maximumHz, this.targetHz * 1.1);
        this.recoverySamples = 0;
        this.nextDueMs = null;
      }
    } else {
      this.recoverySamples = 0;
    }
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    if (!paused) this.nextDueMs = null;
  }

  reset(): void {
    this.nextDueMs = null;
    this.previousOpportunityMs = null;
    this.renderIntervalEmaMs = 1000 / 60;
    this.inferenceDurationEmaMs = 0;
    this.overloadSamples = 0;
    this.recoverySamples = 0;
  }

  snapshot(): InferenceSchedulerSnapshot {
    const renderHz = 1000 / this.renderIntervalEmaMs;
    return {
      targetHz: this.targetHz,
      minimumHz: this.minimumHz,
      maximumHz: this.maximumHz,
      dutyCycle: Math.min(1, this.targetHz / renderHz),
      renderHz,
      averageInferenceMs: this.inferenceDurationEmaMs,
      paused: this.paused,
    };
  }

  private decision(
    shouldInfer: boolean,
    reason: InferenceScheduleDecision["reason"],
  ): InferenceScheduleDecision {
    const snapshot = this.snapshot();
    return { shouldInfer, reason, targetHz: snapshot.targetHz, dutyCycle: snapshot.dutyCycle };
  }
}

function ema(previous: number, current: number, alpha: number): number {
  return previous + alpha * (current - previous);
}
