import { createHash } from "node:crypto";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const destinationRoot = resolve(process.cwd(), process.argv[2] ?? "public");
const modelSource = resolve(repositoryRoot, "packages/runtime-web/assets/models");
const wasmSource = resolve(repositoryRoot, "node_modules/@mediapipe/tasks-vision/wasm");

const models = [
  ["pose_landmarker_lite.task", "59929e1d1ee95287735ddd833b19cf4ac46d29bc7afddbbf6753c459690d574a"],
  ["pose_landmarker_full.task", "4eaa5eb7a98365221087693fcc286334cf0858e2eb6e15b506aa4a7ecdcec4ad"],
];
const wasmFiles = [
  "vision_wasm_internal.js",
  "vision_wasm_internal.wasm",
  "vision_wasm_nosimd_internal.js",
  "vision_wasm_nosimd_internal.wasm",
];

await mkdir(resolve(destinationRoot, "models"), { recursive: true });
await mkdir(resolve(destinationRoot, "vendor/mediapipe/wasm"), { recursive: true });
await mkdir(resolve(destinationRoot, "playground"), { recursive: true });

for (const [filename, expectedHash] of models) {
  const source = resolve(modelSource, filename);
  const digest = createHash("sha256").update(await readFile(source)).digest("hex");
  if (digest !== expectedHash) throw new Error(`Integrity mismatch for ${filename}.`);
  await cp(source, resolve(destinationRoot, "models", filename));
}

for (const filename of wasmFiles) {
  await cp(resolve(wasmSource, filename), resolve(destinationRoot, "vendor/mediapipe/wasm", filename));
}

await writeFile(resolve(destinationRoot, "playground/success.wav"), createToneWav(660, 180));
await writeFile(resolve(destinationRoot, "playground/encourage.wav"), createToneWav(440, 140));

console.log(`Synced local MediaPipe runtime assets to ${destinationRoot}`);

function createToneWav(frequency, durationMs) {
  const sampleRate = 22_050;
  const sampleCount = Math.round(sampleRate * durationMs / 1_000);
  const dataSize = sampleCount * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVEfmt ", 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let index = 0; index < sampleCount; index += 1) {
    const envelope = Math.sin(Math.PI * index / Math.max(1, sampleCount - 1)) ** 2;
    const sample = Math.sin(2 * Math.PI * frequency * index / sampleRate) * envelope * 0.2;
    buffer.writeInt16LE(Math.round(sample * 32_767), 44 + index * 2);
  }
  return buffer;
}
