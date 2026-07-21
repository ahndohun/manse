import {execFileSync} from 'node:child_process';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const audioDir = path.join(here, 'public', 'audio');
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    'OPENAI_API_KEY is required to generate the release voiceover with gpt-audio-1.5.',
  );
}

const narration = [
  'This is Manse: an open-source engine and publishing ecosystem for camera-based active games. A normal link turns a phone, computer, tablet, or compatible display into the play surface.',
  'Closed motion-game platforms own the format and storefront. Manse opens the engine, declarative game format, creator tools, and catalog. Players need no Manse account, controller, subscription, or runtime AI service.',
  'For creators, Codex is the studio. I describe a game in plain language. The Manse Creator plugin uses GPT 5.6 to plan movement, accessibility, original assets, and a versioned project before it writes files.',
  'The output is not opaque code from a central service. It is a creator-owned Site, a strict data-only pack, and auditable provenance. Seven workflows cover creation, assets, preview, validation, remixing, publishing, and Showcase submission.',
  'The simulator is the fastest judge path and uses the same engine session as camera play. The public catalog includes touch, dodge, freeze, squat, and jump games. Camera permission starts only after an explicit action, and Manse never transmits camera frames or pose data.',
  'One contract drives the schema, validator, runtime loader, starter, publisher, and catalog. Validation checks paths, accessibility, licenses, provenance, tests, types, and the production build, and intentionally invalid packs must fail.',
  'With my approval, Codex packages the self-contained game and publishes an independent public Site. Runtime code, models, WebAssembly, packs, and media are bundled; play needs no API key or external runtime C D N.',
  "The Showcase receives only a public manifest U R L. C I validates it, a maintainer approves it, and the catalog links to the creator's Site. Manse never uploads, proxies, frames, or executes that third-party game.",
  'Codex and GPT 5.6 built the platform and power the creator workflow: GPT 5.6 is the factory; the browser is the product. Manse is M I T licensed, self-hostable, privacy-first, and ready for creators to extend.',
];

const voice = process.env.OPENAI_TTS_VOICE || 'marin';
const model = process.env.OPENAI_TTS_MODEL || 'gpt-audio-1.5';
const instructions = [
  'Read this as a confident product founder presenting a polished hackathon demo.',
  'Use a warm, natural, contemporary American English voice.',
  'Keep the pace energetic but intelligible, with restrained emphasis and short pauses between clauses.',
  'Avoid announcer theatrics, exaggerated enthusiasm, and synthetic-sounding cadence.',
].join(' ');

await mkdir(audioDir, {recursive: true});

const durations = [];
for (const [index, text] of narration.entries()) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      modalities: ['text', 'audio'],
      audio: {voice, format: 'wav'},
      messages: [
        {role: 'system', content: instructions},
        {role: 'user', content: text},
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(
      `OpenAI audio generation failed for scene ${index + 1}: ${response.status} ${await response.text()}`,
    );
  }

  const payload = await response.json();
  const encoded = payload.choices?.[0]?.message?.audio?.data;
  if (!encoded) {
    throw new Error(`OpenAI returned no audio data for scene ${index + 1}.`);
  }

  const output = path.join(audioDir, `scene-${index + 1}.wav`);
  await writeFile(output, Buffer.from(encoded, 'base64'));
  const metadata = execFileSync('afinfo', [output], {encoding: 'utf8'});
  const match = metadata.match(/estimated duration: ([0-9.]+)/);
  if (!match) {
    throw new Error(`Could not measure ${output}.`);
  }
  durations.push(Number(Number(match[1]).toFixed(2)));
  process.stdout.write(`scene-${index + 1}: ${durations.at(-1)}s\n`);
}

await writeFile(
  path.join(here, 'audio-durations.json'),
  `${JSON.stringify(durations, null, 2)}\n`,
);

process.stdout.write(
  `Generated ${narration.length} scenes with ${model}/${voice}. Update VO_SECONDS in src/theme.ts from audio-durations.json, then render.\n`,
);
