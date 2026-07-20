import type { EngineEvent, Point2 } from "../types.js";

export type TargetLimb = "hands" | "feet" | "any";
export type LimbKind = "hand" | "foot";

export interface LimbPoint {
  readonly id: string;
  readonly kind: LimbKind;
  readonly side: "left" | "right";
  readonly point: Point2;
  readonly confidence: number;
}

export interface TargetDefinition {
  readonly id: string;
  readonly center: Point2;
  readonly radius: number;
  readonly limb: TargetLimb;
  readonly dwellMs: number;
}

export interface TargetDwellOptions {
  readonly exitRadiusMultiplier: number;
  readonly dropoutGraceMs: number;
  readonly minimumConfidence: number;
  readonly radiusMultiplier?: number;
}

export interface TargetStateSnapshot {
  readonly id: string;
  readonly inside: boolean;
  readonly hit: boolean;
  readonly dwellMs: number;
  readonly dwellProgress: number;
}

export interface TargetDwellSnapshot {
  readonly hitCount: number;
  readonly targets: readonly TargetStateSnapshot[];
  readonly events: readonly EngineEvent[];
}

interface MutableTargetState {
  definition: TargetDefinition;
  inside: boolean;
  hit: boolean;
  dwellMs: number;
  dropoutMs: number;
}

/** Stateful but deterministic circle hit testing with dwell and spatial hysteresis. */
export class TargetDwellSystem {
  private readonly states = new Map<string, MutableTargetState>();

  constructor(
    targets: readonly TargetDefinition[],
    private readonly options: TargetDwellOptions,
  ) {
    if (!Number.isFinite(options.exitRadiusMultiplier) || options.exitRadiusMultiplier < 1) {
      throw new RangeError("exitRadiusMultiplier must be at least 1");
    }
    if (!Number.isFinite(options.dropoutGraceMs) || options.dropoutGraceMs < 0) {
      throw new RangeError("dropoutGraceMs must be non-negative");
    }
    this.setTargets(targets);
  }

  setTargets(targets: readonly TargetDefinition[]): void {
    const next = new Map<string, MutableTargetState>();
    for (const target of targets) {
      assertTarget(target);
      if (next.has(target.id)) throw new Error(`Duplicate target id: ${target.id}`);
      const previous = this.states.get(target.id);
      next.set(target.id, previous === undefined ? {
        definition: target,
        inside: false,
        hit: false,
        dwellMs: 0,
        dropoutMs: 0,
      } : { ...previous, definition: target });
    }
    this.states.clear();
    for (const [id, state] of next) this.states.set(id, state);
  }

  update(points: readonly LimbPoint[], deltaMs: number, timestampMs: number): TargetDwellSnapshot {
    assertDelta(deltaMs);
    const events: EngineEvent[] = [];
    const candidates = points.filter((point) =>
      Number.isFinite(point.point.x) && Number.isFinite(point.point.y) &&
      point.confidence >= this.options.minimumConfidence,
    );

    for (const state of this.states.values()) {
      if (state.hit) continue;
      const radius = state.definition.radius * (this.options.radiusMultiplier ?? 1);
      const allowed = candidates.filter((point) => limbAllowed(state.definition.limb, point.kind));
      const threshold = state.inside ? radius * this.options.exitRadiusMultiplier : radius;
      const inside = allowed.some((point) => squaredDistance(point.point, state.definition.center) <= threshold * threshold);

      if (inside) {
        state.dropoutMs = 0;
        if (!state.inside) {
          state.inside = true;
          events.push({ type: "target-entered", targetId: state.definition.id, timestampMs });
        }
        state.dwellMs += deltaMs;
        if (state.definition.dwellMs === 0 || state.dwellMs + Number.EPSILON >= state.definition.dwellMs) {
          state.hit = true;
          state.inside = false;
          state.dwellMs = state.definition.dwellMs;
          events.push({ type: "target-hit", targetId: state.definition.id, timestampMs });
        }
      } else if (state.inside) {
        state.dropoutMs += deltaMs;
        if (state.dropoutMs > this.options.dropoutGraceMs) {
          state.inside = false;
          state.dwellMs = 0;
          state.dropoutMs = 0;
          events.push({ type: "target-left", targetId: state.definition.id, timestampMs });
        }
      }
    }
    return this.snapshot(events);
  }

  reset(targetId?: string): void {
    const states = targetId === undefined ? this.states.values() : [this.requiredState(targetId)];
    for (const state of states) {
      state.inside = false;
      state.hit = false;
      state.dwellMs = 0;
      state.dropoutMs = 0;
    }
  }

  snapshot(events: readonly EngineEvent[] = []): TargetDwellSnapshot {
    const targets = [...this.states.values()].map((state): TargetStateSnapshot => ({
      id: state.definition.id,
      inside: state.inside,
      hit: state.hit,
      dwellMs: state.dwellMs,
      dwellProgress: state.definition.dwellMs === 0
        ? (state.hit ? 1 : 0)
        : Math.min(1, state.dwellMs / state.definition.dwellMs),
    }));
    return { hitCount: targets.filter((target) => target.hit).length, targets, events };
  }

  private requiredState(id: string): MutableTargetState {
    const state = this.states.get(id);
    if (state === undefined) throw new Error(`Unknown target id: ${id}`);
    return state;
  }
}

function limbAllowed(filter: TargetLimb, kind: LimbKind): boolean {
  return filter === "any" || (filter === "hands" && kind === "hand") || (filter === "feet" && kind === "foot");
}

function squaredDistance(a: Point2, b: Point2): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

function assertTarget(target: TargetDefinition): void {
  if (target.id.length === 0) throw new Error("Target id cannot be empty");
  if (!Number.isFinite(target.radius) || target.radius <= 0) throw new RangeError("Target radius must be positive");
  if (!Number.isFinite(target.dwellMs) || target.dwellMs < 0) throw new RangeError("Target dwellMs must be non-negative");
  if (!Number.isFinite(target.center.x) || !Number.isFinite(target.center.y)) throw new RangeError("Target center must be finite");
}

function assertDelta(deltaMs: number): void {
  if (!Number.isFinite(deltaMs) || deltaMs < 0) throw new RangeError("deltaMs must be finite and non-negative");
}
