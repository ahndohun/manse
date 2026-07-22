import type { GameUiLocale } from "../game-config";
import type { MissionState } from "./mission";
import type { StageSize } from "./stage";
import { roundedRect, wrapText } from "./hud";

const FONT = '"Avenir Next", Avenir, "Segoe UI", system-ui, sans-serif';
const COPY = {
  en: { wave: "NEW CHAPTER", victory: "MISSION COMPLETE", body: "The world changed because you moved.", score: "FINAL SCORE" },
  ko: { wave: "새로운 장면", victory: "임무 완료", body: "당신의 움직임으로 세상이 달라졌어요.", score: "최종 점수" },
} as const;

export function drawSceneBanner(
  context: CanvasRenderingContext2D,
  size: StageSize,
  mission: MissionState,
  locale: GameUiLocale,
  nowMs: number,
  reducedMotion: boolean,
): void {
  const age = nowMs - mission.sceneChangedAtMs;
  if (mission.sceneChangedAtMs === 0 || age < 0 || age > 1_350 || mission.outcome === "victory") return;
  const alpha = reducedMotion ? (age < 900 ? 1 : 0) : Math.sin(Math.min(1, age / 1_350) * Math.PI);
  context.save();
  context.globalAlpha = alpha;
  const width = Math.min(420, size.width * 0.58);
  const x = (size.width - width) / 2;
  const y = size.height * 0.22;
  context.fillStyle = "rgba(4,15,25,.88)";
  roundedRect(context, x, y, width, 74, 16);
  context.fill();
  context.fillStyle = "#ffffff";
  context.font = `800 ${Math.max(18, size.width * 0.025)}px ${FONT}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(COPY[locale].wave, size.width / 2, y + 28);
  context.fillStyle = "rgba(255,255,255,.7)";
  context.font = `650 ${Math.max(11, size.width * 0.012)}px ${FONT}`;
  context.fillText((mission.sceneId ?? "").toUpperCase(), size.width / 2, y + 52);
  context.restore();
}

export function drawOutcome(
  context: CanvasRenderingContext2D,
  size: StageSize,
  mission: MissionState,
  locale: GameUiLocale,
  nowMs: number,
  reducedMotion: boolean,
): void {
  if (mission.outcome !== "victory") return;
  const copy = COPY[locale];
  const pulse = reducedMotion ? 1 : 1 + Math.sin(nowMs / 320) * 0.018;
  context.save();
  context.fillStyle = "rgba(2, 9, 16, .8)";
  context.fillRect(0, 0, size.width, size.height);
  context.translate(size.width / 2, size.height / 2);
  context.scale(pulse, pulse);
  const width = Math.min(610, size.width * 0.78);
  const height = Math.min(330, size.height * 0.56);
  context.fillStyle = "rgba(12, 34, 48, .96)";
  roundedRect(context, -width / 2, -height / 2, width, height, 26);
  context.fill();
  context.strokeStyle = "rgba(198,239,112,.78)";
  context.lineWidth = 3;
  context.stroke();
  context.fillStyle = "#c6ef70";
  context.font = `900 ${Math.max(28, size.width * 0.05)}px ${FONT}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(copy.victory, 0, -height * 0.23, width - 40);
  context.fillStyle = "#ffffff";
  context.font = `650 ${Math.max(15, size.width * 0.018)}px ${FONT}`;
  wrapText(context, copy.body, 0, -height * 0.02, width - 72, 24, 2);
  context.fillStyle = "rgba(255,255,255,.62)";
  context.font = `750 ${Math.max(11, size.width * 0.012)}px ${FONT}`;
  context.fillText(copy.score, 0, height * 0.18);
  context.fillStyle = "#ffffff";
  context.font = `900 ${Math.max(30, size.width * 0.045)}px ${FONT}`;
  context.fillText(String(mission.score), 0, height * 0.32);
  context.restore();
}
