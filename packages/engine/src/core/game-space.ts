import type { Point2 } from "../types.js";

export interface NormalizedBox {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}

export interface GameSpaceOptions {
  readonly width: number;
  readonly height: number;
  readonly mirrorX?: boolean;
  readonly reachBox?: NormalizedBox;
  readonly clamp?: boolean;
}

const FULL_FRAME: NormalizedBox = { x0: 0, y0: 0, x1: 1, y1: 1 };

/** Maps calibrated normalized camera coordinates to renderer stage coordinates. */
export class GameSpace {
  readonly width: number;
  readonly height: number;
  readonly mirrorX: boolean;
  readonly reachBox: NormalizedBox;
  readonly clamp: boolean;

  constructor(options: GameSpaceOptions) {
    assertPositive(options.width, "width");
    assertPositive(options.height, "height");
    assertBox(options.reachBox ?? FULL_FRAME);
    this.width = options.width;
    this.height = options.height;
    this.mirrorX = options.mirrorX ?? false;
    this.reachBox = { ...(options.reachBox ?? FULL_FRAME) };
    this.clamp = options.clamp ?? true;
  }

  normalizedToStage(point: Point2): Point2 {
    assertPoint(point);
    const cameraX = this.mirrorX ? 1 - point.x : point.x;
    const nx = (cameraX - this.reachBox.x0) / (this.reachBox.x1 - this.reachBox.x0);
    const ny = (point.y - this.reachBox.y0) / (this.reachBox.y1 - this.reachBox.y0);
    return {
      x: this.width * (this.clamp ? clamp01(nx) : nx),
      y: this.height * (this.clamp ? clamp01(ny) : ny),
    };
  }

  stageToNormalized(point: Point2): Point2 {
    assertPoint(point);
    const sx = this.clamp ? clamp01(point.x / this.width) : point.x / this.width;
    const sy = this.clamp ? clamp01(point.y / this.height) : point.y / this.height;
    const cameraX = this.reachBox.x0 + sx * (this.reachBox.x1 - this.reachBox.x0);
    return {
      x: this.mirrorX ? 1 - cameraX : cameraX,
      y: this.reachBox.y0 + sy * (this.reachBox.y1 - this.reachBox.y0),
    };
  }

  withSize(width: number, height: number): GameSpace {
    return new GameSpace({ ...this, width, height });
  }
}

function assertBox(box: NormalizedBox): void {
  if (![box.x0, box.y0, box.x1, box.y1].every(Number.isFinite)) {
    throw new RangeError("reachBox coordinates must be finite");
  }
  if (box.x0 < 0 || box.y0 < 0 || box.x1 > 1 || box.y1 > 1 || box.x0 >= box.x1 || box.y0 >= box.y1) {
    throw new RangeError("reachBox must be a non-degenerate normalized box");
  }
}

function assertPoint(point: Point2): void {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    throw new RangeError("point coordinates must be finite");
  }
}

function assertPositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${label} must be positive`);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
