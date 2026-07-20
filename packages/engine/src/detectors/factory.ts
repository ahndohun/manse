import type { Challenge, Outcome } from "@manse/schema";
import { DEFAULT_ENGINE_TUNING, type EngineTuning } from "../config/tuning.js";
import type { DetectorSnapshot } from "../types.js";
import { BalanceDetector } from "./balance.js";
import { FreezeDetector } from "./freeze.js";
import { JumpCountDetector } from "./jump-count.js";
import { RunInPlaceDetector } from "./run-in-place.js";
import { SquatDetector } from "./squat.js";
import { TouchTargetsDetector } from "./touch-targets.js";
import type { ChallengeDetector, DetectorContext } from "./types.js";

export function createChallengeDetector(
  challenge: Challenge,
  context: DetectorContext = {},
): ChallengeDetector {
  switch (challenge.type) {
    case "touch_targets": return new TouchTargetsDetector(challenge, context);
    case "jump_count": return new JumpCountDetector(challenge, context);
    case "squat": return new SquatDetector(challenge, context);
    case "freeze": return new FreezeDetector(challenge, context);
    case "run_in_place": return new RunInPlaceDetector(challenge, context);
    case "balance": return new BalanceDetector(challenge, context);
    default: return assertNever(challenge);
  }
}

export function classifyChallengeOutcome(
  snapshot: Pick<DetectorSnapshot, "completed" | "progress" | "elapsedMs">,
  timeBudgetMs: number,
  tuning: EngineTuning = DEFAULT_ENGINE_TUNING,
): Outcome {
  if (snapshot.completed) return "success";
  if (!Number.isFinite(timeBudgetMs) || timeBudgetMs <= 0) {
    throw new RangeError("timeBudgetMs must be positive and finite");
  }
  return snapshot.progress >= tuning.outcome.partialProgress ? "partial" : "struggle";
}

function assertNever(value: never): never {
  throw new Error(`Unsupported challenge type: ${JSON.stringify(value)}`);
}
