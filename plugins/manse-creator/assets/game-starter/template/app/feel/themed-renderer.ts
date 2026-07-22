import type {
  RendererFactory,
  RendererFactoryOptions,
  RuntimeLandmark,
  RuntimeRenderFrame,
  RuntimeRenderer,
  RuntimeTarget,
  ChallengeZoneOverlay,
} from "@manse/runtime-web";
import { GAME_CONFIG, getThemeColor, type GameUiLocale } from "../game-config";
import { drawCaption, drawHud, roundedRect } from "./hud";
import type { MissionState } from "./mission";
import { drawOutcome, drawSceneBanner } from "./outcome";
import { ParticleSystem } from "./particles";
import { drawCameraGrade, drawPaintedSet, drawVideoCover, resizeStage, type StageSize } from "./stage";

export interface ThemeHooks {
  drawSet?(context: CanvasRenderingContext2D, size: StageSize, frame: RuntimeRenderFrame): void;
  drawTarget?(context: CanvasRenderingContext2D, size: StageSize, target: RuntimeTarget, frame: RuntimeRenderFrame): void;
  drawZoneObject?(context: CanvasRenderingContext2D, size: StageSize, zone: ChallengeZoneOverlay, frame: RuntimeRenderFrame): void;
  drawAvatarProp?(context: CanvasRenderingContext2D, size: StageSize, landmarks: readonly RuntimeLandmark[], frame: RuntimeRenderFrame): void;
  onRepetition?(count: number): void;
}

export interface ThemedRendererOptions {
  readonly mission: MissionState;
  readonly locale: GameUiLocale;
  readonly hooks?: ThemeHooks;
}

/** Full replacement renderer: no createDefaultRenderer substrate, debug circles, zones, or skeleton. */
export function createThemedRendererFactory(config: ThemedRendererOptions): RendererFactory {
  return (options) => new ThemedRenderer(options, config);
}

class ThemedRenderer implements RuntimeRenderer {
  readonly kind = "canvas2d" as const;
  readonly element: HTMLDivElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly particles = new ParticleSystem();
  private readonly seenHits = new Set<string>();
  private previousRepetitions = 0;
  private destroyed = false;

