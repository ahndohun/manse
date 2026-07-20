/**
 * Manse — Episode Pack & Player Profile schemas (zod v3, draft 1)
 *
 * Shared by:
 *  - the Episode Compiler (GPT-5.6 structured outputs via zodTextFormat)
 *  - the browser runtime (validation + typing)
 *
 * Structured-outputs compatibility notes:
 *  - discriminated unions only (no free-form records)
 *  - every object is strict (no additionalProperties)
 *  - keep enums closed; the compiler must not invent challenge types the runtime can't execute
 */

import { z } from "zod";

/* ---------------------------------- basics --------------------------------- */

export const Locale = z.enum(["en", "ko", "es", "ja", "zh", "fr", "de", "ar"]);
export type Locale = z.infer<typeof Locale>;

/** Normalized [0..1] coordinates relative to the camera frame (mirrored view). */
export const NormBox = z
  .object({ x0: z.number().min(0).max(1), y0: z.number().min(0).max(1),
            x1: z.number().min(0).max(1), y1: z.number().min(0).max(1) })
  .strict();

export const LocalizedText = z
  .object({ locale: Locale, text: z.string().min(1) })
  .strict();

/* ------------------------------ player profile ------------------------------ */
/** Lives ONLY in localStorage. Never sent to any API. */

export const AgeBand = z.enum(["2-3", "4-5", "6-7", "8+"]);

export const ComprehensionChannel = z.enum(["audio", "visual-demo", "both"]);

export const PlayerProfile = z
  .object({
    id: z.string(),
    createdAt: z.string(), // ISO
    displayName: z.string().max(30), // local-only; audio personalization comes from parent recordings
    locale: Locale,
    ageBand: AgeBand, // starting point ONLY — measurements override
    measured: z
      .object({
        reachBox: NormBox,             // from calibration scene
        shoulderYRatio: z.number(),    // proxy for height/camera framing
        tempoBpm: z.number(),          // natural movement cadence
        reactionMsP50: z.number(),
        comprehensionChannel: ComprehensionChannel,
      })
      .strict(),
    abilities: z
      .object({
        seatedMode: z.boolean(),       // wheelchair / floor play: disables jump/squat family
        canJump: z.boolean(),
        activeSide: z.enum(["both", "left", "right"]),
      })
      .strict(),
    sensory: z
      .object({
        reducedStimulation: z.boolean(),
        captions: z.boolean(),         // default true
        highContrast: z.boolean(),
        audioCues: z.boolean(),        // spatial-ish audio hints for low vision
      })
      .strict(),
    /** EMA success rate per challenge type, 0..1. Drives on-device adaptation. */
    skill: z
      .object({
        touch_targets: z.number().min(0).max(1),
        jump_count: z.number().min(0).max(1),
        squat: z.number().min(0).max(1),
        freeze: z.number().min(0).max(1),
        run_in_place: z.number().min(0).max(1),
        balance: z.number().min(0).max(1),
      })
      .strict(),
  })
  .strict();
export type PlayerProfile = z.infer<typeof PlayerProfile>;

/* -------------------------------- challenges -------------------------------- */
/** P0 primitive set. Runtime implements EXACTLY these; compiler may only compose them. */

const ChallengeBase = {
  /** Soft time budget. Expiry NEVER fails the child — it triggers 'struggle' transition + easier params. */
  timeBudgetMs: z.number().int().positive(),
  /** Coach lines to praise (success) / encourage (struggle), pre-baked audio refs. */
  successAudioId: z.string(),
  encourageAudioId: z.string(),
};

export const TouchTargets = z
  .object({
    type: z.literal("touch_targets"),
    count: z.number().int().min(1).max(12),
    zone: z.enum(["upper", "lower", "full", "reachable"]), // 'reachable' = intersect with profile.measured.reachBox
    targetScale: z.number().min(0.5).max(2),               // 1 = base kid-sized hitbox
    dwellMs: z.number().int().min(0).max(1500),            // 0 = touch, >0 = hold-on-target
    limb: z.enum(["hands", "feet", "any"]),
    ...ChallengeBase,
  })
  .strict();

export const JumpCount = z
  .object({
    type: z.literal("jump_count"),
    count: z.number().int().min(1).max(20),
    countAloud: z.boolean(), // narration counts along (learning: numbers)
    ...ChallengeBase,
  })
  .strict();

export const Squat = z
  .object({ type: z.literal("squat"), reps: z.number().int().min(1).max(15), ...ChallengeBase })
  .strict();

export const Freeze = z
  .object({
    type: z.literal("freeze"),
    holdMs: z.number().int().min(500).max(8000),
    cue: z.enum(["music-stop", "narration", "visual"]), // multi-channel by default; this picks the primary
    ...ChallengeBase,
  })
  .strict();

export const RunInPlace = z
  .object({
    type: z.literal("run_in_place"),
    durationMs: z.number().int().min(2000).max(30000),
    intensity: z.enum(["stroll", "jog", "sprint"]),
    ...ChallengeBase,
  })
  .strict();

export const Balance = z
  .object({
    type: z.literal("balance"),
    pose: z.enum(["one-leg", "airplane", "tiptoe", "statue"]),
    holdMs: z.number().int().min(500).max(6000),
    ...ChallengeBase,
  })
  .strict();

export const Challenge = z.discriminatedUnion("type", [
  TouchTargets, JumpCount, Squat, Freeze, RunInPlace, Balance,
]);
export type Challenge = z.infer<typeof Challenge>;

