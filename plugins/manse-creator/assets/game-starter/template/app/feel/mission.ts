import type { PlayerEvent, PlayerPhase } from "@manse/runtime-web";
import type { GameUiLocale } from "../game-config";

export type MissionOutcome = "idle" | "active" | "victory";

export interface MissionState {
  locale: GameUiLocale;
  phase: PlayerPhase;
  sceneId: string | null;
  score: number;
  streak: number;
  completedUnits: number;
  totalUnits: number;
  lastTargetId: string | null;
  lastEventAtMs: number;
  sceneChangedAtMs: number;
  outcome: MissionOutcome;
}

export function createMissionState(locale: GameUiLocale): MissionState {
  return {
    locale,
    phase: "idle",
    sceneId: null,
    score: 0,
    streak: 0,
    completedUnits: 0,
    totalUnits: 0,
    lastTargetId: null,
    lastEventAtMs: 0,
    sceneChangedAtMs: 0,
    outcome: "idle",
  };
}

export function resetMissionState(state: MissionState, locale: GameUiLocale): void {
  Object.assign(state, createMissionState(locale));
}

/** Shared event/state hook. Extend here for wave timers, retries, lives, or authored scoring. */
export function applyMissionEvent(state: MissionState, event: PlayerEvent, nowMs: number): void {
  if (event.type === "phase") {
    state.phase = event.phase;
    if (event.phase === "playing") state.outcome = "active";
    return;
  }
  if (event.type === "scene-changed") {
    state.sceneId = event.sceneId;
    state.sceneChangedAtMs = nowMs;
    state.streak = 0;
    return;
  }
  if (event.type === "target-hit") {
    if (state.lastTargetId === event.targetId) return;
    state.streak = nowMs - state.lastEventAtMs <= 4_000 ? state.streak + 1 : 1;
    state.score += 100 + Math.max(0, state.streak - 1) * 25;
    state.lastTargetId = event.targetId;
    state.lastEventAtMs = nowMs;
    return;
  }
  if (event.type === "challenge-progress") {
    state.completedUnits = event.unit;
    state.totalUnits = event.total;
    state.lastEventAtMs = nowMs;
    return;
  }
  if (event.type === "complete") {
    state.phase = "complete";
    state.outcome = "victory";
    state.lastEventAtMs = nowMs;
  }
}
