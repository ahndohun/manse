import type { DeviceTier } from "../types.js";

export interface TierTolerance {
  readonly hitRadiusMultiplier: number;
  readonly motionThresholdMultiplier: number;
  readonly stillnessThresholdMultiplier: number;
  readonly dropoutGraceMultiplier: number;
  readonly confidenceFloorMultiplier: number;
  readonly effectsMultiplier: number;
}

export interface EngineTuning {
  readonly fixedStep: {
    readonly stepMs: number;
    readonly maxFrameDeltaMs: number;
    readonly maxSubSteps: number;
  };
  readonly input: {
    readonly minimumLandmarkConfidence: number;
    readonly staleFrameMs: number;
  };
  readonly targets: {
    readonly baseRadius: number;
    readonly edgePadding: number;
    readonly exitRadiusMultiplier: number;
    readonly dropoutGraceMs: number;
    readonly defaultDwellMs: number;
  };
  readonly jump: {
    readonly crouchDepthBodyRatio: number;
    readonly airborneHeightBodyRatio: number;
    readonly landingHeightBodyRatio: number;
    readonly minimumBodyScale: number;
    readonly baselineAdaptationPerSecond: number;
    readonly cooldownMs: number;
  };
  readonly squat: {
    readonly downDepthBodyRatio: number;
    readonly upDepthBodyRatio: number;
    readonly minimumBodyScale: number;
    readonly baselineAdaptationPerSecond: number;
    readonly cooldownMs: number;
  };
  readonly freeze: {
    readonly velocityThresholdPerSecond: number;
    readonly movementGraceMs: number;
    readonly trackedJoints: readonly string[];
  };
  readonly run: {
    readonly liftBodyRatio: number;
    readonly releaseBodyRatio: number;
    readonly armLiftBodyRatio: number;
    readonly maximumStepGapMs: Readonly<Record<"stroll" | "jog" | "sprint", number>>;
    readonly minimumStepGapMs: number;
    readonly trackingGraceMs: number;
  };
  readonly balance: {
    readonly ankleLiftBodyRatio: number;
    readonly tiptoeHeelBodyRatio: number;
    readonly airplaneWristBodyRatio: number;
    readonly stillVelocityPerSecond: number;
    readonly movementGraceMs: number;
  };
  readonly mansePose: {
    readonly holdMs: number;
    readonly wristAboveHeadBodyRatio: number;
    readonly releaseMarginBodyRatio: number;
  };
  readonly outcome: { readonly partialProgress: number };
  readonly adaptation: {
    readonly rollingWindow: number;
    readonly minimumTimeBudgetMs: number;
    readonly maximumTimeBudgetMs: number;
    readonly easierTargetScaleMul: number;
    readonly easierDwellMsMul: number;
    readonly easierTimeBudgetMul: number;
    readonly harderTargetScaleMul: number;
    readonly harderDwellMsMul: number;
    readonly harderTimeBudgetMul: number;
  };
  readonly accessibility: {
    readonly seatedTargetScale: number;
    readonly seatedDwellMs: number;
    readonly reducedStimulation: {
      readonly particleScale: number;
      readonly motionScale: number;
      readonly celebrationDurationScale: number;
      readonly audioGain: number;
      readonly maximumSimultaneousSounds: number;
    };
  };
  readonly effects: {
    readonly particleScale: number;
    readonly motionScale: number;
    readonly celebrationDurationMs: number;
    readonly audioGain: number;
    readonly maximumSimultaneousSounds: number;
  };
  readonly tiers: Readonly<Record<DeviceTier, TierTolerance>>;
}

const gameplayTier: TierTolerance = {
  hitRadiusMultiplier: 1,
  motionThresholdMultiplier: 1,
  stillnessThresholdMultiplier: 1,
  dropoutGraceMultiplier: 1,
  confidenceFloorMultiplier: 1,
  effectsMultiplier: 1,
};

