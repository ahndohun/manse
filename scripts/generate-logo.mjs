#!/usr/bin/env node
// Generates playful Manse logo candidates with the OpenAI Images API (gpt-image-2).
// Usage: OPENAI_API_KEY=sk-... node scripts/generate-logo.mjs [count]
// Output: apps/hub/public/brand/manse-logo-<n>.png (1024x1024, transparent background)

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(repoRoot, "apps/hub/public/brand");
const count = Math.min(Number(process.argv[2] ?? 3), 4);
const model = process.env.MANSE_LOGO_MODEL ?? "gpt-image-2";

const prompt = [
  "Playful flat vector logo mark for 'Manse', an open-source browser motion-game platform for families.",
  "A simple, bold, geometric app-icon: a joyful abstract character mid-jump with both arms raised high in celebration.",
  "Rounded shapes, slight tilt for energy, sticker-like charm.",
  "Colors: coral red #FF6448, lime green #C9F45D, sunny yellow #FFD859, near-black ink #171A18.",
  "Flat colors only, no gradients, no text, no letters, transparent background.",
  "Style: modern playful brand mark, like a friendly toy, clean enough to read at 32px.",
].join(" ");

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY is not set. Export it, then re-run this script.");
  process.exit(1);
}

const response = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
  body: JSON.stringify({
    model,
    prompt,
    n: count,
    size: "1024x1024",
    background: "transparent",
    output_format: "png",
    quality: "high",
  }),
});

if (!response.ok) {
  console.error(`Image API error ${response.status}: ${await response.text()}`);
  process.exit(1);
}

const payload = await response.json();
await mkdir(outDir, { recursive: true });
let index = 0;
for (const image of payload.data ?? []) {
  index += 1;
  const file = join(outDir, `manse-logo-${index}.png`);
  await writeFile(file, Buffer.from(image.b64_json, "base64"));
  console.log(`Saved ${file}`);
}
console.log(`Done. Pick a favorite, rename it manse-logo.png, and wire it into SiteHeader.`);
