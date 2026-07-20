import type { Challenge, PlayerProfile } from "@manse/schema";
import { DEFAULT_ENGINE_TUNING, type EngineTuning, type TierTolerance } from "../config/tuning.js";
import type { DeviceTier } from "../types.js";

export type ChallengeSubstitution =
  | "none"
  | "jump-to-upper-touch"
  | "squat-to-reachable-touch"
  | "run-to-arm-pump"
  | "balance-to-freeze"
  | "feet-to-hands";

export interface ResolvedAccessibleChallenge {
  readonly originalType: Challenge["type"];
  readonly challenge: Challenge;
  readonly substitution: ChallengeSubstitution;
  readonly movementMode: "standard" | "seated-arms";
}

export interface SensoryPolicy {
  readonly flashesEnabled: false;
  readonly cameraShakeEnabled: false;
  readonly particleScale: number;
  readonly motionScale: number;
  readonly celebrationDurationMs: number;
  readonly audioGain: number;
  readonly maximumSimultaneousSounds: number;
}

export function resolveAccessibleChallenge(
  challenge: Challenge,
  profile: Pick<PlayerProfile, "abilities">,
  tuning: EngineTuning = DEFAULT_ENGINE_TUNING,
): ResolvedAccessibleChallenge {
  const seated = profile.abilities.seatedMode;
  if (challenge.type === "jump_count" && (seated || !profile.abilities.canJump)) {
    return {
      originalType: challenge.type,
      substitution: "jump-to-upper-touch",
      movementMode: "standard",
      challenge: {
        type: "touch_targets",
        count: Math.min(12, challenge.count),
        zone: "upper",
        targetScale: tuning.accessibility.seatedTargetScale,
        dwellMs: tuning.accessibility.seatedDwellMs,
        limb: "hands",
        timeBudgetMs: challenge.timeBudgetMs,
        successAudioId: challenge.successAudioId,
        encourageAudioId: challenge.encourageAudioId,
      },
    };
  }
  if (challenge.type === "squat" && seated) {
    return {
      originalType: challenge.type,
      substitution: "squat-to-reachable-touch",
      movementMode: "standard",
      challenge: {
        type: "touch_targets",
        count: Math.min(12, challenge.reps),
        zone: "reachable",
        targetScale: tuning.accessibility.seatedTargetScale,
        dwellMs: tuning.accessibility.seatedDwellMs,
        limb: "hands",
        timeBudgetMs: challenge.timeBudgetMs,
        successAudioId: challenge.successAudioId,
        encourageAudioId: challenge.encourageAudioId,
      },
    };
  }
  if (challenge.type === "run_in_place" && seated) {
    return { originalType: challenge.type, challenge, substitution: "run-to-arm-pump", movementMode: "seated-arms" };
  }
  if (challenge.type === "balance" && seated) {
    return {
      originalType: challenge.type,
      substitution: "balance-to-freeze",
      movementMode: "standard",
      challenge: {
        type: "freeze",
        holdMs: challenge.holdMs,
        cue: "visual",
        timeBudgetMs: challenge.timeBudgetMs,
        successAudioId: challenge.successAudioId,
        encourageAudioId: challenge.encourageAudioId,
      },
    };
  }
  if (challenge.type === "touch_targets" && seated && challenge.limb === "feet") {
    return {
      originalType: challenge.type,
      challenge: { ...challenge, limb: "hands", zone: "reachable" },
      substitution: "feet-to-hands",
      movementMode: "standard",
    };
  }
  return { originalType: challenge.type, challenge, substitution: "none", movementMode: "standard" };
}

export function resolveSensoryPolicy(
  reducedStimulation: boolean,
  tier: DeviceTier = "A",
  tuning: EngineTuning = DEFAULT_ENGINE_TUNING,
): SensoryPolicy {
  const effectsMultiplier = tuning.tiers[tier].effectsMultiplier;
  if (reducedStimulation) {
    const reduced = tuning.accessibility.reducedStimulation;
    return {
      flashesEnabled: false,
      cameraShakeEnabled: false,
      particleScale: Math.min(tuning.effects.particleScale * effectsMultiplier, reduced.particleScale),
      motionScale: Math.min(tuning.effects.motionScale, reduced.motionScale),
      celebrationDurationMs: Math.round(tuning.effects.celebrationDurationMs * reduced.celebrationDurationScale),
      audioGain: Math.min(tuning.effects.audioGain, reduced.audioGain),
      maximumSimultaneousSounds: Math.min(tuning.effects.maximumSimultaneousSounds, reduced.maximumSimultaneousSounds),
    };
  }
  return {
    flashesEnabled: false,
    cameraShakeEnabled: false,
    particleScale: tuning.effects.particleScale * effectsMultiplier,
    motionScale: tuning.effects.motionScale,
    celebrationDurationMs: tuning.effects.celebrationDurationMs,
    audioGain: tuning.effects.audioGain,
    maximumSimultaneousSounds: tuning.effects.maximumSimultaneousSounds,
  };
}

export function resolveTierTolerance(
  tier: DeviceTier,
  tuning: EngineTuning = DEFAULT_ENGINE_TUNING,
): TierTolerance {
  return { ...tuning.tiers[tier] };
}

export function isToleranceWidening(baseline: TierTolerance, candidate: TierTolerance): boolean {
  return candidate.hitRadiusMultiplier >= baseline.hitRadiusMultiplier &&
    candidate.motionThresholdMultiplier <= baseline.motionThresholdMultiplier &&
    candidate.stillnessThresholdMultiplier >= baseline.stillnessThresholdMultiplier &&
    candidate.dropoutGraceMultiplier >= baseline.dropoutGraceMultiplier &&
    candidate.confidenceFloorMultiplier <= baseline.confidenceFloorMultiplier;
}
