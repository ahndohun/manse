import { z } from "zod";
export declare const TouchTargetsSchema: z.ZodObject<{
    timeBudgetMs: z.ZodNumber;
    successAudioId: z.ZodString;
    encourageAudioId: z.ZodString;
    type: z.ZodLiteral<"touch_targets">;
    count: z.ZodNumber;
    zone: z.ZodEnum<["upper", "lower", "full", "reachable"]>;
    targetScale: z.ZodNumber;
    dwellMs: z.ZodNumber;
    limb: z.ZodEnum<["hands", "feet", "any"]>;
}, "strict", z.ZodTypeAny, {
    type: "touch_targets";
    count: number;
    zone: "upper" | "lower" | "full" | "reachable";
    targetScale: number;
    dwellMs: number;
    limb: "hands" | "feet" | "any";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
}, {
    type: "touch_targets";
    count: number;
    zone: "upper" | "lower" | "full" | "reachable";
    targetScale: number;
    dwellMs: number;
    limb: "hands" | "feet" | "any";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
}>;
export declare const JumpCountSchema: z.ZodObject<{
    timeBudgetMs: z.ZodNumber;
    successAudioId: z.ZodString;
    encourageAudioId: z.ZodString;
    type: z.ZodLiteral<"jump_count">;
    count: z.ZodNumber;
    countAloud: z.ZodBoolean;
}, "strict", z.ZodTypeAny, {
    type: "jump_count";
    count: number;
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    countAloud: boolean;
}, {
    type: "jump_count";
    count: number;
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    countAloud: boolean;
}>;
export declare const SquatSchema: z.ZodObject<{
    timeBudgetMs: z.ZodNumber;
    successAudioId: z.ZodString;
    encourageAudioId: z.ZodString;
    type: z.ZodLiteral<"squat">;
    reps: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    type: "squat";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    reps: number;
}, {
    type: "squat";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    reps: number;
}>;
export declare const FreezeSchema: z.ZodObject<{
    timeBudgetMs: z.ZodNumber;
    successAudioId: z.ZodString;
    encourageAudioId: z.ZodString;
    type: z.ZodLiteral<"freeze">;
    holdMs: z.ZodNumber;
    cue: z.ZodEnum<["music-stop", "narration", "visual"]>;
}, "strict", z.ZodTypeAny, {
    type: "freeze";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    holdMs: number;
    cue: "music-stop" | "narration" | "visual";
}, {
    type: "freeze";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    holdMs: number;
    cue: "music-stop" | "narration" | "visual";
}>;
export declare const RunInPlaceSchema: z.ZodObject<{
    timeBudgetMs: z.ZodNumber;
    successAudioId: z.ZodString;
    encourageAudioId: z.ZodString;
    type: z.ZodLiteral<"run_in_place">;
    durationMs: z.ZodNumber;
    intensity: z.ZodEnum<["stroll", "jog", "sprint"]>;
}, "strict", z.ZodTypeAny, {
    type: "run_in_place";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    durationMs: number;
    intensity: "stroll" | "jog" | "sprint";
}, {
    type: "run_in_place";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    durationMs: number;
    intensity: "stroll" | "jog" | "sprint";
}>;
export declare const BalanceSchema: z.ZodObject<{
    timeBudgetMs: z.ZodNumber;
    successAudioId: z.ZodString;
    encourageAudioId: z.ZodString;
    type: z.ZodLiteral<"balance">;
    pose: z.ZodEnum<["one-leg", "airplane", "tiptoe", "statue"]>;
    holdMs: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    type: "balance";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    holdMs: number;
    pose: "one-leg" | "airplane" | "tiptoe" | "statue";
}, {
    type: "balance";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    holdMs: number;
    pose: "one-leg" | "airplane" | "tiptoe" | "statue";
}>;
export declare const ChallengeSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    timeBudgetMs: z.ZodNumber;
    successAudioId: z.ZodString;
    encourageAudioId: z.ZodString;
    type: z.ZodLiteral<"touch_targets">;
    count: z.ZodNumber;
    zone: z.ZodEnum<["upper", "lower", "full", "reachable"]>;
    targetScale: z.ZodNumber;
    dwellMs: z.ZodNumber;
    limb: z.ZodEnum<["hands", "feet", "any"]>;
}, "strict", z.ZodTypeAny, {
    type: "touch_targets";
    count: number;
    zone: "upper" | "lower" | "full" | "reachable";
    targetScale: number;
    dwellMs: number;
    limb: "hands" | "feet" | "any";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
}, {
    type: "touch_targets";
    count: number;
    zone: "upper" | "lower" | "full" | "reachable";
    targetScale: number;
    dwellMs: number;
    limb: "hands" | "feet" | "any";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
}>, z.ZodObject<{
    timeBudgetMs: z.ZodNumber;
    successAudioId: z.ZodString;
    encourageAudioId: z.ZodString;
    type: z.ZodLiteral<"jump_count">;
    count: z.ZodNumber;
    countAloud: z.ZodBoolean;
}, "strict", z.ZodTypeAny, {
    type: "jump_count";
    count: number;
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    countAloud: boolean;
}, {
    type: "jump_count";
    count: number;
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    countAloud: boolean;
}>, z.ZodObject<{
    timeBudgetMs: z.ZodNumber;
    successAudioId: z.ZodString;
    encourageAudioId: z.ZodString;
    type: z.ZodLiteral<"squat">;
    reps: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    type: "squat";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    reps: number;
}, {
    type: "squat";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    reps: number;
}>, z.ZodObject<{
    timeBudgetMs: z.ZodNumber;
    successAudioId: z.ZodString;
    encourageAudioId: z.ZodString;
    type: z.ZodLiteral<"freeze">;
    holdMs: z.ZodNumber;
    cue: z.ZodEnum<["music-stop", "narration", "visual"]>;
}, "strict", z.ZodTypeAny, {
    type: "freeze";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    holdMs: number;
    cue: "music-stop" | "narration" | "visual";
}, {
    type: "freeze";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    holdMs: number;
    cue: "music-stop" | "narration" | "visual";
}>, z.ZodObject<{
    timeBudgetMs: z.ZodNumber;
    successAudioId: z.ZodString;
    encourageAudioId: z.ZodString;
    type: z.ZodLiteral<"run_in_place">;
    durationMs: z.ZodNumber;
    intensity: z.ZodEnum<["stroll", "jog", "sprint"]>;
}, "strict", z.ZodTypeAny, {
    type: "run_in_place";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    durationMs: number;
    intensity: "stroll" | "jog" | "sprint";
}, {
    type: "run_in_place";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    durationMs: number;
    intensity: "stroll" | "jog" | "sprint";
}>, z.ZodObject<{
    timeBudgetMs: z.ZodNumber;
    successAudioId: z.ZodString;
    encourageAudioId: z.ZodString;
    type: z.ZodLiteral<"balance">;
    pose: z.ZodEnum<["one-leg", "airplane", "tiptoe", "statue"]>;
    holdMs: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    type: "balance";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    holdMs: number;
    pose: "one-leg" | "airplane" | "tiptoe" | "statue";
}, {
    type: "balance";
    timeBudgetMs: number;
    successAudioId: string;
    encourageAudioId: string;
    holdMs: number;
    pose: "one-leg" | "airplane" | "tiptoe" | "statue";
}>]>;
export type Challenge = z.infer<typeof ChallengeSchema>;
export declare const LearningMomentSchema: z.ZodObject<{
    kind: z.ZodEnum<["counting", "colors", "letters", "body-parts", "directions", "animals", "none"]>;
    payload: z.ZodArray<z.ZodString, "many">;
}, "strict", z.ZodTypeAny, {
    kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
    payload: string[];
}, {
    kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
    payload: string[];
}>;
export type LearningMoment = z.infer<typeof LearningMomentSchema>;
export declare const NarrationItemSchema: z.ZodObject<{
    locale: z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>;
    text: z.ZodString;
    audioAssetId: z.ZodNullable<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
    text: string;
    audioAssetId: string | null;
}, {
    locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
    text: string;
    audioAssetId: string | null;
}>;
export type NarrationItem = z.infer<typeof NarrationItemSchema>;
export declare const NarrationSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        locale: z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>;
        text: z.ZodString;
        audioAssetId: z.ZodNullable<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
        text: string;
        audioAssetId: string | null;
    }, {
        locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
        text: string;
        audioAssetId: string | null;
    }>, "many">;
    captionDefaultOn: z.ZodLiteral<true>;
}, "strict", z.ZodTypeAny, {
    items: {
        locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
        text: string;
        audioAssetId: string | null;
    }[];
    captionDefaultOn: true;
}, {
    items: {
        locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
        text: string;
        audioAssetId: string | null;
    }[];
    captionDefaultOn: true;
}>;
export type Narration = z.infer<typeof NarrationSchema>;
export declare const OutcomeSchema: z.ZodEnum<["success", "partial", "struggle"]>;
export type Outcome = z.infer<typeof OutcomeSchema>;
export declare const ParamDeltaSchema: z.ZodObject<{
    targetScaleMul: z.ZodNumber;
    dwellMsMul: z.ZodNumber;
    countDelta: z.ZodNumber;
    timeBudgetMul: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    targetScaleMul: number;
    dwellMsMul: number;
    countDelta: number;
    timeBudgetMul: number;
}, {
    targetScaleMul: number;
    dwellMsMul: number;
    countDelta: number;
    timeBudgetMul: number;
}>;
export type ParamDelta = z.infer<typeof ParamDeltaSchema>;
export declare const TransitionEventSchema: z.ZodUnion<[z.ZodEnum<["success", "partial", "struggle"]>, z.ZodLiteral<"always">]>;
export type TransitionEvent = z.infer<typeof TransitionEventSchema>;
export declare const TransitionSchema: z.ZodObject<{
    on: z.ZodUnion<[z.ZodEnum<["success", "partial", "struggle"]>, z.ZodLiteral<"always">]>;
    to: z.ZodString;
    adapt: z.ZodNullable<z.ZodObject<{
        targetScaleMul: z.ZodNumber;
        dwellMsMul: z.ZodNumber;
        countDelta: z.ZodNumber;
        timeBudgetMul: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        targetScaleMul: number;
        dwellMsMul: number;
        countDelta: number;
        timeBudgetMul: number;
    }, {
        targetScaleMul: number;
        dwellMsMul: number;
        countDelta: number;
        timeBudgetMul: number;
    }>>;
}, "strict", z.ZodTypeAny, {
    on: "success" | "partial" | "struggle" | "always";
    to: string;
    adapt: {
        targetScaleMul: number;
        dwellMsMul: number;
        countDelta: number;
        timeBudgetMul: number;
    } | null;
}, {
    on: "success" | "partial" | "struggle" | "always";
    to: string;
    adapt: {
        targetScaleMul: number;
        dwellMsMul: number;
        countDelta: number;
        timeBudgetMul: number;
    } | null;
}>;
export type Transition = z.infer<typeof TransitionSchema>;
export declare const NonTerminalSceneSchema: z.ZodObject<{
    terminal: z.ZodLiteral<false>;
    transitions: z.ZodArray<z.ZodObject<{
        on: z.ZodUnion<[z.ZodEnum<["success", "partial", "struggle"]>, z.ZodLiteral<"always">]>;
        to: z.ZodString;
        adapt: z.ZodNullable<z.ZodObject<{
            targetScaleMul: z.ZodNumber;
            dwellMsMul: z.ZodNumber;
            countDelta: z.ZodNumber;
            timeBudgetMul: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        }, {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        }>>;
    }, "strict", z.ZodTypeAny, {
        on: "success" | "partial" | "struggle" | "always";
        to: string;
        adapt: {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        } | null;
    }, {
        on: "success" | "partial" | "struggle" | "always";
        to: string;
        adapt: {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        } | null;
    }>, "many">;
    id: z.ZodString;
    kind: z.ZodEnum<["story", "calibration-check", "challenge", "rest", "celebration"]>;
    narration: z.ZodObject<{
        items: z.ZodArray<z.ZodObject<{
            locale: z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>;
            text: z.ZodString;
            audioAssetId: z.ZodNullable<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }>, "many">;
        captionDefaultOn: z.ZodLiteral<true>;
    }, "strict", z.ZodTypeAny, {
        items: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }[];
        captionDefaultOn: true;
    }, {
        items: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }[];
        captionDefaultOn: true;
    }>;
    demo: z.ZodNullable<z.ZodObject<{
        characterId: z.ZodString;
        animation: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        characterId: string;
        animation: string;
    }, {
        characterId: string;
        animation: string;
    }>>;
    challenge: z.ZodNullable<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"touch_targets">;
        count: z.ZodNumber;
        zone: z.ZodEnum<["upper", "lower", "full", "reachable"]>;
        targetScale: z.ZodNumber;
        dwellMs: z.ZodNumber;
        limb: z.ZodEnum<["hands", "feet", "any"]>;
    }, "strict", z.ZodTypeAny, {
        type: "touch_targets";
        count: number;
        zone: "upper" | "lower" | "full" | "reachable";
        targetScale: number;
        dwellMs: number;
        limb: "hands" | "feet" | "any";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
    }, {
        type: "touch_targets";
        count: number;
        zone: "upper" | "lower" | "full" | "reachable";
        targetScale: number;
        dwellMs: number;
        limb: "hands" | "feet" | "any";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"jump_count">;
        count: z.ZodNumber;
        countAloud: z.ZodBoolean;
    }, "strict", z.ZodTypeAny, {
        type: "jump_count";
        count: number;
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        countAloud: boolean;
    }, {
        type: "jump_count";
        count: number;
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        countAloud: boolean;
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"squat">;
        reps: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        type: "squat";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        reps: number;
    }, {
        type: "squat";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        reps: number;
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"freeze">;
        holdMs: z.ZodNumber;
        cue: z.ZodEnum<["music-stop", "narration", "visual"]>;
    }, "strict", z.ZodTypeAny, {
        type: "freeze";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        cue: "music-stop" | "narration" | "visual";
    }, {
        type: "freeze";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        cue: "music-stop" | "narration" | "visual";
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"run_in_place">;
        durationMs: z.ZodNumber;
        intensity: z.ZodEnum<["stroll", "jog", "sprint"]>;
    }, "strict", z.ZodTypeAny, {
        type: "run_in_place";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        durationMs: number;
        intensity: "stroll" | "jog" | "sprint";
    }, {
        type: "run_in_place";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        durationMs: number;
        intensity: "stroll" | "jog" | "sprint";
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"balance">;
        pose: z.ZodEnum<["one-leg", "airplane", "tiptoe", "statue"]>;
        holdMs: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        type: "balance";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        pose: "one-leg" | "airplane" | "tiptoe" | "statue";
    }, {
        type: "balance";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        pose: "one-leg" | "airplane" | "tiptoe" | "statue";
    }>]>>;
    learning: z.ZodNullable<z.ZodObject<{
        kind: z.ZodEnum<["counting", "colors", "letters", "body-parts", "directions", "animals", "none"]>;
        payload: z.ZodArray<z.ZodString, "many">;
    }, "strict", z.ZodTypeAny, {
        kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
        payload: string[];
    }, {
        kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
        payload: string[];
    }>>;
    artAssetId: z.ZodNullable<z.ZodString>;
    energy: z.ZodEnum<["calm", "medium", "high"]>;
}, "strict", z.ZodTypeAny, {
    kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
    id: string;
    energy: "calm" | "medium" | "high";
    narration: {
        items: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }[];
        captionDefaultOn: true;
    };
    challenge: {
        type: "touch_targets";
        count: number;
        zone: "upper" | "lower" | "full" | "reachable";
        targetScale: number;
        dwellMs: number;
        limb: "hands" | "feet" | "any";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
    } | {
        type: "jump_count";
        count: number;
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        countAloud: boolean;
    } | {
        type: "squat";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        reps: number;
    } | {
        type: "freeze";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        cue: "music-stop" | "narration" | "visual";
    } | {
        type: "run_in_place";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        durationMs: number;
        intensity: "stroll" | "jog" | "sprint";
    } | {
        type: "balance";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        pose: "one-leg" | "airplane" | "tiptoe" | "statue";
    } | null;
    terminal: false;
    transitions: {
        on: "success" | "partial" | "struggle" | "always";
        to: string;
        adapt: {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        } | null;
    }[];
    demo: {
        characterId: string;
        animation: string;
    } | null;
    learning: {
        kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
        payload: string[];
    } | null;
    artAssetId: string | null;
}, {
    kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
    id: string;
    energy: "calm" | "medium" | "high";
    narration: {
        items: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }[];
        captionDefaultOn: true;
    };
    challenge: {
        type: "touch_targets";
        count: number;
        zone: "upper" | "lower" | "full" | "reachable";
        targetScale: number;
        dwellMs: number;
        limb: "hands" | "feet" | "any";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
    } | {
        type: "jump_count";
        count: number;
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        countAloud: boolean;
    } | {
        type: "squat";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        reps: number;
    } | {
        type: "freeze";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        cue: "music-stop" | "narration" | "visual";
    } | {
        type: "run_in_place";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        durationMs: number;
        intensity: "stroll" | "jog" | "sprint";
    } | {
        type: "balance";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        pose: "one-leg" | "airplane" | "tiptoe" | "statue";
    } | null;
    terminal: false;
    transitions: {
        on: "success" | "partial" | "struggle" | "always";
        to: string;
        adapt: {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        } | null;
    }[];
    demo: {
        characterId: string;
        animation: string;
    } | null;
    learning: {
        kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
        payload: string[];
    } | null;
    artAssetId: string | null;
}>;
export type NonTerminalScene = z.infer<typeof NonTerminalSceneSchema>;
export declare const TerminalSceneSchema: z.ZodObject<{
    terminal: z.ZodLiteral<true>;
    transitions: z.ZodArray<z.ZodObject<{
        on: z.ZodUnion<[z.ZodEnum<["success", "partial", "struggle"]>, z.ZodLiteral<"always">]>;
        to: z.ZodString;
        adapt: z.ZodNullable<z.ZodObject<{
            targetScaleMul: z.ZodNumber;
            dwellMsMul: z.ZodNumber;
            countDelta: z.ZodNumber;
            timeBudgetMul: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        }, {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        }>>;
    }, "strict", z.ZodTypeAny, {
        on: "success" | "partial" | "struggle" | "always";
        to: string;
        adapt: {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        } | null;
    }, {
        on: "success" | "partial" | "struggle" | "always";
        to: string;
        adapt: {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        } | null;
    }>, "many">;
    id: z.ZodString;
    kind: z.ZodEnum<["story", "calibration-check", "challenge", "rest", "celebration"]>;
    narration: z.ZodObject<{
        items: z.ZodArray<z.ZodObject<{
            locale: z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>;
            text: z.ZodString;
            audioAssetId: z.ZodNullable<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }>, "many">;
        captionDefaultOn: z.ZodLiteral<true>;
    }, "strict", z.ZodTypeAny, {
        items: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }[];
        captionDefaultOn: true;
    }, {
        items: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }[];
        captionDefaultOn: true;
    }>;
    demo: z.ZodNullable<z.ZodObject<{
        characterId: z.ZodString;
        animation: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        characterId: string;
        animation: string;
    }, {
        characterId: string;
        animation: string;
    }>>;
    challenge: z.ZodNullable<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"touch_targets">;
        count: z.ZodNumber;
        zone: z.ZodEnum<["upper", "lower", "full", "reachable"]>;
        targetScale: z.ZodNumber;
        dwellMs: z.ZodNumber;
        limb: z.ZodEnum<["hands", "feet", "any"]>;
    }, "strict", z.ZodTypeAny, {
        type: "touch_targets";
        count: number;
        zone: "upper" | "lower" | "full" | "reachable";
        targetScale: number;
        dwellMs: number;
        limb: "hands" | "feet" | "any";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
    }, {
        type: "touch_targets";
        count: number;
        zone: "upper" | "lower" | "full" | "reachable";
        targetScale: number;
        dwellMs: number;
        limb: "hands" | "feet" | "any";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"jump_count">;
        count: z.ZodNumber;
        countAloud: z.ZodBoolean;
    }, "strict", z.ZodTypeAny, {
        type: "jump_count";
        count: number;
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        countAloud: boolean;
    }, {
        type: "jump_count";
        count: number;
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        countAloud: boolean;
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"squat">;
        reps: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        type: "squat";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        reps: number;
    }, {
        type: "squat";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        reps: number;
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"freeze">;
        holdMs: z.ZodNumber;
        cue: z.ZodEnum<["music-stop", "narration", "visual"]>;
    }, "strict", z.ZodTypeAny, {
        type: "freeze";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        cue: "music-stop" | "narration" | "visual";
    }, {
        type: "freeze";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        cue: "music-stop" | "narration" | "visual";
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"run_in_place">;
        durationMs: z.ZodNumber;
        intensity: z.ZodEnum<["stroll", "jog", "sprint"]>;
    }, "strict", z.ZodTypeAny, {
        type: "run_in_place";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        durationMs: number;
        intensity: "stroll" | "jog" | "sprint";
    }, {
        type: "run_in_place";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        durationMs: number;
        intensity: "stroll" | "jog" | "sprint";
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"balance">;
        pose: z.ZodEnum<["one-leg", "airplane", "tiptoe", "statue"]>;
        holdMs: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        type: "balance";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        pose: "one-leg" | "airplane" | "tiptoe" | "statue";
    }, {
        type: "balance";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        pose: "one-leg" | "airplane" | "tiptoe" | "statue";
    }>]>>;
    learning: z.ZodNullable<z.ZodObject<{
        kind: z.ZodEnum<["counting", "colors", "letters", "body-parts", "directions", "animals", "none"]>;
        payload: z.ZodArray<z.ZodString, "many">;
    }, "strict", z.ZodTypeAny, {
        kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
        payload: string[];
    }, {
        kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
        payload: string[];
    }>>;
    artAssetId: z.ZodNullable<z.ZodString>;
    energy: z.ZodEnum<["calm", "medium", "high"]>;
}, "strict", z.ZodTypeAny, {
    kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
    id: string;
    energy: "calm" | "medium" | "high";
    narration: {
        items: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }[];
        captionDefaultOn: true;
    };
    challenge: {
        type: "touch_targets";
        count: number;
        zone: "upper" | "lower" | "full" | "reachable";
        targetScale: number;
        dwellMs: number;
        limb: "hands" | "feet" | "any";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
    } | {
        type: "jump_count";
        count: number;
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        countAloud: boolean;
    } | {
        type: "squat";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        reps: number;
    } | {
        type: "freeze";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        cue: "music-stop" | "narration" | "visual";
    } | {
        type: "run_in_place";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        durationMs: number;
        intensity: "stroll" | "jog" | "sprint";
    } | {
        type: "balance";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        pose: "one-leg" | "airplane" | "tiptoe" | "statue";
    } | null;
    terminal: true;
    transitions: {
        on: "success" | "partial" | "struggle" | "always";
        to: string;
        adapt: {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        } | null;
    }[];
    demo: {
        characterId: string;
        animation: string;
    } | null;
    learning: {
        kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
        payload: string[];
    } | null;
    artAssetId: string | null;
}, {
    kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
    id: string;
    energy: "calm" | "medium" | "high";
    narration: {
        items: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }[];
        captionDefaultOn: true;
    };
    challenge: {
        type: "touch_targets";
        count: number;
        zone: "upper" | "lower" | "full" | "reachable";
        targetScale: number;
        dwellMs: number;
        limb: "hands" | "feet" | "any";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
    } | {
        type: "jump_count";
        count: number;
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        countAloud: boolean;
    } | {
        type: "squat";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        reps: number;
    } | {
        type: "freeze";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        cue: "music-stop" | "narration" | "visual";
    } | {
        type: "run_in_place";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        durationMs: number;
        intensity: "stroll" | "jog" | "sprint";
    } | {
        type: "balance";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        pose: "one-leg" | "airplane" | "tiptoe" | "statue";
    } | null;
    terminal: true;
    transitions: {
        on: "success" | "partial" | "struggle" | "always";
        to: string;
        adapt: {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        } | null;
    }[];
    demo: {
        characterId: string;
        animation: string;
    } | null;
    learning: {
        kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
        payload: string[];
    } | null;
    artAssetId: string | null;
}>;
export type TerminalScene = z.infer<typeof TerminalSceneSchema>;
export declare const SceneSchema: z.ZodDiscriminatedUnion<"terminal", [z.ZodObject<{
    terminal: z.ZodLiteral<false>;
    transitions: z.ZodArray<z.ZodObject<{
        on: z.ZodUnion<[z.ZodEnum<["success", "partial", "struggle"]>, z.ZodLiteral<"always">]>;
        to: z.ZodString;
        adapt: z.ZodNullable<z.ZodObject<{
            targetScaleMul: z.ZodNumber;
            dwellMsMul: z.ZodNumber;
            countDelta: z.ZodNumber;
            timeBudgetMul: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        }, {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        }>>;
    }, "strict", z.ZodTypeAny, {
        on: "success" | "partial" | "struggle" | "always";
        to: string;
        adapt: {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        } | null;
    }, {
        on: "success" | "partial" | "struggle" | "always";
        to: string;
        adapt: {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        } | null;
    }>, "many">;
    id: z.ZodString;
    kind: z.ZodEnum<["story", "calibration-check", "challenge", "rest", "celebration"]>;
    narration: z.ZodObject<{
        items: z.ZodArray<z.ZodObject<{
            locale: z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>;
            text: z.ZodString;
            audioAssetId: z.ZodNullable<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }>, "many">;
        captionDefaultOn: z.ZodLiteral<true>;
    }, "strict", z.ZodTypeAny, {
        items: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }[];
        captionDefaultOn: true;
    }, {
        items: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }[];
        captionDefaultOn: true;
    }>;
    demo: z.ZodNullable<z.ZodObject<{
        characterId: z.ZodString;
        animation: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        characterId: string;
        animation: string;
    }, {
        characterId: string;
        animation: string;
    }>>;
    challenge: z.ZodNullable<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"touch_targets">;
        count: z.ZodNumber;
        zone: z.ZodEnum<["upper", "lower", "full", "reachable"]>;
        targetScale: z.ZodNumber;
        dwellMs: z.ZodNumber;
        limb: z.ZodEnum<["hands", "feet", "any"]>;
    }, "strict", z.ZodTypeAny, {
        type: "touch_targets";
        count: number;
        zone: "upper" | "lower" | "full" | "reachable";
        targetScale: number;
        dwellMs: number;
        limb: "hands" | "feet" | "any";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
    }, {
        type: "touch_targets";
        count: number;
        zone: "upper" | "lower" | "full" | "reachable";
        targetScale: number;
        dwellMs: number;
        limb: "hands" | "feet" | "any";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"jump_count">;
        count: z.ZodNumber;
        countAloud: z.ZodBoolean;
    }, "strict", z.ZodTypeAny, {
        type: "jump_count";
        count: number;
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        countAloud: boolean;
    }, {
        type: "jump_count";
        count: number;
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        countAloud: boolean;
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"squat">;
        reps: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        type: "squat";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        reps: number;
    }, {
        type: "squat";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        reps: number;
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"freeze">;
        holdMs: z.ZodNumber;
        cue: z.ZodEnum<["music-stop", "narration", "visual"]>;
    }, "strict", z.ZodTypeAny, {
        type: "freeze";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        cue: "music-stop" | "narration" | "visual";
    }, {
        type: "freeze";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        cue: "music-stop" | "narration" | "visual";
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"run_in_place">;
        durationMs: z.ZodNumber;
        intensity: z.ZodEnum<["stroll", "jog", "sprint"]>;
    }, "strict", z.ZodTypeAny, {
        type: "run_in_place";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        durationMs: number;
        intensity: "stroll" | "jog" | "sprint";
    }, {
        type: "run_in_place";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        durationMs: number;
        intensity: "stroll" | "jog" | "sprint";
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"balance">;
        pose: z.ZodEnum<["one-leg", "airplane", "tiptoe", "statue"]>;
        holdMs: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        type: "balance";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        pose: "one-leg" | "airplane" | "tiptoe" | "statue";
    }, {
        type: "balance";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        pose: "one-leg" | "airplane" | "tiptoe" | "statue";
    }>]>>;
    learning: z.ZodNullable<z.ZodObject<{
        kind: z.ZodEnum<["counting", "colors", "letters", "body-parts", "directions", "animals", "none"]>;
        payload: z.ZodArray<z.ZodString, "many">;
    }, "strict", z.ZodTypeAny, {
        kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
        payload: string[];
    }, {
        kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
        payload: string[];
    }>>;
    artAssetId: z.ZodNullable<z.ZodString>;
    energy: z.ZodEnum<["calm", "medium", "high"]>;
}, "strict", z.ZodTypeAny, {
    kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
    id: string;
    energy: "calm" | "medium" | "high";
    narration: {
        items: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }[];
        captionDefaultOn: true;
    };
    challenge: {
        type: "touch_targets";
        count: number;
        zone: "upper" | "lower" | "full" | "reachable";
        targetScale: number;
        dwellMs: number;
        limb: "hands" | "feet" | "any";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
    } | {
        type: "jump_count";
        count: number;
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        countAloud: boolean;
    } | {
        type: "squat";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        reps: number;
    } | {
        type: "freeze";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        cue: "music-stop" | "narration" | "visual";
    } | {
        type: "run_in_place";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        durationMs: number;
        intensity: "stroll" | "jog" | "sprint";
    } | {
        type: "balance";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        pose: "one-leg" | "airplane" | "tiptoe" | "statue";
    } | null;
    terminal: false;
    transitions: {
        on: "success" | "partial" | "struggle" | "always";
        to: string;
        adapt: {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        } | null;
    }[];
    demo: {
        characterId: string;
        animation: string;
    } | null;
    learning: {
        kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
        payload: string[];
    } | null;
    artAssetId: string | null;
}, {
    kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
    id: string;
    energy: "calm" | "medium" | "high";
    narration: {
        items: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }[];
        captionDefaultOn: true;
    };
    challenge: {
        type: "touch_targets";
        count: number;
        zone: "upper" | "lower" | "full" | "reachable";
        targetScale: number;
        dwellMs: number;
        limb: "hands" | "feet" | "any";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
    } | {
        type: "jump_count";
        count: number;
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        countAloud: boolean;
    } | {
        type: "squat";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        reps: number;
    } | {
        type: "freeze";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        cue: "music-stop" | "narration" | "visual";
    } | {
        type: "run_in_place";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        durationMs: number;
        intensity: "stroll" | "jog" | "sprint";
    } | {
        type: "balance";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        pose: "one-leg" | "airplane" | "tiptoe" | "statue";
    } | null;
    terminal: false;
    transitions: {
        on: "success" | "partial" | "struggle" | "always";
        to: string;
        adapt: {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        } | null;
    }[];
    demo: {
        characterId: string;
        animation: string;
    } | null;
    learning: {
        kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
        payload: string[];
    } | null;
    artAssetId: string | null;
}>, z.ZodObject<{
    terminal: z.ZodLiteral<true>;
    transitions: z.ZodArray<z.ZodObject<{
        on: z.ZodUnion<[z.ZodEnum<["success", "partial", "struggle"]>, z.ZodLiteral<"always">]>;
        to: z.ZodString;
        adapt: z.ZodNullable<z.ZodObject<{
            targetScaleMul: z.ZodNumber;
            dwellMsMul: z.ZodNumber;
            countDelta: z.ZodNumber;
            timeBudgetMul: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        }, {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        }>>;
    }, "strict", z.ZodTypeAny, {
        on: "success" | "partial" | "struggle" | "always";
        to: string;
        adapt: {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        } | null;
    }, {
        on: "success" | "partial" | "struggle" | "always";
        to: string;
        adapt: {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        } | null;
    }>, "many">;
    id: z.ZodString;
    kind: z.ZodEnum<["story", "calibration-check", "challenge", "rest", "celebration"]>;
    narration: z.ZodObject<{
        items: z.ZodArray<z.ZodObject<{
            locale: z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>;
            text: z.ZodString;
            audioAssetId: z.ZodNullable<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }>, "many">;
        captionDefaultOn: z.ZodLiteral<true>;
    }, "strict", z.ZodTypeAny, {
        items: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }[];
        captionDefaultOn: true;
    }, {
        items: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }[];
        captionDefaultOn: true;
    }>;
    demo: z.ZodNullable<z.ZodObject<{
        characterId: z.ZodString;
        animation: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        characterId: string;
        animation: string;
    }, {
        characterId: string;
        animation: string;
    }>>;
    challenge: z.ZodNullable<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"touch_targets">;
        count: z.ZodNumber;
        zone: z.ZodEnum<["upper", "lower", "full", "reachable"]>;
        targetScale: z.ZodNumber;
        dwellMs: z.ZodNumber;
        limb: z.ZodEnum<["hands", "feet", "any"]>;
    }, "strict", z.ZodTypeAny, {
        type: "touch_targets";
        count: number;
        zone: "upper" | "lower" | "full" | "reachable";
        targetScale: number;
        dwellMs: number;
        limb: "hands" | "feet" | "any";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
    }, {
        type: "touch_targets";
        count: number;
        zone: "upper" | "lower" | "full" | "reachable";
        targetScale: number;
        dwellMs: number;
        limb: "hands" | "feet" | "any";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"jump_count">;
        count: z.ZodNumber;
        countAloud: z.ZodBoolean;
    }, "strict", z.ZodTypeAny, {
        type: "jump_count";
        count: number;
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        countAloud: boolean;
    }, {
        type: "jump_count";
        count: number;
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        countAloud: boolean;
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"squat">;
        reps: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        type: "squat";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        reps: number;
    }, {
        type: "squat";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        reps: number;
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"freeze">;
        holdMs: z.ZodNumber;
        cue: z.ZodEnum<["music-stop", "narration", "visual"]>;
    }, "strict", z.ZodTypeAny, {
        type: "freeze";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        cue: "music-stop" | "narration" | "visual";
    }, {
        type: "freeze";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        cue: "music-stop" | "narration" | "visual";
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"run_in_place">;
        durationMs: z.ZodNumber;
        intensity: z.ZodEnum<["stroll", "jog", "sprint"]>;
    }, "strict", z.ZodTypeAny, {
        type: "run_in_place";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        durationMs: number;
        intensity: "stroll" | "jog" | "sprint";
    }, {
        type: "run_in_place";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        durationMs: number;
        intensity: "stroll" | "jog" | "sprint";
    }>, z.ZodObject<{
        timeBudgetMs: z.ZodNumber;
        successAudioId: z.ZodString;
        encourageAudioId: z.ZodString;
        type: z.ZodLiteral<"balance">;
        pose: z.ZodEnum<["one-leg", "airplane", "tiptoe", "statue"]>;
        holdMs: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        type: "balance";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        pose: "one-leg" | "airplane" | "tiptoe" | "statue";
    }, {
        type: "balance";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        pose: "one-leg" | "airplane" | "tiptoe" | "statue";
    }>]>>;
    learning: z.ZodNullable<z.ZodObject<{
        kind: z.ZodEnum<["counting", "colors", "letters", "body-parts", "directions", "animals", "none"]>;
        payload: z.ZodArray<z.ZodString, "many">;
    }, "strict", z.ZodTypeAny, {
        kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
        payload: string[];
    }, {
        kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
        payload: string[];
    }>>;
    artAssetId: z.ZodNullable<z.ZodString>;
    energy: z.ZodEnum<["calm", "medium", "high"]>;
}, "strict", z.ZodTypeAny, {
    kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
    id: string;
    energy: "calm" | "medium" | "high";
    narration: {
        items: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }[];
        captionDefaultOn: true;
    };
    challenge: {
        type: "touch_targets";
        count: number;
        zone: "upper" | "lower" | "full" | "reachable";
        targetScale: number;
        dwellMs: number;
        limb: "hands" | "feet" | "any";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
    } | {
        type: "jump_count";
        count: number;
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        countAloud: boolean;
    } | {
        type: "squat";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        reps: number;
    } | {
        type: "freeze";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        cue: "music-stop" | "narration" | "visual";
    } | {
        type: "run_in_place";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        durationMs: number;
        intensity: "stroll" | "jog" | "sprint";
    } | {
        type: "balance";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        pose: "one-leg" | "airplane" | "tiptoe" | "statue";
    } | null;
    terminal: true;
    transitions: {
        on: "success" | "partial" | "struggle" | "always";
        to: string;
        adapt: {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        } | null;
    }[];
    demo: {
        characterId: string;
        animation: string;
    } | null;
    learning: {
        kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
        payload: string[];
    } | null;
    artAssetId: string | null;
}, {
    kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
    id: string;
    energy: "calm" | "medium" | "high";
    narration: {
        items: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
            audioAssetId: string | null;
        }[];
        captionDefaultOn: true;
    };
    challenge: {
        type: "touch_targets";
        count: number;
        zone: "upper" | "lower" | "full" | "reachable";
        targetScale: number;
        dwellMs: number;
        limb: "hands" | "feet" | "any";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
    } | {
        type: "jump_count";
        count: number;
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        countAloud: boolean;
    } | {
        type: "squat";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        reps: number;
    } | {
        type: "freeze";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        cue: "music-stop" | "narration" | "visual";
    } | {
        type: "run_in_place";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        durationMs: number;
        intensity: "stroll" | "jog" | "sprint";
    } | {
        type: "balance";
        timeBudgetMs: number;
        successAudioId: string;
        encourageAudioId: string;
        holdMs: number;
        pose: "one-leg" | "airplane" | "tiptoe" | "statue";
    } | null;
    terminal: true;
    transitions: {
        on: "success" | "partial" | "struggle" | "always";
        to: string;
        adapt: {
            targetScaleMul: number;
            dwellMsMul: number;
            countDelta: number;
            timeBudgetMul: number;
        } | null;
    }[];
    demo: {
        characterId: string;
        animation: string;
    } | null;
    learning: {
        kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
        payload: string[];
    } | null;
    artAssetId: string | null;
}>]>;
export type Scene = z.infer<typeof SceneSchema>;
export declare const AdaptPolicySchema: z.ZodObject<{
    targetSuccessBand: z.ZodEffects<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>, [number, number], [number, number]>;
    maxStruggleStreak: z.ZodNumber;
    maxHighEnergyMs: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    targetSuccessBand: [number, number];
    maxStruggleStreak: number;
    maxHighEnergyMs: number;
}, {
    targetSuccessBand: [number, number];
    maxStruggleStreak: number;
    maxHighEnergyMs: number;
}>;
export type AdaptPolicy = z.infer<typeof AdaptPolicySchema>;
export declare const EngineCompatibilitySchema: z.ZodObject<{
    minimumVersion: z.ZodString;
    maximumVersion: z.ZodNullable<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    minimumVersion: string;
    maximumVersion: string | null;
}, {
    minimumVersion: string;
    maximumVersion: string | null;
}>;
export type EngineCompatibility = z.infer<typeof EngineCompatibilitySchema>;
export declare const CompilerMetadataSchema: z.ZodObject<{
    model: z.ZodString;
    reasoningEffort: z.ZodString;
    generatedAt: z.ZodString;
}, "strict", z.ZodTypeAny, {
    model: string;
    generatedAt: string;
    reasoningEffort: string;
}, {
    model: string;
    generatedAt: string;
    reasoningEffort: string;
}>;
export type CompilerMetadata = z.infer<typeof CompilerMetadataSchema>;
export declare const EpisodePackBaseSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    meta: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodArray<z.ZodObject<{
            locale: z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>;
            text: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }>, "many">;
        summary: z.ZodArray<z.ZodObject<{
            locale: z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>;
            text: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }>, "many">;
        theme: z.ZodString;
        locales: z.ZodArray<z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>, "many">;
        ageBands: z.ZodArray<z.ZodEnum<["2-3", "4-5", "6-7", "8+"]>, "many">;
        estMinutes: z.ZodNumber;
        engine: z.ZodObject<{
            minimumVersion: z.ZodString;
            maximumVersion: z.ZodNullable<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            minimumVersion: string;
            maximumVersion: string | null;
        }, {
            minimumVersion: string;
            maximumVersion: string | null;
        }>;
        compiler: z.ZodNullable<z.ZodObject<{
            model: z.ZodString;
            reasoningEffort: z.ZodString;
            generatedAt: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            model: string;
            generatedAt: string;
            reasoningEffort: string;
        }, {
            model: string;
            generatedAt: string;
            reasoningEffort: string;
        }>>;
    }, "strict", z.ZodTypeAny, {
        id: string;
        title: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        summary: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        locales: ("en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar")[];
        theme: string;
        ageBands: ("2-3" | "4-5" | "6-7" | "8+")[];
        estMinutes: number;
        engine: {
            minimumVersion: string;
            maximumVersion: string | null;
        };
        compiler: {
            model: string;
            generatedAt: string;
            reasoningEffort: string;
        } | null;
    }, {
        id: string;
        title: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        summary: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        locales: ("en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar")[];
        theme: string;
        ageBands: ("2-3" | "4-5" | "6-7" | "8+")[];
        estMinutes: number;
        engine: {
            minimumVersion: string;
            maximumVersion: string | null;
        };
        compiler: {
            model: string;
            generatedAt: string;
            reasoningEffort: string;
        } | null;
    }>;
    permissions: z.ZodObject<{
        camera: z.ZodBoolean;
        deviceLocalStorage: z.ZodBoolean;
    }, "strict", z.ZodTypeAny, {
        camera: boolean;
        deviceLocalStorage: boolean;
    }, {
        camera: boolean;
        deviceLocalStorage: boolean;
    }>;
    cast: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodArray<z.ZodObject<{
            locale: z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>;
            text: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }>, "many">;
        artAssetId: z.ZodNullable<z.ZodString>;
        description: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        name: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        id: string;
        artAssetId: string | null;
        description: string;
    }, {
        name: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        id: string;
        artAssetId: string | null;
        description: string;
    }>, "many">;
    entrySceneId: z.ZodString;
    scenes: z.ZodArray<z.ZodDiscriminatedUnion<"terminal", [z.ZodObject<{
        terminal: z.ZodLiteral<false>;
        transitions: z.ZodArray<z.ZodObject<{
            on: z.ZodUnion<[z.ZodEnum<["success", "partial", "struggle"]>, z.ZodLiteral<"always">]>;
            to: z.ZodString;
            adapt: z.ZodNullable<z.ZodObject<{
                targetScaleMul: z.ZodNumber;
                dwellMsMul: z.ZodNumber;
                countDelta: z.ZodNumber;
                timeBudgetMul: z.ZodNumber;
            }, "strict", z.ZodTypeAny, {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            }, {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            }>>;
        }, "strict", z.ZodTypeAny, {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }, {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }>, "many">;
        id: z.ZodString;
        kind: z.ZodEnum<["story", "calibration-check", "challenge", "rest", "celebration"]>;
        narration: z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                locale: z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>;
                text: z.ZodString;
                audioAssetId: z.ZodNullable<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }, {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }>, "many">;
            captionDefaultOn: z.ZodLiteral<true>;
        }, "strict", z.ZodTypeAny, {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        }, {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        }>;
        demo: z.ZodNullable<z.ZodObject<{
            characterId: z.ZodString;
            animation: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            characterId: string;
            animation: string;
        }, {
            characterId: string;
            animation: string;
        }>>;
        challenge: z.ZodNullable<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"touch_targets">;
            count: z.ZodNumber;
            zone: z.ZodEnum<["upper", "lower", "full", "reachable"]>;
            targetScale: z.ZodNumber;
            dwellMs: z.ZodNumber;
            limb: z.ZodEnum<["hands", "feet", "any"]>;
        }, "strict", z.ZodTypeAny, {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        }, {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"jump_count">;
            count: z.ZodNumber;
            countAloud: z.ZodBoolean;
        }, "strict", z.ZodTypeAny, {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        }, {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"squat">;
            reps: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        }, {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"freeze">;
            holdMs: z.ZodNumber;
            cue: z.ZodEnum<["music-stop", "narration", "visual"]>;
        }, "strict", z.ZodTypeAny, {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        }, {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"run_in_place">;
            durationMs: z.ZodNumber;
            intensity: z.ZodEnum<["stroll", "jog", "sprint"]>;
        }, "strict", z.ZodTypeAny, {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        }, {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"balance">;
            pose: z.ZodEnum<["one-leg", "airplane", "tiptoe", "statue"]>;
            holdMs: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        }, {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        }>]>>;
        learning: z.ZodNullable<z.ZodObject<{
            kind: z.ZodEnum<["counting", "colors", "letters", "body-parts", "directions", "animals", "none"]>;
            payload: z.ZodArray<z.ZodString, "many">;
        }, "strict", z.ZodTypeAny, {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        }, {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        }>>;
        artAssetId: z.ZodNullable<z.ZodString>;
        energy: z.ZodEnum<["calm", "medium", "high"]>;
    }, "strict", z.ZodTypeAny, {
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: false;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    }, {
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: false;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    }>, z.ZodObject<{
        terminal: z.ZodLiteral<true>;
        transitions: z.ZodArray<z.ZodObject<{
            on: z.ZodUnion<[z.ZodEnum<["success", "partial", "struggle"]>, z.ZodLiteral<"always">]>;
            to: z.ZodString;
            adapt: z.ZodNullable<z.ZodObject<{
                targetScaleMul: z.ZodNumber;
                dwellMsMul: z.ZodNumber;
                countDelta: z.ZodNumber;
                timeBudgetMul: z.ZodNumber;
            }, "strict", z.ZodTypeAny, {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            }, {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            }>>;
        }, "strict", z.ZodTypeAny, {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }, {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }>, "many">;
        id: z.ZodString;
        kind: z.ZodEnum<["story", "calibration-check", "challenge", "rest", "celebration"]>;
        narration: z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                locale: z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>;
                text: z.ZodString;
                audioAssetId: z.ZodNullable<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }, {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }>, "many">;
            captionDefaultOn: z.ZodLiteral<true>;
        }, "strict", z.ZodTypeAny, {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        }, {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        }>;
        demo: z.ZodNullable<z.ZodObject<{
            characterId: z.ZodString;
            animation: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            characterId: string;
            animation: string;
        }, {
            characterId: string;
            animation: string;
        }>>;
        challenge: z.ZodNullable<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"touch_targets">;
            count: z.ZodNumber;
            zone: z.ZodEnum<["upper", "lower", "full", "reachable"]>;
            targetScale: z.ZodNumber;
            dwellMs: z.ZodNumber;
            limb: z.ZodEnum<["hands", "feet", "any"]>;
        }, "strict", z.ZodTypeAny, {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        }, {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"jump_count">;
            count: z.ZodNumber;
            countAloud: z.ZodBoolean;
        }, "strict", z.ZodTypeAny, {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        }, {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"squat">;
            reps: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        }, {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"freeze">;
            holdMs: z.ZodNumber;
            cue: z.ZodEnum<["music-stop", "narration", "visual"]>;
        }, "strict", z.ZodTypeAny, {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        }, {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"run_in_place">;
            durationMs: z.ZodNumber;
            intensity: z.ZodEnum<["stroll", "jog", "sprint"]>;
        }, "strict", z.ZodTypeAny, {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        }, {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"balance">;
            pose: z.ZodEnum<["one-leg", "airplane", "tiptoe", "statue"]>;
            holdMs: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        }, {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        }>]>>;
        learning: z.ZodNullable<z.ZodObject<{
            kind: z.ZodEnum<["counting", "colors", "letters", "body-parts", "directions", "animals", "none"]>;
            payload: z.ZodArray<z.ZodString, "many">;
        }, "strict", z.ZodTypeAny, {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        }, {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        }>>;
        artAssetId: z.ZodNullable<z.ZodString>;
        energy: z.ZodEnum<["calm", "medium", "high"]>;
    }, "strict", z.ZodTypeAny, {
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: true;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    }, {
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: true;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    }>]>, "many">;
    adaptPolicy: z.ZodObject<{
        targetSuccessBand: z.ZodEffects<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>, [number, number], [number, number]>;
        maxStruggleStreak: z.ZodNumber;
        maxHighEnergyMs: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        targetSuccessBand: [number, number];
        maxStruggleStreak: number;
        maxHighEnergyMs: number;
    }, {
        targetSuccessBand: [number, number];
        maxStruggleStreak: number;
        maxHighEnergyMs: number;
    }>;
    assets: z.ZodObject<{
        images: z.ZodArray<z.ZodObject<{
            license: z.ZodObject<{
                spdxId: z.ZodString;
                name: z.ZodString;
                url: z.ZodNullable<z.ZodEffects<z.ZodString, string, string>>;
                attribution: z.ZodNullable<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            }, {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            }>;
            provenance: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
                kind: z.ZodLiteral<"original">;
                creator: z.ZodString;
                createdAt: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                kind: "original";
                creator: string;
                createdAt: string;
            }, {
                kind: "original";
                creator: string;
                createdAt: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"generated">;
                tool: z.ZodString;
                model: z.ZodString;
                prompt: z.ZodString;
                generatedAt: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            }, {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"third-party">;
                creator: z.ZodString;
                sourceUrl: z.ZodEffects<z.ZodString, string, string>;
                retrievedAt: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            }, {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            }>]>;
            id: z.ZodString;
            path: z.ZodEffects<z.ZodString, string, string>;
            mediaType: z.ZodEnum<["image/png", "image/jpeg", "image/webp", "image/avif"]>;
            alt: z.ZodArray<z.ZodObject<{
                locale: z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>;
                text: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }, {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }>, "many">;
        }, "strict", z.ZodTypeAny, {
            path: string;
            id: string;
            mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
            alt: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
        }, {
            path: string;
            id: string;
            mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
            alt: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
        }>, "many">;
        audio: z.ZodArray<z.ZodObject<{
            license: z.ZodObject<{
                spdxId: z.ZodString;
                name: z.ZodString;
                url: z.ZodNullable<z.ZodEffects<z.ZodString, string, string>>;
                attribution: z.ZodNullable<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            }, {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            }>;
            provenance: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
                kind: z.ZodLiteral<"original">;
                creator: z.ZodString;
                createdAt: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                kind: "original";
                creator: string;
                createdAt: string;
            }, {
                kind: "original";
                creator: string;
                createdAt: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"generated">;
                tool: z.ZodString;
                model: z.ZodString;
                prompt: z.ZodString;
                generatedAt: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            }, {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"third-party">;
                creator: z.ZodString;
                sourceUrl: z.ZodEffects<z.ZodString, string, string>;
                retrievedAt: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            }, {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            }>]>;
            id: z.ZodString;
            path: z.ZodEffects<z.ZodString, string, string>;
            mediaType: z.ZodEnum<["audio/mpeg", "audio/ogg", "audio/wav", "audio/mp4"]>;
            locale: z.ZodNullable<z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>>;
            transcript: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            path: string;
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar" | null;
            id: string;
            mediaType: "audio/mpeg" | "audio/ogg" | "audio/wav" | "audio/mp4";
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            transcript: string;
        }, {
            path: string;
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar" | null;
            id: string;
            mediaType: "audio/mpeg" | "audio/ogg" | "audio/wav" | "audio/mp4";
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            transcript: string;
        }>, "many">;
        music: z.ZodArray<z.ZodObject<{
            license: z.ZodObject<{
                spdxId: z.ZodString;
                name: z.ZodString;
                url: z.ZodNullable<z.ZodEffects<z.ZodString, string, string>>;
                attribution: z.ZodNullable<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            }, {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            }>;
            provenance: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
                kind: z.ZodLiteral<"original">;
                creator: z.ZodString;
                createdAt: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                kind: "original";
                creator: string;
                createdAt: string;
            }, {
                kind: "original";
                creator: string;
                createdAt: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"generated">;
                tool: z.ZodString;
                model: z.ZodString;
                prompt: z.ZodString;
                generatedAt: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            }, {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"third-party">;
                creator: z.ZodString;
                sourceUrl: z.ZodEffects<z.ZodString, string, string>;
                retrievedAt: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            }, {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            }>]>;
            id: z.ZodString;
            generator: z.ZodLiteral<"tone.js">;
            seed: z.ZodNumber;
            mood: z.ZodEnum<["adventure", "calm", "silly", "victory"]>;
        }, "strict", z.ZodTypeAny, {
            id: string;
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            generator: "tone.js";
            seed: number;
            mood: "adventure" | "calm" | "silly" | "victory";
        }, {
            id: string;
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            generator: "tone.js";
            seed: number;
            mood: "adventure" | "calm" | "silly" | "victory";
        }>, "many">;
    }, "strict", z.ZodTypeAny, {
        images: {
            path: string;
            id: string;
            mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
            alt: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
        }[];
        audio: {
            path: string;
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar" | null;
            id: string;
            mediaType: "audio/mpeg" | "audio/ogg" | "audio/wav" | "audio/mp4";
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            transcript: string;
        }[];
        music: {
            id: string;
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            generator: "tone.js";
            seed: number;
            mood: "adventure" | "calm" | "silly" | "victory";
        }[];
    }, {
        images: {
            path: string;
            id: string;
            mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
            alt: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
        }[];
        audio: {
            path: string;
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar" | null;
            id: string;
            mediaType: "audio/mpeg" | "audio/ogg" | "audio/wav" | "audio/mp4";
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            transcript: string;
        }[];
        music: {
            id: string;
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            generator: "tone.js";
            seed: number;
            mood: "adventure" | "calm" | "silly" | "victory";
        }[];
    }>;
}, "strict", z.ZodTypeAny, {
    schemaVersion: 1;
    permissions: {
        camera: boolean;
        deviceLocalStorage: boolean;
    };
    meta: {
        id: string;
        title: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        summary: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        locales: ("en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar")[];
        theme: string;
        ageBands: ("2-3" | "4-5" | "6-7" | "8+")[];
        estMinutes: number;
        engine: {
            minimumVersion: string;
            maximumVersion: string | null;
        };
        compiler: {
            model: string;
            generatedAt: string;
            reasoningEffort: string;
        } | null;
    };
    cast: {
        name: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        id: string;
        artAssetId: string | null;
        description: string;
    }[];
    entrySceneId: string;
    scenes: ({
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: false;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    } | {
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: true;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    })[];
    adaptPolicy: {
        targetSuccessBand: [number, number];
        maxStruggleStreak: number;
        maxHighEnergyMs: number;
    };
    assets: {
        images: {
            path: string;
            id: string;
            mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
            alt: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
        }[];
        audio: {
            path: string;
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar" | null;
            id: string;
            mediaType: "audio/mpeg" | "audio/ogg" | "audio/wav" | "audio/mp4";
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            transcript: string;
        }[];
        music: {
            id: string;
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            generator: "tone.js";
            seed: number;
            mood: "adventure" | "calm" | "silly" | "victory";
        }[];
    };
}, {
    schemaVersion: 1;
    permissions: {
        camera: boolean;
        deviceLocalStorage: boolean;
    };
    meta: {
        id: string;
        title: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        summary: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        locales: ("en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar")[];
        theme: string;
        ageBands: ("2-3" | "4-5" | "6-7" | "8+")[];
        estMinutes: number;
        engine: {
            minimumVersion: string;
            maximumVersion: string | null;
        };
        compiler: {
            model: string;
            generatedAt: string;
            reasoningEffort: string;
        } | null;
    };
    cast: {
        name: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        id: string;
        artAssetId: string | null;
        description: string;
    }[];
    entrySceneId: string;
    scenes: ({
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: false;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    } | {
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: true;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    })[];
    adaptPolicy: {
        targetSuccessBand: [number, number];
        maxStruggleStreak: number;
        maxHighEnergyMs: number;
    };
    assets: {
        images: {
            path: string;
            id: string;
            mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
            alt: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
        }[];
        audio: {
            path: string;
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar" | null;
            id: string;
            mediaType: "audio/mpeg" | "audio/ogg" | "audio/wav" | "audio/mp4";
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            transcript: string;
        }[];
        music: {
            id: string;
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            generator: "tone.js";
            seed: number;
            mood: "adventure" | "calm" | "silly" | "victory";
        }[];
    };
}>;
export type EpisodePack = z.infer<typeof EpisodePackBaseSchema>;
export type IntegrityIssueCode = "duplicate_id" | "missing_reference" | "wrong_asset_type" | "duplicate_outcome" | "invalid_transition" | "unreachable_scene" | "terminal_unreachable" | "locale_mismatch" | "invalid_scene" | "missing_outcome" | "provenance_mismatch";
export interface IntegrityIssue {
    code: IntegrityIssueCode;
    path: Array<string | number>;
    message: string;
}
/** Pure semantic validation for a structurally parsed v1 pack. */
export declare function validateEpisodePackIntegrity(pack: EpisodePack): IntegrityIssue[];
export declare const EpisodePackSchema: z.ZodEffects<z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    meta: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodArray<z.ZodObject<{
            locale: z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>;
            text: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }>, "many">;
        summary: z.ZodArray<z.ZodObject<{
            locale: z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>;
            text: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }>, "many">;
        theme: z.ZodString;
        locales: z.ZodArray<z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>, "many">;
        ageBands: z.ZodArray<z.ZodEnum<["2-3", "4-5", "6-7", "8+"]>, "many">;
        estMinutes: z.ZodNumber;
        engine: z.ZodObject<{
            minimumVersion: z.ZodString;
            maximumVersion: z.ZodNullable<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            minimumVersion: string;
            maximumVersion: string | null;
        }, {
            minimumVersion: string;
            maximumVersion: string | null;
        }>;
        compiler: z.ZodNullable<z.ZodObject<{
            model: z.ZodString;
            reasoningEffort: z.ZodString;
            generatedAt: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            model: string;
            generatedAt: string;
            reasoningEffort: string;
        }, {
            model: string;
            generatedAt: string;
            reasoningEffort: string;
        }>>;
    }, "strict", z.ZodTypeAny, {
        id: string;
        title: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        summary: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        locales: ("en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar")[];
        theme: string;
        ageBands: ("2-3" | "4-5" | "6-7" | "8+")[];
        estMinutes: number;
        engine: {
            minimumVersion: string;
            maximumVersion: string | null;
        };
        compiler: {
            model: string;
            generatedAt: string;
            reasoningEffort: string;
        } | null;
    }, {
        id: string;
        title: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        summary: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        locales: ("en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar")[];
        theme: string;
        ageBands: ("2-3" | "4-5" | "6-7" | "8+")[];
        estMinutes: number;
        engine: {
            minimumVersion: string;
            maximumVersion: string | null;
        };
        compiler: {
            model: string;
            generatedAt: string;
            reasoningEffort: string;
        } | null;
    }>;
    permissions: z.ZodObject<{
        camera: z.ZodBoolean;
        deviceLocalStorage: z.ZodBoolean;
    }, "strict", z.ZodTypeAny, {
        camera: boolean;
        deviceLocalStorage: boolean;
    }, {
        camera: boolean;
        deviceLocalStorage: boolean;
    }>;
    cast: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodArray<z.ZodObject<{
            locale: z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>;
            text: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }, {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }>, "many">;
        artAssetId: z.ZodNullable<z.ZodString>;
        description: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        name: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        id: string;
        artAssetId: string | null;
        description: string;
    }, {
        name: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        id: string;
        artAssetId: string | null;
        description: string;
    }>, "many">;
    entrySceneId: z.ZodString;
    scenes: z.ZodArray<z.ZodDiscriminatedUnion<"terminal", [z.ZodObject<{
        terminal: z.ZodLiteral<false>;
        transitions: z.ZodArray<z.ZodObject<{
            on: z.ZodUnion<[z.ZodEnum<["success", "partial", "struggle"]>, z.ZodLiteral<"always">]>;
            to: z.ZodString;
            adapt: z.ZodNullable<z.ZodObject<{
                targetScaleMul: z.ZodNumber;
                dwellMsMul: z.ZodNumber;
                countDelta: z.ZodNumber;
                timeBudgetMul: z.ZodNumber;
            }, "strict", z.ZodTypeAny, {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            }, {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            }>>;
        }, "strict", z.ZodTypeAny, {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }, {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }>, "many">;
        id: z.ZodString;
        kind: z.ZodEnum<["story", "calibration-check", "challenge", "rest", "celebration"]>;
        narration: z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                locale: z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>;
                text: z.ZodString;
                audioAssetId: z.ZodNullable<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }, {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }>, "many">;
            captionDefaultOn: z.ZodLiteral<true>;
        }, "strict", z.ZodTypeAny, {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        }, {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        }>;
        demo: z.ZodNullable<z.ZodObject<{
            characterId: z.ZodString;
            animation: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            characterId: string;
            animation: string;
        }, {
            characterId: string;
            animation: string;
        }>>;
        challenge: z.ZodNullable<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"touch_targets">;
            count: z.ZodNumber;
            zone: z.ZodEnum<["upper", "lower", "full", "reachable"]>;
            targetScale: z.ZodNumber;
            dwellMs: z.ZodNumber;
            limb: z.ZodEnum<["hands", "feet", "any"]>;
        }, "strict", z.ZodTypeAny, {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        }, {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"jump_count">;
            count: z.ZodNumber;
            countAloud: z.ZodBoolean;
        }, "strict", z.ZodTypeAny, {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        }, {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"squat">;
            reps: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        }, {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"freeze">;
            holdMs: z.ZodNumber;
            cue: z.ZodEnum<["music-stop", "narration", "visual"]>;
        }, "strict", z.ZodTypeAny, {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        }, {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"run_in_place">;
            durationMs: z.ZodNumber;
            intensity: z.ZodEnum<["stroll", "jog", "sprint"]>;
        }, "strict", z.ZodTypeAny, {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        }, {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"balance">;
            pose: z.ZodEnum<["one-leg", "airplane", "tiptoe", "statue"]>;
            holdMs: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        }, {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        }>]>>;
        learning: z.ZodNullable<z.ZodObject<{
            kind: z.ZodEnum<["counting", "colors", "letters", "body-parts", "directions", "animals", "none"]>;
            payload: z.ZodArray<z.ZodString, "many">;
        }, "strict", z.ZodTypeAny, {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        }, {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        }>>;
        artAssetId: z.ZodNullable<z.ZodString>;
        energy: z.ZodEnum<["calm", "medium", "high"]>;
    }, "strict", z.ZodTypeAny, {
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: false;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    }, {
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: false;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    }>, z.ZodObject<{
        terminal: z.ZodLiteral<true>;
        transitions: z.ZodArray<z.ZodObject<{
            on: z.ZodUnion<[z.ZodEnum<["success", "partial", "struggle"]>, z.ZodLiteral<"always">]>;
            to: z.ZodString;
            adapt: z.ZodNullable<z.ZodObject<{
                targetScaleMul: z.ZodNumber;
                dwellMsMul: z.ZodNumber;
                countDelta: z.ZodNumber;
                timeBudgetMul: z.ZodNumber;
            }, "strict", z.ZodTypeAny, {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            }, {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            }>>;
        }, "strict", z.ZodTypeAny, {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }, {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }>, "many">;
        id: z.ZodString;
        kind: z.ZodEnum<["story", "calibration-check", "challenge", "rest", "celebration"]>;
        narration: z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                locale: z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>;
                text: z.ZodString;
                audioAssetId: z.ZodNullable<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }, {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }>, "many">;
            captionDefaultOn: z.ZodLiteral<true>;
        }, "strict", z.ZodTypeAny, {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        }, {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        }>;
        demo: z.ZodNullable<z.ZodObject<{
            characterId: z.ZodString;
            animation: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            characterId: string;
            animation: string;
        }, {
            characterId: string;
            animation: string;
        }>>;
        challenge: z.ZodNullable<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"touch_targets">;
            count: z.ZodNumber;
            zone: z.ZodEnum<["upper", "lower", "full", "reachable"]>;
            targetScale: z.ZodNumber;
            dwellMs: z.ZodNumber;
            limb: z.ZodEnum<["hands", "feet", "any"]>;
        }, "strict", z.ZodTypeAny, {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        }, {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"jump_count">;
            count: z.ZodNumber;
            countAloud: z.ZodBoolean;
        }, "strict", z.ZodTypeAny, {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        }, {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"squat">;
            reps: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        }, {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"freeze">;
            holdMs: z.ZodNumber;
            cue: z.ZodEnum<["music-stop", "narration", "visual"]>;
        }, "strict", z.ZodTypeAny, {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        }, {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"run_in_place">;
            durationMs: z.ZodNumber;
            intensity: z.ZodEnum<["stroll", "jog", "sprint"]>;
        }, "strict", z.ZodTypeAny, {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        }, {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        }>, z.ZodObject<{
            timeBudgetMs: z.ZodNumber;
            successAudioId: z.ZodString;
            encourageAudioId: z.ZodString;
            type: z.ZodLiteral<"balance">;
            pose: z.ZodEnum<["one-leg", "airplane", "tiptoe", "statue"]>;
            holdMs: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        }, {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        }>]>>;
        learning: z.ZodNullable<z.ZodObject<{
            kind: z.ZodEnum<["counting", "colors", "letters", "body-parts", "directions", "animals", "none"]>;
            payload: z.ZodArray<z.ZodString, "many">;
        }, "strict", z.ZodTypeAny, {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        }, {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        }>>;
        artAssetId: z.ZodNullable<z.ZodString>;
        energy: z.ZodEnum<["calm", "medium", "high"]>;
    }, "strict", z.ZodTypeAny, {
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: true;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    }, {
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: true;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    }>]>, "many">;
    adaptPolicy: z.ZodObject<{
        targetSuccessBand: z.ZodEffects<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>, [number, number], [number, number]>;
        maxStruggleStreak: z.ZodNumber;
        maxHighEnergyMs: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        targetSuccessBand: [number, number];
        maxStruggleStreak: number;
        maxHighEnergyMs: number;
    }, {
        targetSuccessBand: [number, number];
        maxStruggleStreak: number;
        maxHighEnergyMs: number;
    }>;
    assets: z.ZodObject<{
        images: z.ZodArray<z.ZodObject<{
            license: z.ZodObject<{
                spdxId: z.ZodString;
                name: z.ZodString;
                url: z.ZodNullable<z.ZodEffects<z.ZodString, string, string>>;
                attribution: z.ZodNullable<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            }, {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            }>;
            provenance: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
                kind: z.ZodLiteral<"original">;
                creator: z.ZodString;
                createdAt: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                kind: "original";
                creator: string;
                createdAt: string;
            }, {
                kind: "original";
                creator: string;
                createdAt: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"generated">;
                tool: z.ZodString;
                model: z.ZodString;
                prompt: z.ZodString;
                generatedAt: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            }, {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"third-party">;
                creator: z.ZodString;
                sourceUrl: z.ZodEffects<z.ZodString, string, string>;
                retrievedAt: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            }, {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            }>]>;
            id: z.ZodString;
            path: z.ZodEffects<z.ZodString, string, string>;
            mediaType: z.ZodEnum<["image/png", "image/jpeg", "image/webp", "image/avif"]>;
            alt: z.ZodArray<z.ZodObject<{
                locale: z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>;
                text: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }, {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }>, "many">;
        }, "strict", z.ZodTypeAny, {
            path: string;
            id: string;
            mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
            alt: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
        }, {
            path: string;
            id: string;
            mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
            alt: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
        }>, "many">;
        audio: z.ZodArray<z.ZodObject<{
            license: z.ZodObject<{
                spdxId: z.ZodString;
                name: z.ZodString;
                url: z.ZodNullable<z.ZodEffects<z.ZodString, string, string>>;
                attribution: z.ZodNullable<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            }, {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            }>;
            provenance: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
                kind: z.ZodLiteral<"original">;
                creator: z.ZodString;
                createdAt: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                kind: "original";
                creator: string;
                createdAt: string;
            }, {
                kind: "original";
                creator: string;
                createdAt: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"generated">;
                tool: z.ZodString;
                model: z.ZodString;
                prompt: z.ZodString;
                generatedAt: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            }, {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"third-party">;
                creator: z.ZodString;
                sourceUrl: z.ZodEffects<z.ZodString, string, string>;
                retrievedAt: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            }, {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            }>]>;
            id: z.ZodString;
            path: z.ZodEffects<z.ZodString, string, string>;
            mediaType: z.ZodEnum<["audio/mpeg", "audio/ogg", "audio/wav", "audio/mp4"]>;
            locale: z.ZodNullable<z.ZodEnum<["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]>>;
            transcript: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            path: string;
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar" | null;
            id: string;
            mediaType: "audio/mpeg" | "audio/ogg" | "audio/wav" | "audio/mp4";
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            transcript: string;
        }, {
            path: string;
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar" | null;
            id: string;
            mediaType: "audio/mpeg" | "audio/ogg" | "audio/wav" | "audio/mp4";
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            transcript: string;
        }>, "many">;
        music: z.ZodArray<z.ZodObject<{
            license: z.ZodObject<{
                spdxId: z.ZodString;
                name: z.ZodString;
                url: z.ZodNullable<z.ZodEffects<z.ZodString, string, string>>;
                attribution: z.ZodNullable<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            }, {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            }>;
            provenance: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
                kind: z.ZodLiteral<"original">;
                creator: z.ZodString;
                createdAt: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                kind: "original";
                creator: string;
                createdAt: string;
            }, {
                kind: "original";
                creator: string;
                createdAt: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"generated">;
                tool: z.ZodString;
                model: z.ZodString;
                prompt: z.ZodString;
                generatedAt: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            }, {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"third-party">;
                creator: z.ZodString;
                sourceUrl: z.ZodEffects<z.ZodString, string, string>;
                retrievedAt: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            }, {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            }>]>;
            id: z.ZodString;
            generator: z.ZodLiteral<"tone.js">;
            seed: z.ZodNumber;
            mood: z.ZodEnum<["adventure", "calm", "silly", "victory"]>;
        }, "strict", z.ZodTypeAny, {
            id: string;
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            generator: "tone.js";
            seed: number;
            mood: "adventure" | "calm" | "silly" | "victory";
        }, {
            id: string;
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            generator: "tone.js";
            seed: number;
            mood: "adventure" | "calm" | "silly" | "victory";
        }>, "many">;
    }, "strict", z.ZodTypeAny, {
        images: {
            path: string;
            id: string;
            mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
            alt: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
        }[];
        audio: {
            path: string;
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar" | null;
            id: string;
            mediaType: "audio/mpeg" | "audio/ogg" | "audio/wav" | "audio/mp4";
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            transcript: string;
        }[];
        music: {
            id: string;
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            generator: "tone.js";
            seed: number;
            mood: "adventure" | "calm" | "silly" | "victory";
        }[];
    }, {
        images: {
            path: string;
            id: string;
            mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
            alt: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
        }[];
        audio: {
            path: string;
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar" | null;
            id: string;
            mediaType: "audio/mpeg" | "audio/ogg" | "audio/wav" | "audio/mp4";
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            transcript: string;
        }[];
        music: {
            id: string;
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            generator: "tone.js";
            seed: number;
            mood: "adventure" | "calm" | "silly" | "victory";
        }[];
    }>;
}, "strict", z.ZodTypeAny, {
    schemaVersion: 1;
    permissions: {
        camera: boolean;
        deviceLocalStorage: boolean;
    };
    meta: {
        id: string;
        title: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        summary: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        locales: ("en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar")[];
        theme: string;
        ageBands: ("2-3" | "4-5" | "6-7" | "8+")[];
        estMinutes: number;
        engine: {
            minimumVersion: string;
            maximumVersion: string | null;
        };
        compiler: {
            model: string;
            generatedAt: string;
            reasoningEffort: string;
        } | null;
    };
    cast: {
        name: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        id: string;
        artAssetId: string | null;
        description: string;
    }[];
    entrySceneId: string;
    scenes: ({
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: false;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    } | {
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: true;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    })[];
    adaptPolicy: {
        targetSuccessBand: [number, number];
        maxStruggleStreak: number;
        maxHighEnergyMs: number;
    };
    assets: {
        images: {
            path: string;
            id: string;
            mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
            alt: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
        }[];
        audio: {
            path: string;
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar" | null;
            id: string;
            mediaType: "audio/mpeg" | "audio/ogg" | "audio/wav" | "audio/mp4";
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            transcript: string;
        }[];
        music: {
            id: string;
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            generator: "tone.js";
            seed: number;
            mood: "adventure" | "calm" | "silly" | "victory";
        }[];
    };
}, {
    schemaVersion: 1;
    permissions: {
        camera: boolean;
        deviceLocalStorage: boolean;
    };
    meta: {
        id: string;
        title: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        summary: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        locales: ("en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar")[];
        theme: string;
        ageBands: ("2-3" | "4-5" | "6-7" | "8+")[];
        estMinutes: number;
        engine: {
            minimumVersion: string;
            maximumVersion: string | null;
        };
        compiler: {
            model: string;
            generatedAt: string;
            reasoningEffort: string;
        } | null;
    };
    cast: {
        name: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        id: string;
        artAssetId: string | null;
        description: string;
    }[];
    entrySceneId: string;
    scenes: ({
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: false;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    } | {
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: true;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    })[];
    adaptPolicy: {
        targetSuccessBand: [number, number];
        maxStruggleStreak: number;
        maxHighEnergyMs: number;
    };
    assets: {
        images: {
            path: string;
            id: string;
            mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
            alt: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
        }[];
        audio: {
            path: string;
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar" | null;
            id: string;
            mediaType: "audio/mpeg" | "audio/ogg" | "audio/wav" | "audio/mp4";
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            transcript: string;
        }[];
        music: {
            id: string;
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            generator: "tone.js";
            seed: number;
            mood: "adventure" | "calm" | "silly" | "victory";
        }[];
    };
}>, {
    schemaVersion: 1;
    permissions: {
        camera: boolean;
        deviceLocalStorage: boolean;
    };
    meta: {
        id: string;
        title: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        summary: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        locales: ("en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar")[];
        theme: string;
        ageBands: ("2-3" | "4-5" | "6-7" | "8+")[];
        estMinutes: number;
        engine: {
            minimumVersion: string;
            maximumVersion: string | null;
        };
        compiler: {
            model: string;
            generatedAt: string;
            reasoningEffort: string;
        } | null;
    };
    cast: {
        name: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        id: string;
        artAssetId: string | null;
        description: string;
    }[];
    entrySceneId: string;
    scenes: ({
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: false;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    } | {
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: true;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    })[];
    adaptPolicy: {
        targetSuccessBand: [number, number];
        maxStruggleStreak: number;
        maxHighEnergyMs: number;
    };
    assets: {
        images: {
            path: string;
            id: string;
            mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
            alt: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
        }[];
        audio: {
            path: string;
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar" | null;
            id: string;
            mediaType: "audio/mpeg" | "audio/ogg" | "audio/wav" | "audio/mp4";
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            transcript: string;
        }[];
        music: {
            id: string;
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            generator: "tone.js";
            seed: number;
            mood: "adventure" | "calm" | "silly" | "victory";
        }[];
    };
}, {
    schemaVersion: 1;
    permissions: {
        camera: boolean;
        deviceLocalStorage: boolean;
    };
    meta: {
        id: string;
        title: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        summary: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        locales: ("en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar")[];
        theme: string;
        ageBands: ("2-3" | "4-5" | "6-7" | "8+")[];
        estMinutes: number;
        engine: {
            minimumVersion: string;
            maximumVersion: string | null;
        };
        compiler: {
            model: string;
            generatedAt: string;
            reasoningEffort: string;
        } | null;
    };
    cast: {
        name: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        id: string;
        artAssetId: string | null;
        description: string;
    }[];
    entrySceneId: string;
    scenes: ({
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: false;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    } | {
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: true;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    })[];
    adaptPolicy: {
        targetSuccessBand: [number, number];
        maxStruggleStreak: number;
        maxHighEnergyMs: number;
    };
    assets: {
        images: {
            path: string;
            id: string;
            mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
            alt: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
        }[];
        audio: {
            path: string;
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar" | null;
            id: string;
            mediaType: "audio/mpeg" | "audio/ogg" | "audio/wav" | "audio/mp4";
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            transcript: string;
        }[];
        music: {
            id: string;
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            generator: "tone.js";
            seed: number;
            mood: "adventure" | "calm" | "silly" | "victory";
        }[];
    };
}>;
//# sourceMappingURL=episode.d.ts.map