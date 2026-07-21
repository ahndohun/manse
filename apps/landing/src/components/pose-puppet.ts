// Pure puppet logic for the landing hero: measurement, smoothing, geometry,
// and dot-field rendering. No React, no DOM — shared by PoseStage (live
// camera) and the pose-lab QA page (synthetic landmark scenarios).
//
// Invariants that keep the figure from ever breaking:
//  - Bone lengths are fixed anatomical ratios of torso length T; tracking
//    supplies JOINT ANGLES ONLY.
//  - Elbow flexion is magnitude-clamped to a human-plausible fold while its
//    sign stays pose-dependent (goalposts and hands-to-face need both signs).
//  - A limb below the visibility threshold or with impossible source geometry
//    fades out with hysteresis; it snaps (never sweeps) on re-entry.

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (x: number) => {
  const c = clamp(x, 0, 1);
  return c * c * (3 - 2 * c);
};
export const wrapAngle = (a: number) => {
  let r = a % (Math.PI * 2);
  if (r > Math.PI) r -= Math.PI * 2;
  if (r < -Math.PI) r += Math.PI * 2;
  return r;
};

// One Euro filter: heavy smoothing at rest, responsive during fast motion.
export class OneEuro {
  private x: number | null = null;
  private dx = 0;
  private lastT = 0;
  constructor(
    private minCutoff: number,
    private beta: number,
  ) {}
  set(v: number) {
    this.x = v;
    this.dx = 0;
  }
  value(): number | null {
    return this.x;
  }
  filter(v: number, t: number) {
    if (this.x === null) {
      this.set(v);
      this.lastT = t;
      return v;
    }
    const dt = clamp(t - this.lastT, 1 / 240, 0.25);
    this.lastT = t;
    const tauD = 1 / (2 * Math.PI * 1.0);
    const aD = 1 / (1 + tauD / dt);
    this.dx += aD * ((v - this.x) / dt - this.dx);
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    const tau = 1 / (2 * Math.PI * cutoff);
    const a = 1 / (1 + tau / dt);
    this.x += a * (v - this.x);
    return this.x;
  }
  // Angle variant: unwrap against the current estimate so the filter never
  // sweeps the long way around when atan2 crosses the +/-PI seam.
  filterAngle(v: number, t: number) {
    if (this.x !== null) v = this.x + wrapAngle(v - this.x);
    return this.filter(v, t);
  }
}

// ---- the puppet -------------------------------------------------------------
// All lengths are fractions of torso length T (neck -> pelvis). Fixed forever.
export const SH_HALF = 0.46;
export const HIP_HALF = 0.33;
export const HEAD_DIST = 0.47;
export const HEAD_R = 0.31;
export const UPPER = 0.64;
export const FORE = 0.6;
export const HAND_R = 0.17;
// Raised arm + shoulder tilt + hand/capsule radius. This is deliberately
// conservative: stage sizing uses it as a hard no-entry envelope for copy.
export const MAX_REACH_UP = 1.62;

export type ArmPose = { shoulder: number; flex: number; present: number };
export type Puppet = {
  x: number;
  T: number;
  tilt: number;
  headTilt: number;
  left: ArmPose; // screen-left arm (the mirror of the visitor's right arm)
  right: ArmPose;
};

// Elbow flexion is clamped by MAGNITUDE only. In a 2D projection the signed
// turn from upper arm to forearm is pose-dependent (a goalpost and a
// hand-to-face produce opposite signs for the same physical elbow), so a
// per-side sign clamp mangles legitimate poses. What is physically impossible
// is a fold beyond ~160 degrees — that is the only thing removed here.
export const FLEX_MAX = 2.8;

export const REST_ARM_L: ArmPose = { shoulder: Math.PI / 2 + 0.14, flex: -0.14, present: 1 };
export const REST_ARM_R: ArmPose = { shoulder: Math.PI / 2 - 0.14, flex: 0.14, present: 1 };
export const restArm = (side: "left" | "right"): ArmPose =>
  side === "left" ? { ...REST_ARM_L, present: 0 } : { ...REST_ARM_R, present: 0 };

