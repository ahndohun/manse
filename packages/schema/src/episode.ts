import { z } from "zod";

import { AssetCollectionsSchema } from "./assets.js";
import {
  AgeBandSchema,
  IdentifierSchema,
  IsoDateTimeSchema,
  LocaleSchema,
  LocalizedTextSchema,
  PermissionsSchema,
  SemverSchema,
  duplicateValues,
} from "./common.js";

const ChallengeBaseShape = {
  timeBudgetMs: z.number().int().positive().max(300_000),
  successAudioId: IdentifierSchema,
  encourageAudioId: IdentifierSchema,
};

export const TouchTargetsSchema = z
  .object({
    type: z.literal("touch_targets"),
    count: z.number().int().min(1).max(12),
    zone: z.enum(["upper", "lower", "full", "reachable"]),
    targetScale: z.number().min(0.5).max(2),
    dwellMs: z.number().int().min(0).max(1_500),
    limb: z.enum(["hands", "feet", "any"]),
    ...ChallengeBaseShape,
  })
  .strict();

export const ChallengeSchema = TouchTargetsSchema;
export type Challenge = z.infer<typeof ChallengeSchema>;

export const LearningMomentSchema = z
  .object({
    kind: z.enum(["counting", "colors", "letters", "body-parts", "directions", "animals", "none"]),
    payload: z.array(z.string().min(1).max(100)).max(10),
  })
  .strict();
export type LearningMoment = z.infer<typeof LearningMomentSchema>;

export const NarrationItemSchema = z
  .object({
    locale: LocaleSchema,
    text: z.string().trim().min(1).max(5_000),
    audioAssetId: IdentifierSchema.nullable(),
  })
  .strict();
export type NarrationItem = z.infer<typeof NarrationItemSchema>;

export const NarrationSchema = z
  .object({ items: z.array(NarrationItemSchema).min(1), captionDefaultOn: z.literal(true) })
  .strict();
export type Narration = z.infer<typeof NarrationSchema>;

export const OutcomeSchema = z.enum(["success", "partial", "struggle"]);
export type Outcome = z.infer<typeof OutcomeSchema>;

export const ParamDeltaSchema = z
  .object({
    targetScaleMul: z.number().min(0.75).max(1.5),
    dwellMsMul: z.number().min(0.5).max(1.5),
    countDelta: z.number().int().min(-3).max(3),
    timeBudgetMul: z.number().min(0.75).max(1.6),
  })
  .strict();
export type ParamDelta = z.infer<typeof ParamDeltaSchema>;

export const TransitionEventSchema = z.union([OutcomeSchema, z.literal("always")]);
export type TransitionEvent = z.infer<typeof TransitionEventSchema>;

export const TransitionSchema = z
  .object({ on: TransitionEventSchema, to: IdentifierSchema, adapt: ParamDeltaSchema.nullable() })
  .strict();
export type Transition = z.infer<typeof TransitionSchema>;

const SceneCommonShape = {
  id: IdentifierSchema,
  kind: z.enum(["story", "calibration-check", "challenge", "rest", "celebration"]),
  narration: NarrationSchema,
  demo: z
    .object({ characterId: IdentifierSchema, animation: z.string().trim().min(1).max(200) })
    .strict()
    .nullable(),
  challenge: ChallengeSchema.nullable(),
  learning: LearningMomentSchema.nullable(),
  artAssetId: IdentifierSchema.nullable(),
  energy: z.enum(["calm", "medium", "high"]),
};

export const NonTerminalSceneSchema = z
  .object({ ...SceneCommonShape, terminal: z.literal(false), transitions: z.array(TransitionSchema).min(1) })
  .strict();
export type NonTerminalScene = z.infer<typeof NonTerminalSceneSchema>;

export const TerminalSceneSchema = z
  .object({ ...SceneCommonShape, terminal: z.literal(true), transitions: z.array(TransitionSchema).max(0) })
  .strict();
export type TerminalScene = z.infer<typeof TerminalSceneSchema>;

export const SceneSchema = z.discriminatedUnion("terminal", [NonTerminalSceneSchema, TerminalSceneSchema]);
export type Scene = z.infer<typeof SceneSchema>;

