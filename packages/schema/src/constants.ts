export const MANSE_SCHEMA_VERSION = 1 as const;
export const MANSE_PACK_SCHEMA_VERSIONS = [1, 2] as const;
export const MANSE_GAME_MANIFEST_PATH = "/.well-known/manse-game.json" as const;
export const MANSE_PACK_FILENAME = "manse.pack.json" as const;

export const SUPPORTED_LOCALES = ["en", "ko", "es", "ja", "zh", "fr", "de", "ar"] as const;

export const CHALLENGE_TYPES = [
  "touch_targets",
  "freeze",
  "body_zone",
  "squat",
  "pose_match",
  "jump",
  "velocity_hit",
  "step",
  "sequence",
] as const;
export type ChallengeTypeName = (typeof CHALLENGE_TYPES)[number];

/** Public Showcase movement tag for each executable challenge primitive. */
export const CHALLENGE_MOVEMENT_TAGS = {
  touch_targets: "touch",
  freeze: "freeze",
  body_zone: "dodge",
  squat: "squat",
  pose_match: "pose",
  jump: "jump",
  velocity_hit: "strike",
  step: "step",
  sequence: "combo",
} as const satisfies Record<ChallengeTypeName, string>;