// A slow, composed idle: breathing, a faint sway, and an occasional wave.
export function idlePuppet(t: number, T: number): Puppet {
  const breath = Math.sin((t * 2 * Math.PI) / 5.5);
  const cycle = t % 18;
  // Raise at 8.5s, three easy swings, lowered by 14s, then quiet again.
  const up = smooth((cycle - 8.5) / 0.9) * (1 - smooth((cycle - 13.2) / 0.9));
  const swing = Math.sin((cycle - 9.4) * 2 * Math.PI * 0.5) * up;
  const lift = 0.011 * breath;
  return {
    x: 0,
    T: T * (1 + 0.008 * breath),
    tilt: 0.022 * Math.sin(t * 0.4),
    headTilt: 0.05 * Math.sin(t * 0.23 + 1) - 0.06 * up,
    left: { shoulder: REST_ARM_L.shoulder + lift, flex: REST_ARM_L.flex, present: 1 },
    right: {
      // A greeting, not a point: upper arm high, forearm upright, easy swings.
      shoulder: lerp(REST_ARM_R.shoulder, -1.02, up) + 0.04 * swing - lift,
      flex: lerp(REST_ARM_R.flex, 0.78, up) + 0.34 * swing,
      present: 1,
    },
  };
}

// ---- MediaPipe landmarks ------------------------------------------------------
export const LM = { nose: 0, shL: 11, shR: 12, elL: 13, elR: 14, wrL: 15, wrR: 16 } as const;
export type Landmark = { x: number; y: number; visibility?: number };

// ---- drawing plan --------------------------------------------------------------
export type Plan = {
  segs: { ax: number; ay: number; bx: number; by: number; half: number; alpha: number }[];
  circles: { x: number; y: number; r: number; alpha: number }[];
};

// Turn puppet parameters into capsules and circles. This is the ONLY place
// geometry is produced, and every point derives from fixed lengths.
export function planFromPuppet(p: Puppet, anchorX: number, neckY: number): Plan {
  const T = p.T;
  const neck = { x: anchorX + p.x, y: neckY };
  const axis = { x: Math.cos(p.tilt), y: Math.sin(p.tilt) }; // shoulder line
  const down = { x: -Math.sin(p.tilt * 0.55), y: Math.cos(p.tilt * 0.55) }; // torso axis
  const shL = { x: neck.x - axis.x * SH_HALF * T, y: neck.y - axis.y * SH_HALF * T };
  const shR = { x: neck.x + axis.x * SH_HALF * T, y: neck.y + axis.y * SH_HALF * T };
  const hipC = { x: neck.x + down.x * T, y: neck.y + down.y * T };
  const hipL = { x: hipC.x - axis.x * HIP_HALF * T, y: hipC.y - axis.y * HIP_HALF * T };
  const hipR = { x: hipC.x + axis.x * HIP_HALF * T, y: hipC.y + axis.y * HIP_HALF * T };
  const headDir = p.tilt * 0.6 + p.headTilt;
  const head = {
    x: neck.x + Math.sin(headDir) * HEAD_DIST * T,
    y: neck.y - Math.cos(headDir) * HEAD_DIST * T,
  };
  const throat = { x: lerp(neck.x, head.x, 0.5), y: lerp(neck.y, head.y, 0.5) };

  const segs: Plan["segs"] = [
    { ax: neck.x, ay: neck.y, bx: hipC.x, by: hipC.y, half: 0.4 * T, alpha: 1 },
    { ax: shL.x, ay: shL.y, bx: shR.x, by: shR.y, half: 0.23 * T, alpha: 1 },
    { ax: hipL.x, ay: hipL.y, bx: hipR.x, by: hipR.y, half: 0.22 * T, alpha: 1 },
    { ax: shL.x, ay: shL.y, bx: hipL.x, by: hipL.y, half: 0.22 * T, alpha: 1 },
    { ax: shR.x, ay: shR.y, bx: hipR.x, by: hipR.y, half: 0.22 * T, alpha: 1 },
    { ax: neck.x, ay: neck.y, bx: throat.x, by: throat.y, half: 0.15 * T, alpha: 1 },
  ];
  const circles: Plan["circles"] = [{ x: head.x, y: head.y, r: HEAD_R * T, alpha: 1 }];

  for (const [arm, sh] of [
    [p.left, shL],
    [p.right, shR],
  ] as const) {
    if (arm.present < 0.03) continue;
    const a1 = arm.shoulder;
    const el = { x: sh.x + Math.cos(a1) * UPPER * T, y: sh.y + Math.sin(a1) * UPPER * T };
    const a2 = a1 + arm.flex;
    const wr = { x: el.x + Math.cos(a2) * FORE * T, y: el.y + Math.sin(a2) * FORE * T };
    segs.push(
      { ax: sh.x, ay: sh.y, bx: el.x, by: el.y, half: 0.16 * T, alpha: arm.present },
      { ax: el.x, ay: el.y, bx: wr.x, by: wr.y, half: 0.135 * T, alpha: arm.present },
    );
    circles.push({ x: wr.x, y: wr.y, r: HAND_R * T, alpha: arm.present });
  }
  return { segs, circles };
}