export const AdaptPolicySchema = z
  .object({
    targetSuccessBand: z
      .tuple([z.number().min(0).max(1), z.number().min(0).max(1)])
      .refine(([low, high]) => low <= high, "Success band lower bound must not exceed upper bound"),
    maxStruggleStreak: z.number().int().min(1).max(4),
    maxHighEnergyMs: z.number().int().positive().max(180_000),
  })
  .strict();
export type AdaptPolicy = z.infer<typeof AdaptPolicySchema>;

export const EngineCompatibilitySchema = z
  .object({ minimumVersion: SemverSchema, maximumVersion: SemverSchema.nullable() })
  .strict();
export type EngineCompatibility = z.infer<typeof EngineCompatibilitySchema>;

export const CompilerMetadataSchema = z
  .object({
    model: z.string().trim().min(1).max(200),
    reasoningEffort: z.string().trim().min(1).max(100),
    generatedAt: IsoDateTimeSchema,
  })
  .strict();
export type CompilerMetadata = z.infer<typeof CompilerMetadataSchema>;

export const EpisodePackBaseSchema = z
  .object({
    schemaVersion: z.literal(1),
    meta: z
      .object({
        id: IdentifierSchema,
        title: z.array(LocalizedTextSchema).min(1),
        summary: z.array(LocalizedTextSchema).min(1),
        theme: z.string().trim().min(1).max(500),
        locales: z.array(LocaleSchema).min(1),
        ageBands: z.array(AgeBandSchema).min(1),
        estMinutes: z.number().min(1).max(60),
        engine: EngineCompatibilitySchema,
        compiler: CompilerMetadataSchema.nullable(),
      })
      .strict(),
    permissions: PermissionsSchema,
    cast: z
      .array(
        z
          .object({
            id: IdentifierSchema,
            name: z.array(LocalizedTextSchema).min(1),
            artAssetId: IdentifierSchema.nullable(),
            description: z.string().trim().min(1).max(2_000),
          })
          .strict(),
      )
      .min(1),
    entrySceneId: IdentifierSchema,
    scenes: z.array(SceneSchema).min(3),
    adaptPolicy: AdaptPolicySchema,
    assets: AssetCollectionsSchema,
  })
  .strict();
export type EpisodePack = z.infer<typeof EpisodePackBaseSchema>;

export type IntegrityIssueCode =
  | "duplicate_id"
  | "missing_reference"
  | "wrong_asset_type"
  | "duplicate_outcome"
  | "invalid_transition"
  | "unreachable_scene"
  | "terminal_unreachable"
  | "locale_mismatch"
  | "invalid_scene"
  | "missing_outcome"
  | "provenance_mismatch";

export interface IntegrityIssue {
  code: IntegrityIssueCode;
  path: Array<string | number>;
  message: string;
}

function makeIssue(code: IntegrityIssueCode, path: Array<string | number>, message: string): IntegrityIssue {
  return { code, path, message };
}

function validateLocalizedSet(
  entries: readonly { locale: string }[],
  declaredLocales: readonly string[],
  path: Array<string | number>,
  issues: IntegrityIssue[],
): void {
  for (const duplicate of duplicateValues(entries.map((entry) => entry.locale))) {
    issues.push(makeIssue("locale_mismatch", path, `Locale '${duplicate}' is declared more than once`));
  }
  const present = new Set(entries.map((entry) => entry.locale));
  const declared = new Set(declaredLocales);
  for (const locale of declared) {
    if (!present.has(locale)) issues.push(makeIssue("locale_mismatch", path, `Missing declared locale '${locale}'`));
  }
  for (const locale of present) {
    if (!declared.has(locale)) {
      issues.push(makeIssue("locale_mismatch", path, `Locale '${locale}' is not declared by the pack`));
    }
  }
}

