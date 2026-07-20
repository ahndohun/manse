import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { ZodTypeAny } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { CatalogBaseSchema, CatalogSnapshotBaseSchema } from "../src/catalog.js";
import { EpisodePackBaseSchema } from "../src/episode.js";
import { ManseGameManifestBaseSchema } from "../src/manifest.js";
import { PackProvenanceBaseSchema } from "../src/provenance.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(packageRoot, "json-schema");

const exportsToWrite: Array<{
  filename: string;
  id: string;
  name: string;
  schema: ZodTypeAny;
  comment?: string;
}> = [
  {
    filename: "manse-game-v1.schema.json",
    id: "https://manse.dev/schema/manse-game-v1.schema.json",
    name: "ManseGameManifestV1",
    schema: ManseGameManifestBaseSchema,
    comment: "Runtime parsing also enforces unique and complete locale sets.",
  },
  {
    filename: "catalog-v1.schema.json",
    id: "https://manse.dev/schema/catalog-v1.schema.json",
    name: "ManseCatalogV1",
    schema: CatalogBaseSchema,
    comment: "Runtime parsing also enforces unique manifest URLs.",
  },
  {
    filename: "catalog-snapshot-v1.schema.json",
    id: "https://manse.dev/schema/catalog-snapshot-v1.schema.json",
    name: "ManseCatalogSnapshotV1",
    schema: CatalogSnapshotBaseSchema,
    comment: "Runtime parsing also enforces unique ids, slugs, URLs, and same-origin manifests.",
  },
  {
    filename: "manse-pack-v1.schema.json",
    id: "https://manse.dev/schema/manse-pack-v1.schema.json",
    name: "ManseEpisodePackV1",
    schema: EpisodePackBaseSchema,
    comment: "Use @manse/schema at runtime for graph, reference, locale, and terminal-reachability checks.",
  },
  {
    filename: "provenance-v1.schema.json",
    id: "https://manse.dev/schema/provenance-v1.schema.json",
    name: "MansePackProvenanceV1",
    schema: PackProvenanceBaseSchema,
    comment: "Use validatePackProvenance to enforce an exact 1:1 projection of pack assets.",
  },
];

await mkdir(outputDirectory, { recursive: true });
for (const item of exportsToWrite) {
  const jsonSchema = zodToJsonSchema(item.schema, {
    name: item.name,
    target: "jsonSchema7",
    $refStrategy: "root",
  });
  const document = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: item.id,
    ...(item.comment ? { $comment: item.comment } : {}),
    ...jsonSchema,
  };
  await writeFile(resolve(outputDirectory, item.filename), `${JSON.stringify(document, null, 2)}\n`, "utf8");
}