const blendArm = (a: ArmPose, b: ArmPose, k: number): ArmPose => ({
  shoulder: lerp(a.shoulder, b.shoulder, k),
  flex: lerp(a.flex, b.flex, k),
  present: lerp(a.present, b.present, k),
});
export const blendPuppet = (a: Puppet, b: Puppet, k: number): Puppet => ({
  x: lerp(a.x, b.x, k),
  T: lerp(a.T, b.T, k),
  tilt: lerp(a.tilt, b.tilt, k),
  headTilt: lerp(a.headTilt, b.headTilt, k),
  left: blendArm(a.left, b.left, k),
  right: blendArm(a.right, b.right, k),
});

// ---- stage metrics --------------------------------------------------------------
export type Stage = {
  S: number;
  anchorX: number;
  neckY: number;
  topLimit: number;
  TMin: number;
  TMax: number;
  idleT: number;
};

// The stage strip: a bottom band of the hero the figure can never leave.
// `safeTop` is the measured bottom of the rendered hero copy plus breathing
// room. Unlike a breakpoint guess, it stays correct when text wraps, fonts
// change, or browser chrome leaves an unusual viewport.
export function stageMetrics(w: number, h: number, safeTop?: number): Stage {
  const S = Math.min(430, h * 0.36);
  const anchorX = w / 2;
  const neckY = h - S * 0.58;
  const fallbackTop = h - S - 70;
  const requestedTop = Number.isFinite(safeTop) ? safeTop! : fallbackTop;
  const topLimit = clamp(requestedTop, 0, neckY - 16);
  const availableAboveNeck = Math.max(1, neckY - topLimit);
  const TMax = Math.max(1, Math.min(S * 0.48, availableAboveNeck / MAX_REACH_UP));
  const TMin = Math.min(S * 0.22, TMax * 0.62);
  const idleT = clamp(S * 0.37, TMin, TMax);
  return { S, anchorX, neckY, topLimit, TMin, TMax, idleT };
}

// ---- live measurement --------------------------------------------------------------
export type ArmFilter = { a1: OneEuro; flex: OneEuro; present: number };
export type LiveState = {
  blend: number;
  lastSeen: number;
  frozen: Puppet | null;
  x: OneEuro;
  T: OneEuro;
  tilt: OneEuro;
  headTilt: OneEuro;
  arms: { left: ArmFilter; right: ArmFilter };
};

export function createLiveState(): LiveState {
  return {
    blend: 0,
    lastSeen: -10,
    frozen: null,
    x: new OneEuro(1.0, 0.4),
    T: new OneEuro(0.5, 0.15),
    tilt: new OneEuro(1.2, 0.5),
    headTilt: new OneEuro(1.2, 0.5),
    arms: {
      left: { a1: new OneEuro(1.6, 0.7), flex: new OneEuro(1.6, 0.7), present: 0 },
      right: { a1: new OneEuro(1.6, 0.7), flex: new OneEuro(1.6, 0.7), present: 0 },
    },
  };
}

export type MeasureEnv = { nowS: number; va: number; stage: Stage; w: number };

