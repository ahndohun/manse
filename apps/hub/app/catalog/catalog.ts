import catalogSnapshotJson from "./catalog.snapshot.json";

export const movementTags = ["touch"] as const;

export const energyLevels = ["gentle", "moderate", "active"] as const;

export const accessibilityFeatures = [
  "captions",
  "audio-cues",
  "reduced-stimulation",
  "seated-mode",
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

function expectBoolean(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`Catalog field \"${field}\" must be a boolean.`);
  }
  return value;
}

function readLocalizedText(value: unknown, locales: readonly string[], field: string): string {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Catalog field \"${field}\" must contain localized text.`);
  }
  const entries = value.map((entry, index) => {
    if (!isRecord(entry)) throw new Error(`Catalog field \"${field}[${index}]\" must be an object.`);
    return {
      locale: expectString(entry.locale, `${field}[${index}].locale`),
      text: expectString(entry.text, `${field}[${index}].text`),
    };
  });
  const preferredLocale = locales.includes("en") ? "en" : locales[0];
  return entries.find((entry) => entry.locale === preferredLocale)?.text ?? entries[0]!.text;
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

  const manifestUrl = expectPublicUrl(value.manifestUrl, `games[${index}].manifestUrl`);
  if (new URL(manifestUrl).pathname !== "/.well-known/manse-game.json") {
    throw new Error(`Catalog game \"${index}\" does not use the public manifest path.`);
  }
  const manifest = value.manifest;
  if (!isRecord(manifest) || manifest.schemaVersion !== 1) {
    throw new Error(`Catalog field \"games[${index}].manifest\" must be a version 1 manifest.`);
  }
  const locales = expectStringArray(manifest.locales, `games[${index}].manifest.locales`);
  const ageRange = manifest.ageRange;
  if (!isRecord(ageRange)) {
    throw new Error(`Catalog field \"games[${index}].manifest.ageRange\" must be an object.`);
  }

  const min = ageRange.min;
  const max = ageRange.max;
  if (
    typeof min !== "number" ||
    typeof max !== "number" ||
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    min < 2 ||
    max < min
  ) {
    throw new Error(`Catalog game \"${index}\" has an invalid age range.`);
  }

  const thumbnail = manifest.thumbnail;
  if (!isRecord(thumbnail)) {
    throw new Error(`Catalog field \"games[${index}].manifest.thumbnail\" must be an object.`);
  }
  const accessibility = manifest.accessibility;
  if (!isRecord(accessibility)) {
    throw new Error(`Catalog field \"games[${index}].manifest.accessibility\" must be an object.`);
  }
  const license = manifest.license;
  if (!isRecord(license)) {
    throw new Error(`Catalog field \"games[${index}].manifest.license\" must be an object.`);
  }
  const gameUrl = expectPublicUrl(manifest.gameUrl, `games[${index}].manifest.gameUrl`);
  if (new URL(gameUrl).origin !== new URL(manifestUrl).origin) {
    throw new Error(`Catalog game \"${index}\" manifest and game origins must match.`);
  }
  const accessibilityValues: AccessibilityFeature[] = [];
  if (expectBoolean(accessibility.captions, `games[${index}].manifest.accessibility.captions`)) accessibilityValues.push("captions");
  if (expectBoolean(accessibility.audioCues, `games[${index}].manifest.accessibility.audioCues`)) accessibilityValues.push("audio-cues");
  if (expectBoolean(accessibility.reducedStimulation, `games[${index}].manifest.accessibility.reducedStimulation`)) accessibilityValues.push("reduced-stimulation");
  if (expectBoolean(accessibility.seatedMode, `games[${index}].manifest.accessibility.seatedMode`)) accessibilityValues.push("seated-mode");
  if (expectBoolean(accessibility.highContrast, `games[${index}].manifest.accessibility.highContrast`)) accessibilityValues.push("high-contrast");

  return {
    id: expectString(manifest.id, `games[${index}].manifest.id`),
    slug: expectString(manifest.slug, `games[${index}].manifest.slug`),
    title: readLocalizedText(manifest.title, locales, `games[${index}].manifest.title`),
    summary: readLocalizedText(manifest.summary, locales, `games[${index}].manifest.summary`),
    creator: expectString(manifest.creator, `games[${index}].manifest.creator`),
    gameUrl,
    sourceUrl: expectPublicUrl(manifest.sourceUrl, `games[${index}].manifest.sourceUrl`),
    manifestUrl,
    thumbnailUrl: expectPublicUrl(thumbnail.url, `games[${index}].manifest.thumbnail.url`),
    engineVersion: expectString(manifest.engineVersion, `games[${index}].manifest.engineVersion`),
    locales,
    ageRange: { min, max },
    movementTags: expectEnumArray(
      manifest.movementTags,
      `games[${index}].manifest.movementTags`,
      movementTags,
    ),
    energy: (() => {
      const energy = expectString(manifest.energy, `games[${index}].manifest.energy`);
      if (!energyLevels.includes(energy as EnergyLevel)) {
        throw new Error(`Catalog game \"${index}\" has an unsupported energy level.`);
      }
      return energy as EnergyLevel;
    })(),
    accessibility: accessibilityValues,
    license: expectString(license.spdxId, `games[${index}].manifest.license.spdxId`),
  };
}

export function readCatalogSnapshot(value: unknown): CatalogSnapshot {
  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.games)) {
    throw new Error("Catalog snapshot must use schemaVersion 1 and contain a games array.");
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
