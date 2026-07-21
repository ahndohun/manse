export const colors = {
  bg: '#FFFDF8',
  bgAlt: '#F3ECDF',
  panel: '#FFF6EF',
  ink: '#1F1714',
  inkSoft: '#4F544E',
  inkFaint: '#7A7E78',
  coral: '#FF6448',
  coralSoft: '#FF765F',
  yellow: '#FFD859',
  sage: '#AEBBB2',
  line: '#C9C5BA',
  terminalBg: '#1F1714',
  terminalText: '#F3ECDF',
  ok: '#3E7A4E',
  fail: '#C93A2B',
};

export const fonts = {
  display:
    '"Avenir Next", "Helvetica Neue", Helvetica, "Segoe UI", Arial, sans-serif',
  mono: '"SF Mono", Menlo, Consolas, "Courier New", monospace',
};

export const FPS = 30;

// Measured voiceover durations in seconds (public/audio/scene-N.wav).
export const VO_SECONDS = [
  11.6, 14.35, 14.68, 15.66, 17.07, 16.77, 14.18, 13.99, 15.67,
];

// Scene length = voiceover + breathing room (plus a longer hold on the end card).
export const SCENE_FRAMES = VO_SECONDS.map((s, i) =>
  Math.round((s + (i === VO_SECONDS.length - 1 ? 2.2 : 1.3)) * FPS),
);

export const TOTAL_FRAMES = SCENE_FRAMES.reduce((a, b) => a + b, 0);