// Convert one frame of landmarks into smoothed puppet parameters, or null when
// the shoulders are not confidently seen. All measurement quirks (mirroring,
// chirality, clamps, hysteresis) live here and nowhere else.
export function measureFrame(L: LiveState, lms: Landmark[], env: MeasureEnv): Puppet | null {
  const { nowS, va, stage, w } = env;
  const { S, TMin, TMax } = stage;
  const validPoint = (i: number) => {
    const p = lms[i];
    return Boolean(p && Number.isFinite(p.x) && Number.isFinite(p.y));
  };
  const visScore = (i: number) => {
    if (!validPoint(i)) return 0;
    const visibility = lms[i].visibility;
    if (visibility === undefined) return 1;
    return Number.isFinite(visibility) ? clamp(visibility, 0, 1) : 0;
  };
  // Mirrored, aspect-corrected frame coordinates (y points down). Call only
  // after visScore/validPoint has admitted the landmark.
  const P = (i: number) => ({ x: (0.5 - lms[i].x) * va, y: lms[i].y });

  // Screen-right shoulder is the visitor's left shoulder. Swapped, collapsed,
  // nearly vertical, or impossible shoulder pairs are treated as tracking
  // loss. Freezing is always preferable to inventing a broken body.
  if (visScore(LM.shL) <= 0.5 || visScore(LM.shR) <= 0.5) return null;
  const shR = P(LM.shL);
  const shL = P(LM.shR);
  const shoulderDx = shR.x - shL.x;
  const shoulderDy = shR.y - shL.y;
  const shoulderW = Math.hypot(shoulderDx, shoulderDy);
  const rawTilt = Math.atan2(shoulderDy, shoulderDx);
  if (shoulderDx < 0.025 || shoulderW < 0.06 || shoulderW > 1.4 || Math.abs(rawTilt) > 0.7) {
    return null;
  }
  L.lastSeen = nowS;

  const neck = { x: (shL.x + shR.x) / 2, y: (shL.y + shR.y) / 2 };
  // Tuned so a comfortable seated framing lands mid-range: leaning in grows
  // the bust, stepping back shrinks it, and both ends clamp.
  const pxScale = S * 0.62;

  const mT = clamp((shoulderW * pxScale) / (2 * SH_HALF), TMin, TMax);
  const mX = clamp(neck.x * pxScale, -w * 0.2, w * 0.2);
  const mTilt = clamp(rawTilt, -0.3, 0.3);

  let mHead = 0;
  if (visScore(LM.nose) > 0.4) {
    const nose = P(LM.nose);
    const headDistance = Math.hypot(nose.x - neck.x, nose.y - neck.y);
    if (headDistance <= shoulderW * 1.1) {
      mHead = clamp(Math.atan2(nose.x - neck.x, -(nose.y - neck.y)) - mTilt * 0.6, -0.5, 0.5);
    }
  }

  const measured: Puppet = {
    x: L.x.filter(mX, nowS),
    T: L.T.filter(mT, nowS),
    tilt: L.tilt.filterAngle(mTilt, nowS),
    headTilt: L.headTilt.filterAngle(mHead, nowS),
    left: restArm("left"),
    right: restArm("right"),
  };

  const measureArm = (
    side: "left" | "right",
    elI: number,
    wrI: number,
    sh: { x: number; y: number },
  ) => {
    const arm = L.arms[side];
    const out = measured[side];
    // Hysteresis: an arm that is shown stays shown until clearly lost, and a
    // hidden arm must be clearly seen before it returns.
    const minVis = Math.min(visScore(elI), visScore(wrI));
    let seen = arm.present > 0.5 ? minVis > 0.35 : minVis > 0.5;
    let el: { x: number; y: number } | null = null;
    let wr: { x: number; y: number } | null = null;
    if (seen) {
      el = P(elI);
      wr = P(wrI);
      const upperSpan = Math.hypot(el.x - sh.x, el.y - sh.y);
      const foreSpan = Math.hypot(wr.x - el.x, wr.y - el.y);
      const maxInputSpan = Math.max(0.12, shoulderW * 1.75);
      seen = upperSpan > 0.018 && foreSpan > 0.018 && upperSpan < maxInputSpan && foreSpan < maxInputSpan;
    }
    if (seen && el && wr) {
      const a1 = Math.atan2(el.y - sh.y, el.x - sh.x);
      const a2 = Math.atan2(wr.y - el.y, wr.x - el.x);
      const flex = clamp(wrapAngle(a2 - a1), -FLEX_MAX, FLEX_MAX);
      // Snap angles on re-entry so a returning arm never sweeps across the
      // body from a stale position.
      if (arm.present < 0.08) {
        arm.a1.set(a1);
        arm.flex.set(flex);
        arm.present = 0.15;
      }
      arm.present = Math.min(1, arm.present + 0.09);
      out.shoulder = arm.a1.filterAngle(a1, nowS);
      out.flex = arm.flex.filterAngle(flex, nowS);
    } else {
      // Not confidently seen: hold the last good angles, fade out.
      arm.present = Math.max(0, arm.present - 0.09);
      out.shoulder = arm.a1.value() ?? out.shoulder;
      out.flex = arm.flex.value() ?? out.flex;
    }
    out.present = arm.present;
  };
  // Screen-left arm mirrors the visitor's right arm, and vice versa.
  measureArm("left", LM.elR, LM.wrR, shL);
  measureArm("right", LM.elL, LM.wrL, shR);

  L.frozen = measured;
  return measured;
}