export const DEFAULT_ENGINE_TUNING: EngineTuning = {
  fixedStep: { stepMs: 1000 / 60, maxFrameDeltaMs: 250, maxSubSteps: 8 },
  input: { minimumLandmarkConfidence: 0.45, staleFrameMs: 300 },
  targets: {
    baseRadius: 0.075,
    edgePadding: 0.1,
    exitRadiusMultiplier: 1.25,
    dropoutGraceMs: 100,
    defaultDwellMs: 250,
  },
  jump: {
    crouchDepthBodyRatio: 0.07,
    airborneHeightBodyRatio: 0.035,
    landingHeightBodyRatio: 0.018,
    minimumBodyScale: 0.2,
    baselineAdaptationPerSecond: 0.4,
    cooldownMs: 180,
  },
  squat: {
    downDepthBodyRatio: 0.14,
    upDepthBodyRatio: 0.06,
    minimumBodyScale: 0.2,
    baselineAdaptationPerSecond: 0.25,
    cooldownMs: 160,
  },
  freeze: {
    velocityThresholdPerSecond: 0.075,
    movementGraceMs: 100,
    trackedJoints: [
      "left_shoulder", "right_shoulder", "left_wrist", "right_wrist",
      "left_hip", "right_hip", "left_ankle", "right_ankle",
    ],
  },
  run: {
    liftBodyRatio: 0.09,
    releaseBodyRatio: 0.04,
    armLiftBodyRatio: 0.08,
    maximumStepGapMs: { stroll: 1100, jog: 750, sprint: 500 },
    minimumStepGapMs: 120,
    trackingGraceMs: 350,
  },
  balance: {
    ankleLiftBodyRatio: 0.1,
    tiptoeHeelBodyRatio: 0.025,
    airplaneWristBodyRatio: 0.3,
    stillVelocityPerSecond: 0.09,
    movementGraceMs: 120,
  },
  mansePose: {
    holdMs: 500,
    wristAboveHeadBodyRatio: 0.035,
    releaseMarginBodyRatio: 0.02,
  },
  outcome: { partialProgress: 0.5 },
  adaptation: {
    rollingWindow: 5,
    minimumTimeBudgetMs: 1000,
    maximumTimeBudgetMs: 180_000,
    easierTargetScaleMul: 1.12,
    easierDwellMsMul: 0.9,
    easierTimeBudgetMul: 1.12,
    harderTargetScaleMul: 0.94,
    harderDwellMsMul: 1.08,
    harderTimeBudgetMul: 0.94,
  },
  accessibility: {
    seatedTargetScale: 1.15,
    seatedDwellMs: 150,
    reducedStimulation: {
      particleScale: 0.15,
      motionScale: 0.4,
      celebrationDurationScale: 0.65,
      audioGain: 0.75,
      maximumSimultaneousSounds: 2,
    },
  },
  effects: {
    particleScale: 1,
    motionScale: 1,
    celebrationDurationMs: 1800,
    audioGain: 1,
    maximumSimultaneousSounds: 6,
  },
  tiers: {
    S: { ...gameplayTier, effectsMultiplier: 1.25 },
    A: gameplayTier,
    B: {
      hitRadiusMultiplier: 1.12,
      motionThresholdMultiplier: 0.9,
      stillnessThresholdMultiplier: 1.18,
      dropoutGraceMultiplier: 1.35,
      confidenceFloorMultiplier: 0.9,
      effectsMultiplier: 0.7,
    },
    C: {
      hitRadiusMultiplier: 1.25,
      motionThresholdMultiplier: 0.8,
      stillnessThresholdMultiplier: 1.35,
      dropoutGraceMultiplier: 1.7,
      confidenceFloorMultiplier: 0.8,
      effectsMultiplier: 0.4,
    },
  },
};

export function tierTolerance(
  tier: DeviceTier,
  tuning: EngineTuning = DEFAULT_ENGINE_TUNING,
): TierTolerance {
  return tuning.tiers[tier];
}
