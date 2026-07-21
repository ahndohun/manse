import type { EpisodePack, Scene } from "@manse/schema";
import type { CalibrationResult, DeviceTier, RuntimePoseFrame, RuntimeTarget } from "./types.js";
export interface RuntimeTuning {
    readonly minimumLandmarkConfidence: number;
    readonly baseTargetRadius: number;
    readonly passiveSceneDurationMs: number;
    readonly restSceneDurationMs: number;
    readonly celebrationDurationMs: number;
    readonly maximumPoseDeltaMs: number;
}
export declare const DEFAULT_RUNTIME_TUNING: RuntimeTuning;
export type TouchRuntimeEvent = {
    readonly type: "target-hit";
    readonly sceneId: string;
    readonly targetId: string;
    readonly feedbackLatencyMs: number;
} | {
    readonly type: "audio-cue";
    readonly sceneId: string;
    readonly assetId: string;
    readonly purpose: "success" | "encourage";
} | {
    readonly type: "scene-changed";
    readonly sceneId: string;
} | {
    readonly type: "complete";
    readonly sceneId: string;
};
export interface SessionSnapshot {
    readonly status: "idle" | "playing" | "celebrating" | "complete";
    readonly scene: Scene;
    readonly targets: readonly RuntimeTarget[];
    readonly caption: string | null;
    readonly celebrationProgress: number;
    readonly poseRequired: boolean;
    readonly completedTargets: number;
    readonly totalTargets: number;
}
export declare class TouchEpisodeSession {
    private readonly pack;
    private readonly scenes;
    private readonly tuning;
    private readonly locale;
    private readonly tier;
    private readonly onEvent;
    private currentScene;
    private statusValue;
    private sceneStartedAtMs;
    private celebrationStartedAtMs;
    private lastPoseTimestampMs;
    private targets;
    private reachBox;
    private runtimeChallenge;
    private pendingAdaptation;
    constructor(pack: EpisodePack, options: {
        readonly locale: string;
        readonly tier: DeviceTier;
        readonly tuning?: RuntimeTuning;
        readonly onEvent?: (event: TouchRuntimeEvent) => void;
    });
    setCalibration(result: CalibrationResult): void;
    start(timestampMs: number): void;
    updatePose(frame: RuntimePoseFrame): void;
    tick(timestampMs: number): void;
    getSnapshot(timestampMs: number): SessionSnapshot;
    private enterScene;
    private followTransition;
    private complete;
}
//# sourceMappingURL=session.d.ts.map