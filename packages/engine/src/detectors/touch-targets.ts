import { DEFAULT_ENGINE_TUNING } from "../config/tuning.js";
import { GameSpace, type NormalizedBox } from "../core/game-space.js";
import {
  TargetDwellSystem,
  type LimbPoint,
  type TargetDefinition,
} from "../hit/target-dwell.js";
import type { BodyFrame, BodyJoint, DetectorSnapshot, EngineEvent } from "../types.js";
import { visibleLandmark, clamp01 } from "./motion.js";
import {
  assertDetectorDelta,
  emptyDetectorSnapshot,
  type ChallengeDetector,
  type ChallengeOf,
  type DetectorContext,
} from "./types.js";

export interface TouchTargetsDetectorOptions extends DetectorContext {
  readonly targets?: readonly TargetDefinition[];
}

export class TouchTargetsDetector implements ChallengeDetector {
  readonly challengeType = "touch_targets" as const;

  private readonly tuning;
  private readonly hitSystem: TargetDwellSystem;
  private readonly gameSpace: GameSpace;
  private elapsedMs = 0;
  private completed = false;
  private completionEmitted = false;
  private current: DetectorSnapshot;

  constructor(
    readonly challenge: ChallengeOf<"touch_targets">,
    options: TouchTargetsDetectorOptions = {},
  ) {
    this.tuning = options.tuning ?? DEFAULT_ENGINE_TUNING;
    const tolerance = this.tuning.tiers[options.tier ?? "A"];
    this.gameSpace = options.gameSpace ?? new GameSpace({
      width: 1,
      height: 1,
      reachBox: options.reachBox,
    });
    const targets = options.targets ?? createTargetLayout(
      challenge.count,
      challenge.zone,
      challenge.limb,
      challenge.dwellMs,
      challenge.targetScale * this.tuning.targets.baseRadius,
      options.reachBox,
      this.tuning.targets.edgePadding,
    );
    this.hitSystem = new TargetDwellSystem(targets, {
      exitRadiusMultiplier: this.tuning.targets.exitRadiusMultiplier,
      dropoutGraceMs: this.tuning.targets.dropoutGraceMs * tolerance.dropoutGraceMultiplier,
      minimumConfidence: this.tuning.input.minimumLandmarkConfidence * tolerance.confidenceFloorMultiplier,
      radiusMultiplier: tolerance.hitRadiusMultiplier,
    });
    this.current = emptyDetectorSnapshot(this.challengeType, challenge.count);
  }

  update(frame: BodyFrame, deltaMs: number): DetectorSnapshot {
    assertDetectorDelta(deltaMs);
    if (this.completed) return this.snapshot();
    this.elapsedMs += deltaMs;
    const result = this.hitSystem.update(this.limbPoints(frame), deltaMs, frame.timestampMs);
    const count = Math.min(this.challenge.count, result.hitCount);
    this.completed = count >= this.challenge.count;
    const events: EngineEvent[] = result.events.map((event) => ({
      ...event,
      challengeType: this.challengeType,
    }));
    if (this.completed && !this.completionEmitted) {
      this.completionEmitted = true;
      events.push({
        type: "challenge-completed",
        challengeType: this.challengeType,
        timestampMs: frame.timestampMs,
        value: count,
      });
    }
    this.current = {
      challengeType: this.challengeType,
      elapsedMs: this.elapsedMs,
      progress: clamp01(count / this.challenge.count),
      count,
      targetCount: this.challenge.count,
      active: result.targets.some((target) => target.inside),
      completed: this.completed,
      confidence: frame.confidence,
      events,
    };
    return this.current;
  }

  snapshot(): DetectorSnapshot {
    return { ...this.current, events: [] };
  }

  reset(): void {
    this.elapsedMs = 0;
    this.completed = false;
    this.completionEmitted = false;
    this.hitSystem.reset();
    this.current = emptyDetectorSnapshot(this.challengeType, this.challenge.count);
  }

  private limbPoints(frame: BodyFrame): LimbPoint[] {
    const tolerance = this.tuning.tiers.A;
    const minimum = this.tuning.input.minimumLandmarkConfidence * tolerance.confidenceFloorMultiplier;
    const configured: readonly [BodyJoint, "hand" | "foot", "left" | "right"][] = [
      ["left_wrist", "hand", "left"],
      ["right_wrist", "hand", "right"],
      ["left_foot_index", "foot", "left"],
      ["right_foot_index", "foot", "right"],
      ["left_ankle", "foot", "left"],
      ["right_ankle", "foot", "right"],
    ];
    const points: LimbPoint[] = [];
    for (const [joint, kind, side] of configured) {
      const landmark = visibleLandmark(frame, joint, minimum);
      if (landmark === undefined) continue;
      points.push({
        id: joint,
        kind,
        side,
        point: this.gameSpace.normalizedToStage(landmark),
        confidence: Math.min(landmark.visibility, landmark.presence),
      });
    }
    return points;
  }
}

export function createTargetLayout(
  count: number,
  zone: "upper" | "lower" | "full" | "reachable",
  limb: "hands" | "feet" | "any",
  dwellMs: number,
  radius: number,
  reachBox: NormalizedBox | undefined,
  padding: number,
): TargetDefinition[] {
  if (!Number.isInteger(count) || count < 1) throw new RangeError("count must be a positive integer");
  const box = zone === "reachable" && reachBox !== undefined
    ? reachBox
    : zone === "upper"
      ? { x0: padding, y0: padding, x1: 1 - padding, y1: 0.48 }
      : zone === "lower"
        ? { x0: padding, y0: 0.52, x1: 1 - padding, y1: 1 - padding }
        : { x0: padding, y0: padding, x1: 1 - padding, y1: 1 - padding };
  const columns = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);
  const targets: TargetDefinition[] = [];
  for (let index = 0; index < count; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = box.x0 + ((column + 0.5) / columns) * (box.x1 - box.x0);
    const y = box.y0 + ((row + 0.5) / rows) * (box.y1 - box.y0);
    targets.push({
      id: `target-${index + 1}`,
      center: { x: clamp01(x), y: clamp01(y) },
      radius,
      limb,
      dwellMs,
    });
  }
  return targets;
}