  constructor(private readonly options: RendererFactoryOptions, private readonly config: ThemedRendererOptions) {
    this.element = options.document.createElement("div");
    this.element.dataset.manseRenderer = "creator-themed-game";
    this.element.setAttribute("role", "img");
    this.element.setAttribute("aria-label", `${GAME_CONFIG.slug} motion game stage`);
    Object.assign(this.element.style, {
      position: "relative", width: "100%", height: "100%", minHeight: "320px",
      overflow: "hidden", background: getThemeColor("background"), touchAction: "none",
    });
    this.canvas = options.document.createElement("canvas");
    this.canvas.setAttribute("aria-hidden", "true");
    Object.assign(this.canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%" });
    const context = this.canvas.getContext("2d", { alpha: false });
    if (context === null) throw new Error("Canvas 2D is unavailable.");
    this.context = context;
    this.element.append(this.canvas);
    options.container.append(this.element);
  }

  render(frame: RuntimeRenderFrame): void {
    if (this.destroyed) return;
    const size = resizeStage(this.element, this.canvas, frame.tier);
    const { context } = this;
    context.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
    context.clearRect(0, 0, size.width, size.height);

    if (frame.video !== null && frame.video.readyState >= 2) {
      drawVideoCover(context, frame.video, size, frame.mirror);
      drawCameraGrade(context, size);
    } else if (this.config.hooks?.drawSet !== undefined) {
      this.config.hooks.drawSet(context, size, frame);
    } else {
      drawPaintedSet(context, size, {
        sky: getThemeColor("background"), horizon: getThemeColor("surface"),
        ground: "#06121d", accent: getThemeColor("accent"),
      }, frame.timestampMs, frame.reducedStimulation);
    }

    const landmarks = strongestLandmarks(frame);
    if (this.config.hooks?.drawAvatarProp !== undefined) this.config.hooks.drawAvatarProp(context, size, landmarks, frame);
    else drawAvatarProp(context, size, landmarks);

    for (const zone of frame.challenge?.zones ?? []) {
      if (this.config.hooks?.drawZoneObject !== undefined) this.config.hooks.drawZoneObject(context, size, zone, frame);
      else drawZoneObject(context, size, zone, frame.timestampMs, frame.reducedStimulation);
    }
    for (const target of frame.targets) {
      if (this.config.hooks?.drawTarget !== undefined) this.config.hooks.drawTarget(context, size, target, frame);
      else drawTarget(context, size, target, frame.timestampMs, frame.reducedStimulation);
      if (target.hit && !this.seenHits.has(target.id)) {
        this.seenHits.add(target.id);
        this.particles.burst(target.x * size.width, target.y * size.height, frame.timestampMs, target.id, getThemeColor("highlight"), frame.reducedStimulation);
      }
    }
    this.handleRepetition(frame);
    this.particles.draw(context, size, frame.timestampMs, frame.reducedStimulation);
    drawHud(context, size, frame, this.config.mission, this.config.locale);
    drawSceneBanner(context, size, this.config.mission, this.config.locale, frame.timestampMs, frame.reducedStimulation);
    if (frame.caption !== null && this.config.mission.outcome !== "victory") drawCaption(context, size, frame.caption, frame.targets);
    drawOutcome(context, size, this.config.mission, this.config.locale, frame.timestampMs, frame.reducedStimulation);
  }

  destroy(): void {
    this.destroyed = true;
    this.particles.clear();
    this.seenHits.clear();
    this.element.remove();
  }

  private handleRepetition(frame: RuntimeRenderFrame): void {
    const count = frame.challenge?.repetitionCount ?? frame.challenge?.completedUnits ?? 0;
    if (count <= this.previousRepetitions) return;
    this.previousRepetitions = count;
    this.config.hooks?.onRepetition?.(count);
  }
}

function strongestLandmarks(frame: RuntimeRenderFrame): readonly RuntimeLandmark[] {
  let strongest: readonly RuntimeLandmark[] = [];
  let score = -Infinity;
  for (const pose of frame.poseFrame?.poses ?? []) {
    if (pose.score > score) {
      score = pose.score;
      strongest = pose.landmarks;
    }
  }
  return strongest;
}

function drawTarget(context: CanvasRenderingContext2D, size: StageSize, target: RuntimeTarget, nowMs: number, reduced: boolean): void {
  // CREATOR HOOK: replace this seal with the fantasy object (fruit, fire, star, drum, etc.).
  const x = target.x * size.width;
  const y = target.y * size.height;
  const radius = Math.max(38, target.radius * Math.min(size.width, size.height));
  const pulse = reduced ? 1 : 1 + Math.sin(nowMs / 260 + target.x * 9) * 0.05;
  context.save();
  context.translate(x, y);
  context.scale(pulse, pulse);
  context.fillStyle = target.hit ? "rgba(198,239,112,.34)" : "rgba(8,25,37,.88)";
  context.strokeStyle = target.hit ? getThemeColor("highlight") : getThemeColor("accent");
  context.lineWidth = Math.max(4, radius * 0.08);
  context.beginPath();
  for (let point = 0; point < 10; point += 1) {
    const angle = -Math.PI / 2 + point * Math.PI / 5;
    const r = point % 2 === 0 ? radius : radius * 0.54;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (point === 0) context.moveTo(px, py); else context.lineTo(px, py);
  }
  context.closePath();
  context.fill();
  context.stroke();
  context.strokeStyle = "rgba(255,255,255,.78)";
  context.lineWidth = Math.max(5, radius * 0.1);
  context.beginPath();
  context.arc(0, 0, radius * 0.74, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (target.hit ? 1 : target.dwellProgress));
  context.stroke();
  context.restore();
}

function drawZoneObject(context: CanvasRenderingContext2D, size: StageSize, zone: ChallengeZoneOverlay, nowMs: number, reduced: boolean): void {
  // CREATOR HOOK: draw a world object at this zone, not a detector rectangle.
  const x = ((zone.box.x0 + zone.box.x1) / 2) * size.width;
  const y = ((zone.box.y0 + zone.box.y1) / 2) * size.height;
  const width = Math.max(64, (zone.box.x1 - zone.box.x0) * size.width * 0.72);
  const height = Math.max(64, (zone.box.y1 - zone.box.y0) * size.height * 0.72);
  const lift = reduced ? 0 : Math.sin(nowMs / 330 + x) * 4;
  context.save();
  context.translate(x, y + lift);
  context.fillStyle = zone.state === "done" ? "rgba(198,239,112,.76)" : zone.state === "danger" ? "rgba(255,96,86,.78)" : "rgba(255,255,255,.16)";
  context.strokeStyle = zone.state === "active" ? getThemeColor("accent") : "rgba(255,255,255,.6)";
  context.lineWidth = 4;
  roundedRect(context, -width / 2, -height / 2, width, height, Math.min(24, width * 0.18));
  context.fill();
  context.stroke();
  context.restore();
}

function drawAvatarProp(context: CanvasRenderingContext2D, size: StageSize, landmarks: readonly RuntimeLandmark[]): void {
  // Simulator moves one hand cluster. Anchor props to the strongest visible wrist, never the two-wrist midpoint.
  const wrists = landmarks.filter((point) => (point.name === "left_wrist" || point.name === "right_wrist") && Math.min(point.visibility, point.presence) >= 0.35);
  const wrist = wrists.sort((left, right) => Math.min(right.visibility, right.presence) - Math.min(left.visibility, left.presence))[0];
  if (wrist === undefined) return;
  const x = wrist.x * size.width;
  const y = wrist.y * size.height;
  context.save();
  context.translate(x, y);
  context.fillStyle = getThemeColor("highlight");
  context.strokeStyle = "rgba(4,15,25,.88)";
  context.lineWidth = 4;
  roundedRect(context, -34, -20, 68, 40, 14);
  context.fill();
  context.stroke();
  context.restore();
}
