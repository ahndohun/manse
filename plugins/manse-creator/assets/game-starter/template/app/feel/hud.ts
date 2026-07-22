import type { RuntimeRenderFrame, RuntimeTarget } from "@manse/runtime-web";
import type { GameUiLocale } from "../game-config";
import type { MissionState } from "./mission";
import type { StageSize } from "./stage";

const FONT = '"Avenir Next", Avenir, "Segoe UI", system-ui, sans-serif';

const COPY = {
  en: { mission: "MISSION", score: "SCORE", progress: "PROGRESS", streak: "STREAK", ready: "MOVE TO PLAY" },
  ko: { mission: "임무", score: "점수", progress: "진행", streak: "연속", ready: "움직여서 시작" },
} as const;

export function drawHud(
  context: CanvasRenderingContext2D,
  size: StageSize,
  frame: RuntimeRenderFrame,
  mission: MissionState,
  locale: GameUiLocale,
): void {
  const copy = COPY[locale];
  const margin = Math.max(14, size.width * 0.022);
  const panelWidth = Math.min(310, size.width * 0.38);
  const panelHeight = Math.max(72, size.height * 0.105);
  context.save();
  context.fillStyle = "rgba(4, 15, 25, .78)";
  roundedRect(context, margin, margin, panelWidth, panelHeight, 14);
  context.fill();
  context.strokeStyle = "rgba(255,255,255,.18)";
  context.lineWidth = 1.5;
  context.stroke();

  context.fillStyle = "rgba(255,255,255,.64)";
  context.font = `700 ${Math.max(10, size.width * 0.011)}px ${FONT}`;
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillText(copy.mission, margin + 16, margin + 12);
  context.fillStyle = "#ffffff";
  context.font = `800 ${Math.max(17, size.width * 0.021)}px ${FONT}`;
  const label = frame.challenge?.stepLabel ?? mission.sceneId ?? copy.ready;
  context.fillText(label.toUpperCase(), margin + 16, margin + 31, panelWidth - 32);

  const rightWidth = Math.min(270, size.width * 0.34);
  const rightX = size.width - margin - rightWidth;
  context.fillStyle = "rgba(4, 15, 25, .78)";
  roundedRect(context, rightX, margin, rightWidth, panelHeight, 14);
  context.fill();
  context.strokeStyle = "rgba(255,255,255,.18)";
  context.stroke();
  const units = frame.challenge === null || frame.challenge === undefined
    ? `${mission.completedUnits} / ${mission.totalUnits || "—"}`
    : `${frame.challenge.completedUnits} / ${frame.challenge.totalUnits}`;
  const columns = [
    [copy.score, String(mission.score)],
    [copy.progress, units],
    [copy.streak, `×${Math.max(1, mission.streak)}`],
  ] as const;
  columns.forEach(([name, value], index) => {
    const x = rightX + 14 + index * ((rightWidth - 28) / 3);
    context.fillStyle = "rgba(255,255,255,.58)";
    context.font = `700 ${Math.max(9, size.width * 0.0095)}px ${FONT}`;
    context.fillText(name, x, margin + 13);
    context.fillStyle = "#ffffff";
    context.font = `850 ${Math.max(17, size.width * 0.019)}px ${FONT}`;
    context.fillText(value, x, margin + 34);
  });
  context.restore();
}

export function drawCaption(
  context: CanvasRenderingContext2D,
  size: StageSize,
  caption: string,
  targets: readonly RuntimeTarget[],
): void {
  const width = Math.min(size.width * 0.72, 660);
  const height = 56;
  const x = (size.width - width) / 2;
  const preferredY = size.height - height - 22;
  const overlaps = targets.some((target) => {
    const tx = target.x * size.width;
    const ty = target.y * size.height;
    return !target.hit && tx > x - 48 && tx < x + width + 48 && ty > preferredY - 70;
  });
  const y = overlaps ? size.height * 0.16 : preferredY;
  context.save();
  context.fillStyle = "rgba(2, 10, 18, .86)";
  roundedRect(context, x, y, width, height, 14);
  context.fill();
  context.strokeStyle = "rgba(255,255,255,.2)";
  context.stroke();
  context.fillStyle = "#ffffff";
  context.font = `700 ${Math.max(14, size.width * 0.016)}px ${FONT}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  wrapText(context, caption, size.width / 2, y + height / 2, width - 28, 20, 2);
  context.restore();
}

export function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): void {
  const tokens = text.trim().split(/\s+/u);
  const lines: string[] = [];
  let current = "";
  for (const token of tokens) {
    const next = current === "" ? token : `${current} ${token}`;
    if (current !== "" && context.measureText(next).width > maxWidth) {
      lines.push(current);
      current = token;
      if (lines.length === maxLines - 1) break;
    } else {
      current = next;
    }
  }
  if (current !== "" && lines.length < maxLines) lines.push(current);
  const firstY = centerY - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => context.fillText(line, centerX, firstY + index * lineHeight, maxWidth));
}

export function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}
