import type { DeviceTier } from "@manse/runtime-web";

export interface StageSize {
  readonly width: number;
  readonly height: number;
  readonly dpr: number;
}

export interface StagePalette {
  readonly sky: string;
  readonly horizon: string;
  readonly ground: string;
  readonly accent: string;
}

export function resizeStage(element: HTMLElement, canvas: HTMLCanvasElement, tier: DeviceTier): StageSize {
  const width = Math.max(1, element.clientWidth || 960);
  const height = Math.max(1, element.clientHeight || 620);
  const deviceRatio = element.ownerDocument.defaultView?.devicePixelRatio ?? 1;
  const tierLimit = tier === "S" || tier === "A" ? 2 : tier === "B" ? 1.5 : 1;
  const dpr = Math.min(deviceRatio, tierLimit);
  const pixelWidth = Math.round(width * dpr);
  const pixelHeight = Math.round(height * dpr);
  if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
  return { width, height, dpr };
}

/** Draw the local camera at full strength. Never put the debug/default renderer beneath it. */
export function drawVideoCover(
  context: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  size: StageSize,
  mirror: boolean,
): void {
  const sourceWidth = Math.max(1, video.videoWidth || 1280);
  const sourceHeight = Math.max(1, video.videoHeight || 720);
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = size.width / size.height;
  let sx = 0;
  let sy = 0;
  let sw = sourceWidth;
  let sh = sourceHeight;
  if (sourceRatio > targetRatio) {
    sw = sourceHeight * targetRatio;
    sx = (sourceWidth - sw) / 2;
  } else {
    sh = sourceWidth / targetRatio;
    sy = (sourceHeight - sh) / 2;
  }
  context.save();
  if (mirror) {
    context.translate(size.width, 0);
    context.scale(-1, 1);
  }
  context.drawImage(video, sx, sy, sw, sh, 0, 0, size.width, size.height);
  context.restore();
}

export function drawCameraGrade(context: CanvasRenderingContext2D, size: StageSize): void {
  context.fillStyle = "rgba(5, 18, 30, .14)";
  context.fillRect(0, 0, size.width, size.height);
  const vignette = context.createRadialGradient(
    size.width * 0.5, size.height * 0.44, size.width * 0.08,
    size.width * 0.5, size.height * 0.48, size.width * 0.76,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(0.72, "rgba(3,12,20,.08)");
  vignette.addColorStop(1, "rgba(3,12,20,.58)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, size.width, size.height);
}

/** Simulator mode gets a painted world, never an empty/debug canvas. Replace details with the game's fiction. */
export function drawPaintedSet(
  context: CanvasRenderingContext2D,
  size: StageSize,
  palette: StagePalette,
  nowMs: number,
  reducedMotion: boolean,
): void {
  const sky = context.createLinearGradient(0, 0, 0, size.height);
  sky.addColorStop(0, palette.sky);
  sky.addColorStop(0.62, palette.horizon);
  sky.addColorStop(1, palette.ground);
  context.fillStyle = sky;
  context.fillRect(0, 0, size.width, size.height);

  const glow = context.createRadialGradient(size.width * 0.72, size.height * 0.24, 0, size.width * 0.72, size.height * 0.24, size.width * 0.4);
  glow.addColorStop(0, `${palette.accent}55`);
  glow.addColorStop(1, `${palette.accent}00`);
  context.fillStyle = glow;
  context.fillRect(0, 0, size.width, size.height);

  context.save();
  context.globalAlpha = 0.18;
  context.fillStyle = palette.accent;
  const drift = reducedMotion ? 0 : Math.sin(nowMs / 1_100) * size.width * 0.012;
  for (let index = 0; index < 7; index += 1) {
    const x = size.width * (0.08 + index * 0.15) + drift * (index % 2 === 0 ? 1 : -1);
    const y = size.height * (0.2 + (index % 3) * 0.11);
    context.beginPath();
    context.arc(x, y, Math.max(3, size.width * 0.005), 0, Math.PI * 2);
    context.fill();
  }
  context.restore();

  context.fillStyle = "rgba(3, 12, 20, .34)";
  context.fillRect(0, size.height * 0.78, size.width, size.height * 0.22);
  context.strokeStyle = "rgba(255,255,255,.11)";
  context.lineWidth = 1.5;
  for (let index = -3; index <= 3; index += 1) {
    context.beginPath();
    context.moveTo(size.width * 0.5, size.height * 0.78);
    context.lineTo(size.width * (0.5 + index * 0.24), size.height);
    context.stroke();
  }
}
