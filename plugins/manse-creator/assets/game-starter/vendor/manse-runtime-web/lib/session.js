import { TIER_PROFILES } from "./config.js";
export const DEFAULT_RUNTIME_TUNING = {
    minimumLandmarkConfidence: 0.45,
    baseTargetRadius: 0.078,
    passiveSceneDurationMs: 2_500,
    restSceneDurationMs: 2_000,
    celebrationDurationMs: 1_500,
    maximumPoseDeltaMs: 120,
};
const IDENTITY_ADAPTATION = {
    targetScaleMul: 1,
    dwellMsMul: 1,
    countDelta: 0,
    timeBudgetMul: 1,
};
const DEFAULT_REACH_BOX = {
    x0: 0.16,
    y0: 0.16,
    x1: 0.84,
    y1: 0.9,
};
export class TouchEpisodeSession {
    pack;
    scenes;
    tuning;
    locale;
    tier;
    onEvent;
    currentScene;
    statusValue = "idle";
    sceneStartedAtMs = 0;
    celebrationStartedAtMs = 0;
    lastPoseTimestampMs = null;
    targets = [];
    reachBox = DEFAULT_REACH_BOX;
    runtimeChallenge = null;
    pendingAdaptation = IDENTITY_ADAPTATION;
    constructor(pack, options) {
        this.pack = pack;
        this.scenes = new Map(pack.scenes.map((scene) => [scene.id, scene]));
        const entry = this.scenes.get(pack.entrySceneId);
        if (entry === undefined)
            throw new Error(`Entry scene '${pack.entrySceneId}' does not exist.`);
        this.currentScene = entry;
        this.locale = options.locale;
        this.tier = options.tier;
        this.tuning = options.tuning ?? DEFAULT_RUNTIME_TUNING;
        this.onEvent = options.onEvent ?? (() => undefined);
    }
    setCalibration(result) {
        this.reachBox = result.reachBox;
    }
    start(timestampMs) {
        if (this.statusValue === "complete")
            return;
        if (this.statusValue === "idle")
            this.enterScene(this.currentScene, timestampMs);
        this.statusValue = "playing";
    }
    updatePose(frame) {
        if (this.statusValue !== "playing" || this.runtimeChallenge === null)
            return;
        const deltaMs = this.lastPoseTimestampMs === null
            ? 0
            : Math.min(this.tuning.maximumPoseDeltaMs, Math.max(0, frame.timestampMs - this.lastPoseTimestampMs));
        this.lastPoseTimestampMs = frame.timestampMs;
        const challenge = this.runtimeChallenge;
        const points = getChallengePoints(frame, challenge.limb, this.tuning.minimumLandmarkConfidence);
        const dwellGoal = challenge.dwellMs * TIER_PROFILES[this.tier].dwellScale;
        for (const target of this.targets) {
            if (target.hit)
                continue;
            const touching = points.some((point) => distanceSquared(point.x, point.y, target.x, target.y) <= target.radius ** 2);
            target.dwellMs = touching ? target.dwellMs + (dwellGoal === 0 ? 1 : deltaMs) : 0;
            if (target.dwellMs >= Math.max(1, dwellGoal)) {
                target.hit = true;
                const feedbackLatencyMs = Math.max(0, performanceNow() - frame.timestampMs);
                this.onEvent({
                    type: "target-hit",
                    sceneId: this.currentScene.id,
                    targetId: target.id,
                    feedbackLatencyMs,
                });
            }
            // One target per limb sample makes overlapping target layouts deterministic.
            if (target.hit)
                break;
        }
        if (this.targets.length > 0 && this.targets.every((target) => target.hit)) {
            this.onEvent({
                type: "audio-cue",
                sceneId: this.currentScene.id,
                assetId: challenge.successAudioId,
                purpose: "success",
            });
            this.statusValue = "celebrating";
            this.celebrationStartedAtMs = frame.timestampMs;
        }
    }
    tick(timestampMs) {
        if (this.statusValue === "idle" || this.statusValue === "complete")
            return;
        if (this.statusValue === "celebrating") {
            if (timestampMs - this.celebrationStartedAtMs >= this.tuning.celebrationDurationMs) {
                this.followTransition("success", timestampMs);
            }
            return;
        }
        if (this.currentScene.terminal) {
            const duration = this.currentScene.kind === "celebration"
                ? this.tuning.celebrationDurationMs
                : this.tuning.passiveSceneDurationMs;
            if (timestampMs - this.sceneStartedAtMs >= duration)
                this.complete();
            return;
        }
        if (this.currentScene.challenge === null) {
            const duration = this.currentScene.kind === "rest"
                ? this.tuning.restSceneDurationMs
                : this.tuning.passiveSceneDurationMs;
            if (timestampMs - this.sceneStartedAtMs >= duration)
                this.followTransition("always", timestampMs);
            return;
        }
        const challenge = this.runtimeChallenge;
        if (challenge === null)
            throw new Error(`Scene '${this.currentScene.id}' has no executable challenge state.`);
        if (timestampMs - this.sceneStartedAtMs >= challenge.timeBudgetMs) {
            this.onEvent({
                type: "audio-cue",
                sceneId: this.currentScene.id,
                assetId: challenge.encourageAudioId,
                purpose: "encourage",
            });
            this.followTransition("struggle", timestampMs);
        }
    }
    getSnapshot(timestampMs) {
        const challenge = this.runtimeChallenge;
        const dwellGoal = challenge !== null
            ? Math.max(1, challenge.dwellMs * TIER_PROFILES[this.tier].dwellScale)
            : 1;
        return {
            status: this.statusValue,
            scene: this.currentScene,
            targets: this.targets.map((target) => ({
                id: target.id,
                x: target.x,
                y: target.y,
                radius: target.radius,
                dwellProgress: target.hit ? 1 : Math.min(1, target.dwellMs / dwellGoal),
                hit: target.hit,
                color: target.color,
            })),
            caption: selectCaption(this.currentScene, this.locale),
            celebrationProgress: this.statusValue === "celebrating"
                ? Math.min(1, Math.max(0, (timestampMs - this.celebrationStartedAtMs) / this.tuning.celebrationDurationMs))
                : this.currentScene.kind === "celebration"
                    ? Math.min(1, Math.max(0, (timestampMs - this.sceneStartedAtMs) / this.tuning.celebrationDurationMs))
                    : 0,
            poseRequired: this.statusValue === "playing" && this.currentScene.challenge !== null,
            completedTargets: this.targets.filter((target) => target.hit).length,
            totalTargets: this.targets.length,
        };
    }
    enterScene(scene, timestampMs) {
        this.currentScene = scene;
        this.sceneStartedAtMs = timestampMs;
        this.lastPoseTimestampMs = null;
        this.statusValue = "playing";
        if (scene.challenge === null) {
            this.runtimeChallenge = null;
            this.targets = [];
        }
        else {
            this.runtimeChallenge = applyAdaptation(scene.challenge, this.pendingAdaptation);
            this.pendingAdaptation = IDENTITY_ADAPTATION;
            this.targets = createTargets(scene.id, this.runtimeChallenge.count, this.runtimeChallenge.zone, this.runtimeChallenge.targetScale * TIER_PROFILES[this.tier].targetScale, this.reachBox, this.tuning.baseTargetRadius);
        }
        this.onEvent({ type: "scene-changed", sceneId: scene.id });
    }
    followTransition(event, timestampMs) {
        if (this.currentScene.terminal) {
            this.complete();
            return;
        }
        const transition = this.currentScene.transitions.find((candidate) => candidate.on === event)
            ?? this.currentScene.transitions.find((candidate) => candidate.on === "always");
        if (transition === undefined) {
            throw new Error(`Scene '${this.currentScene.id}' has no '${event}' transition.`);
        }
        if (transition.adapt !== null) {
            this.pendingAdaptation = combineAdaptation(this.pendingAdaptation, transition.adapt);
        }
        const next = this.scenes.get(transition.to);
        if (next === undefined)
            throw new Error(`Transition target '${transition.to}' does not exist.`);
        this.enterScene(next, timestampMs);
    }
    complete() {
        if (this.statusValue === "complete")
            return;
        this.statusValue = "complete";
        this.onEvent({ type: "complete", sceneId: this.currentScene.id });
    }
}
function applyAdaptation(challenge, adaptation) {
    return {
        count: Math.round(clamp(challenge.count + adaptation.countDelta, 1, 12)),
        zone: challenge.zone,
        targetScale: clamp(challenge.targetScale * adaptation.targetScaleMul, 0.5, 2),
        dwellMs: Math.round(clamp(challenge.dwellMs * adaptation.dwellMsMul, 0, 1_500)),
        limb: challenge.limb,
        timeBudgetMs: Math.round(clamp(challenge.timeBudgetMs * adaptation.timeBudgetMul, 1, 300_000)),
        successAudioId: challenge.successAudioId,
        encourageAudioId: challenge.encourageAudioId,
    };
}
function combineAdaptation(current, next) {
    return {
        targetScaleMul: current.targetScaleMul * next.targetScaleMul,
        dwellMsMul: current.dwellMsMul * next.dwellMsMul,
        countDelta: current.countDelta + next.countDelta,
        timeBudgetMul: current.timeBudgetMul * next.timeBudgetMul,
    };
}
function createTargets(sceneId, count, zone, scale, reachBox, baseRadius) {
    const bounds = zoneBounds(zone, reachBox);
    const columns = Math.min(3, Math.ceil(Math.sqrt(count)));
    const rows = Math.ceil(count / columns);
    const palette = [
        [0.98, 0.35, 0.35, 1],
        [0.22, 0.72, 0.98, 1],
        [0.98, 0.76, 0.2, 1],
        [0.35, 0.86, 0.53, 1],
    ];
    const radius = Math.min(0.16, baseRadius * scale);
    return Array.from({ length: count }, (_, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const xRatio = columns === 1 ? 0.5 : (column + 0.5) / columns;
        const yRatio = rows === 1 ? 0.5 : (row + 0.5) / rows;
        const color = palette[index % palette.length] ?? palette[0] ?? [1, 1, 1, 1];
        return {
            id: `${sceneId}-target-${index + 1}`,
            x: mix(bounds.x0 + radius, bounds.x1 - radius, xRatio),
            y: mix(bounds.y0 + radius, bounds.y1 - radius, yRatio),
            radius,
            color,
            dwellMs: 0,
            hit: false,
        };
    });
}
function zoneBounds(zone, reachBox) {
    switch (zone) {
        case "upper": return { x0: reachBox.x0, y0: reachBox.y0, x1: reachBox.x1, y1: mix(reachBox.y0, reachBox.y1, 0.52) };
        case "lower": return { x0: reachBox.x0, y0: mix(reachBox.y0, reachBox.y1, 0.48), x1: reachBox.x1, y1: reachBox.y1 };
        case "full": return DEFAULT_REACH_BOX;
        case "reachable": return reachBox;
    }
}
function getChallengePoints(frame, limb, confidence) {
    const pose = frame.poses.reduce((best, candidate) => best === undefined || candidate.score > best.score ? candidate : best, undefined);
    if (pose === undefined)
        return [];
    const names = limb === "hands"
        ? new Set(["left_wrist", "right_wrist"])
        : limb === "feet"
            ? new Set(["left_ankle", "right_ankle"])
            : new Set(["left_wrist", "right_wrist", "left_ankle", "right_ankle"]);
    return pose.landmarks.filter((landmark) => names.has(landmark.name) && Math.min(landmark.visibility, landmark.presence) >= confidence);
}
function selectCaption(scene, locale) {
    const item = scene.narration.items.find((candidate) => candidate.locale === locale)
        ?? scene.narration.items[0];
    return item?.text ?? null;
}
function distanceSquared(x0, y0, x1, y1) {
    return (x0 - x1) ** 2 + (y0 - y1) ** 2;
}
function mix(a, b, t) {
    return a + (b - a) * t;
}
function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
}
function performanceNow() {
    return typeof performance === "undefined" ? Date.now() : performance.now();
}
//# sourceMappingURL=session.js.map