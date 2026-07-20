import { DEFAULT_ENGINE_TUNING } from "../config/tuning.js";
import type { BodyFrame, BodyJoint, DetectorSnapshot, EngineEvent } from "../types.js";
import { averageJointSpeed, bodyScale, clamp01, distance, visibleLandmark } from "./motion.js";
import {
  assertDetectorDelta,
  emptyDetectorSnapshot,
  type ChallengeDetector,
  type ChallengeOf,
  type DetectorContext,
} from "./types.js";

const STABILITY_JOINTS: readonly BodyJoint[] = [
  "left_shoulder", "right_shoulder", "left_hip", "right_hip", "left_ankle", "right_ankle",
];

export class BalanceDetector implements ChallengeDetector {
  readonly challengeType = "balance" as const;
  private readonly tuning;
  private readonly minimumConfidence: number;
  private readonly stillThreshold: number;
  private readonly poseThresholdMultiplier: number;
  private previous: BodyFrame | undefined;
  private holdMs = 0;
  private invalidMs = 0;
  private elapsedMs = 0;
  private active = false;
  private completed = false;
  private current: DetectorSnapshot;

  constructor(readonly challenge: ChallengeOf<"balance">, options: DetectorContext = {}) {
    this.tuning = options.tuning ?? DEFAULT_ENGINE_TUNING;
    const tier = this.tuning.tiers[options.tier ?? "A"];
    this.minimumConfidence = this.tuning.input.minimumLandmarkConfidence * tier.confidenceFloorMultiplier;
    this.stillThreshold = this.tuning.balance.stillVelocityPerSecond * tier.stillnessThresholdMultiplier;
    this.poseThresholdMultiplier = tier.motionThresholdMultiplier;
    this.current = emptyDetectorSnapshot(this.challengeType, challenge.holdMs);
  }

  update(frame: BodyFrame, deltaMs: number): DetectorSnapshot {
    assertDetectorDelta(deltaMs);
    if (this.completed) return this.snapshot();
    this.elapsedMs += deltaMs;
    const speed = averageJointSpeed(frame, this.previous, STABILITY_JOINTS, this.minimumConfidence);
    this.previous = frame;
    const valid = speed !== undefined && speed <= this.stillThreshold && this.poseMatches(frame);
    const events: EngineEvent[] = [];
    if (valid) {
      this.invalidMs = 0;
      if (!this.active) {
        this.active = true;
        events.push({ type: "hold-started", challengeType: this.challengeType, timestampMs: frame.timestampMs });
      }
      this.holdMs += deltaMs;
    } else if (this.active) {
      this.invalidMs += deltaMs;
      if (this.invalidMs > this.tuning.balance.movementGraceMs) {
        this.active = false;
        this.holdMs = 0;
        this.invalidMs = 0;
        events.push({ type: "hold-lost", challengeType: this.challengeType, timestampMs: frame.timestampMs });
      }
    }
    this.completed = this.holdMs + Number.EPSILON >= this.challenge.holdMs;
    if (this.completed) {
      this.holdMs = this.challenge.holdMs;
      events.push({ type: "challenge-completed", challengeType: this.challengeType, timestampMs: frame.timestampMs });
    }
    this.current = {
      challengeType: this.challengeType,
      elapsedMs: this.elapsedMs,
      progress: clamp01(this.holdMs / this.challenge.holdMs),
      count: Math.round(this.holdMs),
      targetCount: this.challenge.holdMs,
      active: this.active,
      completed: this.completed,
      confidence: speed === undefined ? 0 : frame.confidence,
      events,
    };
    return this.current;
  }

  snapshot(): DetectorSnapshot { return { ...this.current, events: [] }; }

  reset(): void {
    this.previous = undefined;
    this.holdMs = 0;
    this.invalidMs = 0;
    this.elapsedMs = 0;
    this.active = false;
    this.completed = false;
    this.current = emptyDetectorSnapshot(this.challengeType, this.challenge.holdMs);
  }

  private poseMatches(frame: BodyFrame): boolean {
    const leftAnkle = visibleLandmark(frame, "left_ankle", this.minimumConfidence);
    const rightAnkle = visibleLandmark(frame, "right_ankle", this.minimumConfidence);
    if (leftAnkle === undefined || rightAnkle === undefined) return false;
    const scale = bodyScale(frame, this.minimumConfidence, 0.2);
    const oneLeg = Math.abs(leftAnkle.y - rightAnkle.y) >=
      this.tuning.balance.ankleLiftBodyRatio * scale * this.poseThresholdMultiplier;
    if (this.challenge.pose === "one-leg") return oneLeg;
    if (this.challenge.pose === "statue") return true;
    if (this.challenge.pose === "airplane") {
      const leftWrist = visibleLandmark(frame, "left_wrist", this.minimumConfidence);
      const rightWrist = visibleLandmark(frame, "right_wrist", this.minimumConfidence);
      return oneLeg && leftWrist !== undefined && rightWrist !== undefined &&
        distance(leftWrist, rightWrist) >= this.tuning.balance.airplaneWristBodyRatio * scale;
    }
    const leftHeel = visibleLandmark(frame, "left_heel", this.minimumConfidence);
    const rightHeel = visibleLandmark(frame, "right_heel", this.minimumConfidence);
    const leftToe = visibleLandmark(frame, "left_foot_index", this.minimumConfidence);
    const rightToe = visibleLandmark(frame, "right_foot_index", this.minimumConfidence);
    const tiptoe = this.tuning.balance.tiptoeHeelBodyRatio * scale * this.poseThresholdMultiplier;
    return leftHeel !== undefined && rightHeel !== undefined && leftToe !== undefined && rightToe !== undefined &&
      leftToe.y - leftHeel.y >= tiptoe && rightToe.y - rightHeel.y >= tiptoe;
  }
}
