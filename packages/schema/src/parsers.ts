import {
  CatalogSchema,
  CatalogSnapshotSchema,
  type Catalog,
  type CatalogSnapshot,
} from "./catalog.js";
import { EpisodePackSchema, type EpisodePack } from "./episode.js";
import { ManseGameManifestSchema, type ManseGameManifest } from "./manifest.js";
import { PlayerProfileSchema, SessionStatsSchema, type PlayerProfile, type SessionStats } from "./profile.js";
import { PackProvenanceSchema, type PackProvenance } from "./provenance.js";

export function parseGameManifest(input: unknown): ManseGameManifest {
  return ManseGameManifestSchema.parse(input);
}

export function safeParseGameManifest(input: unknown) {
  return ManseGameManifestSchema.safeParse(input);
}

export function parseCatalog(input: unknown): Catalog {
  return CatalogSchema.parse(input);
}

export function safeParseCatalog(input: unknown) {
  return CatalogSchema.safeParse(input);
}

export function parseCatalogSnapshot(input: unknown): CatalogSnapshot {
  return CatalogSnapshotSchema.parse(input);
}

export function safeParseCatalogSnapshot(input: unknown) {
  return CatalogSnapshotSchema.safeParse(input);
}

export function parseEpisodePack(input: unknown): EpisodePack {
  return EpisodePackSchema.parse(input);
}

export function safeParseEpisodePack(input: unknown) {
  return EpisodePackSchema.safeParse(input);
}

export function parsePackProvenance(input: unknown): PackProvenance {
  return PackProvenanceSchema.parse(input);
}

export function safeParsePackProvenance(input: unknown) {
  return PackProvenanceSchema.safeParse(input);
}

export function parsePlayerProfile(input: unknown): PlayerProfile {
  return PlayerProfileSchema.parse(input);
}

export function safeParsePlayerProfile(input: unknown) {
  return PlayerProfileSchema.safeParse(input);
}

export function parseSessionStats(input: unknown): SessionStats {
  return SessionStatsSchema.parse(input);
}

export function safeParseSessionStats(input: unknown) {
  return SessionStatsSchema.safeParse(input);
}