// Blend idle <-> live with a fixed-rate ramp; on tracking loss the last pose
// freezes for a beat, then relaxes back to the greeter.
export function blendWithIdle(L: LiveState, idle: Puppet, measured: Puppet | null, nowS: number): Puppet {
  const blendTarget = measured ? 1 : nowS - L.lastSeen > 1.0 ? 0 : L.blend;
  L.blend += clamp(blendTarget - L.blend, -0.045, 0.045);
  const liveShape = measured ?? L.frozen ?? idle;
  return blendPuppet(idle, liveShape, L.blend);
}

// ---- dot-field rendering --------------------------------------------------------------
export function drawField(ctx: CanvasRenderingContext2D, plan: Plan, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  const g = Math.min(13, Math.max(9, w / 130));
  // The planner is constrained already; this final finite-value firewall means
  // even a corrupted external frame can only remove a shape, never poison the
  // canvas with fragments or stop the render loop.
  const finite = (...values: number[]) => values.every(Number.isFinite);
  const circles = plan.circles.filter((c) => finite(c.x, c.y, c.r, c.alpha) && c.r > 0);
  const segs = plan.segs.filter((s) => finite(s.ax, s.ay, s.bx, s.by, s.half, s.alpha) && s.half > 0);
  const figureAlpha = (px: number, py: number) => {
    let best = 0;
    for (const c of circles) {
      const d2 = (px - c.x) ** 2 + (py - c.y) ** 2;
      if (d2 <= c.r * c.r) best = Math.max(best, c.alpha);
      else {
        const rr = c.r + g * 0.3;
        if (d2 <= rr * rr) best = Math.max(best, c.alpha * 0.35);
      }
    }
    for (const s of segs) {
      const minX = Math.min(s.ax, s.bx) - s.half;
      const maxX = Math.max(s.ax, s.bx) + s.half;
      const minY = Math.min(s.ay, s.by) - s.half;
      const maxY = Math.max(s.ay, s.by) + s.half;
      if (px < minX || px > maxX || py < minY || py > maxY) continue;
      const dx = s.bx - s.ax;
      const dy = s.by - s.ay;
      const lenSq = dx * dx + dy * dy || 1;
      const u = clamp(((px - s.ax) * dx + (py - s.ay) * dy) / lenSq, 0, 1);
      const qx = s.ax + u * dx;
      const qy = s.ay + u * dy;
      if ((px - qx) ** 2 + (py - qy) ** 2 <= s.half * s.half) best = Math.max(best, s.alpha);
    }
    return best;
  };

  ctx.fillStyle = "#fef8ef";
  ctx.fillRect(0, 0, w, h);
  const rField = g * 0.2;
  const rBody = g * 0.37;
  for (let gx = g / 2; gx < w; gx += g) {
    for (let gy = g / 2; gy < h; gy += g) {
      const a = figureAlpha(gx, gy);
      if (a > 0.04) {
        ctx.fillStyle = `rgba(23, 26, 24, ${(0.12 + 0.8 * a).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(gx, gy, lerp(rField, rBody, a), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "rgba(23, 26, 24, 0.12)";
        ctx.beginPath();
        ctx.arc(gx, gy, rField, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