/** Seated-mode substitution table (runtime-enforced): jump_count→touch_targets(upper),
 *  squat→touch_targets(reachable), run_in_place→arm-pump variant of run_in_place, balance→freeze. */

/* --------------------------------- learning --------------------------------- */

export const LearningMoment = z
  .object({
    kind: z.enum(["counting", "colors", "letters", "body-parts", "directions", "animals", "none"]),
    /** e.g. counting: "1..5"; colors: target tint names matching narration; letters: shown glyphs */
    payload: z.array(z.string()).max(10),
  })
  .strict();

/* ---------------------------------- scenes ---------------------------------- */

export const Narration = z
  .object({
    lines: z.array(LocalizedText).min(1),
    /** Pre-baked TTS audio per locale (compiler fills; runtime resolves from assets). */
    audioIds: z.array(z.object({ locale: Locale, audioId: z.string() }).strict()).min(1),
    captionDefaultOn: z.literal(true),
  })
  .strict();

export const Outcome = z.enum(["success", "partial", "struggle"]);

/** Bounded parameter tweaks the runtime may apply when following a transition. */
export const ParamDelta = z
  .object({
    targetScaleMul: z.number().min(0.75).max(1.5),
    dwellMsMul: z.number().min(0.5).max(1.5),
    countDelta: z.number().int().min(-3).max(3),
    timeBudgetMul: z.number().min(0.75).max(1.6),
  })
  .strict();

export const Transition = z
  .object({ on: Outcome.or(z.literal("always")), to: z.string(), adapt: ParamDelta.nullable() })
  .strict();

export const Scene = z
  .object({
    id: z.string(),
    kind: z.enum(["story", "calibration-check", "challenge", "rest", "celebration"]),
    narration: Narration,
    /** On-screen character silently demonstrates the movement (deaf/no-audio accessibility). */
    demo: z.object({ characterId: z.string(), animation: z.string() }).strict().nullable(),
    challenge: Challenge.nullable(), // null for story/rest/celebration scenes
    learning: LearningMoment.nullable(),
    artAssetId: z.string().nullable(), // gpt-image-2 backdrop (P1); null → procedural gradient
    transitions: z.array(Transition).min(1),
    /** Sensory budget hints; runtime enforces regardless (no flicker ever). */
    energy: z.enum(["calm", "medium", "high"]),
  })
  .strict();

/* --------------------------------- episode ---------------------------------- */

export const AdaptPolicy = z
  .object({
    /** Runtime keeps rolling success in this band by applying ParamDeltas within bounds. */
    targetSuccessBand: z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]),
    /** Max consecutive 'struggle' before auto-inserting a rest/celebration scene. */
    maxStruggleStreak: z.number().int().min(1).max(4),
    /** Hard cap on continuous high-energy play before a mandatory calm scene. */
    maxHighEnergyMs: z.number().int().max(180000),
  })
  .strict();

export const AssetImage = z
  .object({ id: z.string(), path: z.string(), alt: z.string() })
  .strict();
export const AssetAudio = z
  .object({ id: z.string(), path: z.string(), locale: Locale.nullable(), transcript: z.string() })
  .strict();
export const AssetMusic = z
  .object({ id: z.string(), generator: z.literal("tone.js"), seed: z.number().int(), mood: z.enum(["adventure", "calm", "silly", "victory"]) })
  .strict();

export const EpisodePack = z
  .object({
    schemaVersion: z.literal(1),
    meta: z
      .object({
        id: z.string(),
        title: z.array(LocalizedText).min(1),
        theme: z.string(), // e.g. "dinosaur rescue", "space bakery"
        locales: z.array(Locale).min(1),
        ageBands: z.array(AgeBand).min(1),
        estMinutes: z.number().min(3).max(12),
        compiler: z
          .object({ model: z.string(), reasoningEffort: z.string(), generatedAt: z.string() })
          .strict(),
      })
      .strict(),
    cast: z
      .array(z.object({
        id: z.string(),
        name: z.array(LocalizedText).min(1),
        artAssetId: z.string().nullable(),
        /** Style guide enforced at compile time: diverse skin tones/body types, friendly, non-scary. */
        description: z.string(),
      }).strict())
      .min(1),
    entrySceneId: z.string(),
    scenes: z.array(Scene).min(3),
    adaptPolicy: AdaptPolicy,
    assets: z
      .object({ images: z.array(AssetImage), audio: z.array(AssetAudio), music: z.array(AssetMusic) })
      .strict(),
  })
  .strict()
  /* Runtime-side referential integrity checks (superRefine): every transition.to, audioId,
     artAssetId, characterId must resolve; DAG must be acyclic except explicit rest loops;
     every challenge scene must have transitions for success AND struggle. */;
export type EpisodePack = z.infer<typeof EpisodePack>;

/* ------------------------------- session stats ------------------------------ */
/** Local-only. Feeds skill EMA + parent recap. Anonymous by construction. */

export const SceneStat = z
  .object({
    sceneId: z.string(),
    challengeType: z.string().nullable(),
    outcome: Outcome.nullable(),
    attempts: z.number().int(),
    reactionMsP50: z.number().nullable(),
    activeMs: z.number().int(),
  })
  .strict();

export const SessionStats = z
  .object({
    episodeId: z.string(),
    startedAt: z.string(),
    scenes: z.array(SceneStat),
    totals: z
      .object({ jumps: z.number().int(), touches: z.number().int(), activeMs: z.number().int() })
      .strict(),
  })
  .strict();
export type SessionStats = z.infer<typeof SessionStats>;
