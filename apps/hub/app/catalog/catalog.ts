import catalogSnapshotJson from "./catalog.snapshot.json";

export const movementTags = [
  "reach",
  "jump",
  "squat",
  "balance",
  "run",
  "dance",
  "seated",
  "full-body",
] as const;

export const energyLevels = ["gentle", "moderate", "active"] as const;

export const accessibilityFeatures = [
  "captions",
  "audio-cues",
  "reduced-motion",
  "seated-mode",
  "no-jump-mode",
  "high-contrast",
] as const;

export type MovementTag = (typeof movementTags)[number];
export type EnergyLevel = (typeof energyLevels)[number];
export type AccessibilityFeature = (typeof accessibilityFeatures)[number];

export interface CatalogGame {
  id: string;
  slug: string;
  title: string;
  summary: string;
  creator: string;
  gameUrl: string;
  sourceUrl: string;
  manifestUrl: string;
  thumbnailUrl: string | null;
  engineVersion: string;
  locales: string[];
  ageRange: {
    min: number;
    max: number;
  };
  movementTags: MovementTag[];
  energy: EnergyLevel;
  accessibility: AccessibilityFeature[];
  license: string;
}

export interface CatalogSnapshot {
  schemaVersion: 1;
  generatedAt: string | null;
  games: CatalogGame[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function expectString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Catalog field \"${field}\" must be a non-empty string.`);
  }
  return value;
}

function expectPublicUrl(value: unknown, field: string): string {
  const url = expectString(value, field);
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Catalog field \"${field}\" must be an absolute URL.`);
  }

  if (parsed.protocol !== "https:") {
    throw new Error(`Catalog field \"${field}\" must use HTTPS.`);
  }

  return url;
}

function expectStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Catalog field \"${field}\" must be an array.`);
  }
  return value.map((entry, index) => expectString(entry, `${field}[${index}]`));
}

function expectEnumArray<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[],
): T[] {
  const entries = expectStringArray(value, field);
  return entries.map((entry) => {
    if (!allowed.includes(entry as T)) {
      throw new Error(`Catalog field \"${field}\" contains unsupported value \"${entry}\".`);
    }
    return entry as T;
  });
}

function readGame(value: unknown, index: number): CatalogGame {
  if (!isRecord(value)) {
    throw new Error(`Catalog game at index ${index} must be an object.`);
  }

  const ageRange = value.ageRange;
  if (!isRecord(ageRange)) {
    throw new Error(`Catalog field \"games[${index}].ageRange\" must be an object.`);
  }

  const min = ageRange.min;
  const max = ageRange.max;
  if (
    typeof min !== "number" ||
    typeof max !== "number" ||
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    min < 0 ||
    max < min
  ) {
    throw new Error(`Catalog game \"${index}\" has an invalid age range.`);
  }

  const thumbnailUrl = value.thumbnailUrl;

  return {
    id: expectString(value.id, `games[${index}].id`),
    slug: expectString(value.slug, `games[${index}].slug`),
    title: expectString(value.title, `games[${index}].title`),
    summary: expectString(value.summary, `games[${index}].summary`),
    creator: expectString(value.creator, `games[${index}].creator`),
    gameUrl: expectPublicUrl(value.gameUrl, `games[${index}].gameUrl`),
    sourceUrl: expectPublicUrl(value.sourceUrl, `games[${index}].sourceUrl`),
    manifestUrl: expectPublicUrl(value.manifestUrl, `games[${index}].manifestUrl`),
    thumbnailUrl:
      thumbnailUrl === null
        ? null
        : expectPublicUrl(thumbnailUrl, `games[${index}].thumbnailUrl`),
    engineVersion: expectString(value.engineVersion, `games[${index}].engineVersion`),
    locales: expectStringArray(value.locales, `games[${index}].locales`),
    ageRange: { min, max },
    movementTags: expectEnumArray(
      value.movementTags,
      `games[${index}].movementTags`,
      movementTags,
    ),
    energy: (() => {
      const energy = expectString(value.energy, `games[${index}].energy`);
      if (!energyLevels.includes(energy as EnergyLevel)) {
        throw new Error(`Catalog game \"${index}\" has an unsupported energy level.`);
      }
      return energy as EnergyLevel;
    })(),
    accessibility: expectEnumArray(
      value.accessibility,
      `games[${index}].accessibility`,
      accessibilityFeatures,
    ),
    license: expectString(value.license, `games[${index}].license`),
  };
}

export function readCatalogSnapshot(value: unknown): CatalogSnapshot {
  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.games)) {
    throw new Error("Catalog snapshot must use schemaVersion 1 and contain a games array.");
  }

  const generatedAt = value.generatedAt;
  if (generatedAt !== null && typeof generatedAt !== "string") {
    throw new Error("Catalog generatedAt must be an ISO timestamp or null.");
  }

  const games = value.games.map(readGame);
  const ids = new Set<string>();
  const slugs = new Set<string>();

  for (const game of games) {
    if (ids.has(game.id) || slugs.has(game.slug)) {
      throw new Error(`Catalog game ids and slugs must be unique: ${game.slug}.`);
    }
    ids.add(game.id);
    slugs.add(game.slug);
  }

  return {
    schemaVersion: 1,
    generatedAt,
    games,
  };
}

export const catalogSnapshot = readCatalogSnapshot(catalogSnapshotJson);

export interface CatalogFilters {
  query: string;
  movement: MovementTag | "all";
  energy: EnergyLevel | "all";
  locale: string;
  accessibility: AccessibilityFeature | "all";
}

export const defaultCatalogFilters: CatalogFilters = {
  query: "",
  movement: "all",
  energy: "all",
  locale: "all",
  accessibility: "all",
};

export function filterCatalogGames(
  games: readonly CatalogGame[],
  filters: CatalogFilters,
): CatalogGame[] {
  const query = filters.query.trim().toLocaleLowerCase();

  return games.filter((game) => {
    const searchable = [
      game.title,
      game.summary,
      game.creator,
      ...game.movementTags,
      ...game.locales,
    ]
      .join(" ")
      .toLocaleLowerCase();

    return (
      (query.length === 0 || searchable.includes(query)) &&
      (filters.movement === "all" || game.movementTags.includes(filters.movement)) &&
      (filters.energy === "all" || game.energy === filters.energy) &&
      (filters.locale === "all" || game.locales.includes(filters.locale)) &&
      (filters.accessibility === "all" ||
        game.accessibility.includes(filters.accessibility))
    );
  });
}
