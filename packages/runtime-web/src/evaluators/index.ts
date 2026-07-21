import type { Challenge, SequenceStep } from "@manse/schema";

import { BodyZoneEvaluator } from "./body-zone.js";
import { FreezeEvaluator } from "./freeze.js";
import { JumpEvaluator } from "./jump.js";
import { PoseMatchEvaluator } from "./pose-match.js";
import { SequenceEvaluator } from "./sequence.js";
import { SquatEvaluator } from "./squat.js";
import { StepEvaluator } from "./step.js";
import { TouchTargetsEvaluator } from "./touch-targets.js";
import { VelocityHitEvaluator } from "./velocity-hit.js";
import type { ChallengeEvaluator, EvaluatorContext } from "./evaluator.js";

export * from "./evaluator.js";
export { buildSilhouette } from "./pose-match.js";

/**
 * The registry is the only place that knows every primitive. Adding the next
 * mechanic means adding one evaluator file and one case here — the session,
 * player, and renderers stay untouched.
 */
export function createChallengeEvaluator(
  challenge: Challenge,
  ctx: EvaluatorContext,
): ChallengeEvaluator {
  switch (challenge.type) {
    case "touch_targets": return new TouchTargetsEvaluator(challenge, ctx);
    case "freeze": return new FreezeEvaluator(challenge, ctx);
    case "body_zone": return new BodyZoneEvaluator(challenge, ctx);
    case "squat": return new SquatEvaluator(challenge, ctx);
    case "pose_match": return new PoseMatchEvaluator(challenge, ctx);
    case "jump": return new JumpEvaluator(challenge, ctx);
    case "velocity_hit": return new VelocityHitEvaluator(challenge, ctx);
    case "step": return new StepEvaluator(challenge, ctx);
    case "sequence": return new SequenceEvaluator(challenge, ctx, createSequenceStepEvaluator);
  }
}

function createSequenceStepEvaluator(step: SequenceStep, ctx: EvaluatorContext): ChallengeEvaluator {
  switch (step.type) {
    case "touch_targets": return new TouchTargetsEvaluator(withInnerBase(step), ctx);
    case "freeze": return new FreezeEvaluator(withInnerBase(step), ctx);
    case "body_zone": return new BodyZoneEvaluator(withInnerBase(step), ctx);
    case "squat": return new SquatEvaluator(step, ctx);
    case "pose_match": return new PoseMatchEvaluator(step, ctx);
    case "jump": return new JumpEvaluator(step, ctx);
    case "velocity_hit": return new VelocityHitEvaluator(step, ctx);
    case "step": return new StepEvaluator(step, ctx);
  }
}

/**
 * Inner sequence steps carry no timing/audio base; evaluators typed against
 * full challenges receive inert placeholders (the sequence owns real timing).
 */
function withInnerBase<T extends object>(step: T): T & {
  timeBudgetMs: number;
  successAudioId: string;
  encourageAudioId: string;
} {
  return { timeBudgetMs: 300_000, successAudioId: "sequence-inner", encourageAudioId: "sequence-inner", ...step };
}