/** Pure semantic validation for a structurally parsed v1 pack. */
export function validateEpisodePackIntegrity(pack: EpisodePack): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  const declaredLocales = pack.meta.locales;

  for (const duplicate of duplicateValues(declaredLocales)) {
    issues.push(makeIssue("locale_mismatch", ["meta", "locales"], `Locale '${duplicate}' is declared more than once`));
  }
  validateLocalizedSet(pack.meta.title, declaredLocales, ["meta", "title"], issues);
  validateLocalizedSet(pack.meta.summary, declaredLocales, ["meta", "summary"], issues);

  const images = new Map(pack.assets.images.map((asset) => [asset.id, asset]));
  const audio = new Map(pack.assets.audio.map((asset) => [asset.id, asset]));
  const allAssetIds = [
    ...pack.assets.images.map((asset) => asset.id),
    ...pack.assets.audio.map((asset) => asset.id),
    ...pack.assets.music.map((asset) => asset.id),
  ];
  for (const duplicate of duplicateValues(allAssetIds)) {
    issues.push(makeIssue("duplicate_id", ["assets"], `Asset id '${duplicate}' must be unique across every asset kind`));
  }
  const allAssetIdSet = new Set(allAssetIds);
  const validateAssetReference = (
    id: string | null,
    expected: Map<string, unknown>,
    expectedKind: "image" | "audio",
    path: Array<string | number>,
  ): void => {
    if (id === null || expected.has(id)) return;
    const wrongKind = allAssetIdSet.has(id);
    issues.push(
      makeIssue(
        wrongKind ? "wrong_asset_type" : "missing_reference",
        path,
        wrongKind
          ? `Asset '${id}' exists but is not an ${expectedKind} asset`
          : `Referenced ${expectedKind} asset '${id}' does not exist`,
      ),
    );
  };

  pack.assets.images.forEach((asset, index) => {
    validateLocalizedSet(asset.alt, declaredLocales, ["assets", "images", index, "alt"], issues);
  });

  const castById = new Map<string, (typeof pack.cast)[number]>();
  pack.cast.forEach((character, index) => {
    if (castById.has(character.id)) {
      issues.push(makeIssue("duplicate_id", ["cast", index, "id"], `Duplicate cast id '${character.id}'`));
    } else {
      castById.set(character.id, character);
    }
    validateLocalizedSet(character.name, declaredLocales, ["cast", index, "name"], issues);
    validateAssetReference(character.artAssetId, images, "image", ["cast", index, "artAssetId"]);
  });

  const sceneById = new Map<string, Scene>();
  pack.scenes.forEach((scene, index) => {
    if (sceneById.has(scene.id)) {
      issues.push(makeIssue("duplicate_id", ["scenes", index, "id"], `Duplicate scene id '${scene.id}'`));
    } else {
      sceneById.set(scene.id, scene);
    }
  });
  if (!sceneById.has(pack.entrySceneId)) {
    issues.push(makeIssue("missing_reference", ["entrySceneId"], `Entry scene '${pack.entrySceneId}' does not exist`));
  }

  pack.scenes.forEach((scene, sceneIndex) => {
    const scenePath: Array<string | number> = ["scenes", sceneIndex];
    validateLocalizedSet(scene.narration.items, declaredLocales, [...scenePath, "narration", "items"], issues);
    scene.narration.items.forEach((item, itemIndex) => {
      const path = [...scenePath, "narration", "items", itemIndex, "audioAssetId"];
      validateAssetReference(item.audioAssetId, audio, "audio", path);
      if (item.audioAssetId !== null) {
        const audioAsset = audio.get(item.audioAssetId);
        if (audioAsset && audioAsset.locale !== item.locale) {
          issues.push(
            makeIssue(
              "locale_mismatch",
              path,
              `Narration locale '${item.locale}' must reference audio with the same locale`,
            ),
          );
        }
      }
    });

    validateAssetReference(scene.artAssetId, images, "image", [...scenePath, "artAssetId"]);
    if (scene.demo !== null && !castById.has(scene.demo.characterId)) {
      issues.push(
        makeIssue(
          "missing_reference",
          [...scenePath, "demo", "characterId"],
          `Character '${scene.demo.characterId}' does not exist`,
        ),
      );
    }
    if (scene.kind === "challenge" && scene.challenge === null) {
      issues.push(makeIssue("invalid_scene", [...scenePath, "challenge"], "Challenge scenes require a challenge"));
    }
    if (
      (scene.kind === "story" || scene.kind === "rest" || scene.kind === "celebration") &&
      scene.challenge !== null
    ) {
      issues.push(
        makeIssue("invalid_scene", [...scenePath, "challenge"], `Scene kind '${scene.kind}' cannot contain a challenge`),
      );
    }
    if (scene.terminal && scene.challenge !== null) {
      issues.push(makeIssue("invalid_scene", [...scenePath, "challenge"], "Terminal scenes cannot contain a challenge"));
    }
    if (scene.challenge !== null) {
      validateAssetReference(
        scene.challenge.successAudioId,
        audio,
        "audio",
        [...scenePath, "challenge", "successAudioId"],
      );
      validateAssetReference(
        scene.challenge.encourageAudioId,
        audio,
        "audio",
        [...scenePath, "challenge", "encourageAudioId"],
      );
    }

    const events = scene.transitions.map((transition) => transition.on);
    for (const duplicate of duplicateValues(events)) {
      issues.push(
        makeIssue(
          "duplicate_outcome",
          [...scenePath, "transitions"],
          `Transition event '${duplicate}' may appear at most once per scene`,
        ),
      );
    }
    if (events.includes("always") && events.length > 1) {
      issues.push(
        makeIssue(
          "invalid_transition",
          [...scenePath, "transitions"],
          "An 'always' transition must be the only transition in its scene",
        ),
      );
    }
    if (!scene.terminal && scene.challenge === null && (events.length !== 1 || events[0] !== "always")) {
      issues.push(
        makeIssue(
          "invalid_transition",
          [...scenePath, "transitions"],
          "A non-terminal scene without a challenge requires exactly one 'always' transition",
        ),
      );
    }
    if (scene.challenge !== null) {
      for (const required of ["success", "struggle"] as const) {
        if (!events.includes(required)) {
          issues.push(
            makeIssue(
              "missing_outcome",
              [...scenePath, "transitions"],
              `Challenge scenes require a unique '${required}' transition`,
            ),
          );
        }
      }
    }
    scene.transitions.forEach((transition, transitionIndex) => {
      if (!sceneById.has(transition.to)) {
        issues.push(
          makeIssue(
            "missing_reference",
            [...scenePath, "transitions", transitionIndex, "to"],
            `Target scene '${transition.to}' does not exist`,
          ),
        );
      }
    });
  });

  const terminalIds = new Set(pack.scenes.filter((scene) => scene.terminal).map((scene) => scene.id));
  if (terminalIds.size === 0) {
    issues.push(makeIssue("terminal_unreachable", ["scenes"], "At least one explicit terminal scene is required"));
  }

  const reachable = new Set<string>();
  const visitQueue = sceneById.has(pack.entrySceneId) ? [pack.entrySceneId] : [];
  while (visitQueue.length > 0) {
    const id = visitQueue.pop();
    if (id === undefined || reachable.has(id)) continue;
    reachable.add(id);
    const scene = sceneById.get(id);
    if (!scene) continue;
    for (const transition of scene.transitions) {
      if (sceneById.has(transition.to)) visitQueue.push(transition.to);
    }
  }
  pack.scenes.forEach((scene, index) => {
    if (!reachable.has(scene.id)) {
      issues.push(
        makeIssue(
          "unreachable_scene",
          ["scenes", index, "id"],
          `Scene '${scene.id}' is not reachable from entry scene '${pack.entrySceneId}'`,
        ),
      );
    }
  });

  const reverse = new Map<string, string[]>();
  for (const id of sceneById.keys()) reverse.set(id, []);
  for (const scene of sceneById.values()) {
    for (const transition of scene.transitions) reverse.get(transition.to)?.push(scene.id);
  }
  const canReachTerminal = new Set<string>();
  const reverseQueue = [...terminalIds];
  while (reverseQueue.length > 0) {
    const id = reverseQueue.pop();
    if (id === undefined || canReachTerminal.has(id)) continue;
    canReachTerminal.add(id);
    for (const parent of reverse.get(id) ?? []) reverseQueue.push(parent);
  }
  pack.scenes.forEach((scene, index) => {
    if (reachable.has(scene.id) && !canReachTerminal.has(scene.id)) {
      issues.push(
        makeIssue(
          "terminal_unreachable",
          ["scenes", index, "id"],
          `No terminal scene can be reached from scene '${scene.id}'`,
        ),
      );
    }
  });
  return issues;
}

export const EpisodePackSchema = EpisodePackBaseSchema.superRefine((pack, context) => {
  for (const issue of validateEpisodePackIntegrity(pack)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: issue.path,
      message: `[${issue.code}] ${issue.message}`,
    });
  }
});
