import type { RuntimePose, RuntimePoseFrame } from "./types.js";

export interface TrackedPlayerPose {
  readonly playerId: number;
  readonly pose: RuntimePose;
  readonly centroid: { readonly x: number; readonly y: number };
}

export interface PlayerTrackerOptions {
  readonly maxPlayers: number;
  /** A pose farther than this from a player's last centroid is a stranger. */
  readonly matchRadius?: number;
  /** A missing player keeps their ID and state this long before leaving. */
  readonly leaveGraceMs?: number;
  /** A new body must persist this many frames before becoming a player. */
  readonly joinFrames?: number;
  readonly minPoseScore?: number;
}

interface PlayerRecord {
  readonly playerId: number;
  x: number;
  y: number;
  lastSeenMs: number;
}

interface Candidate {
  readonly pose: RuntimePose;
  readonly x: number;
  readonly y: number;
}

/**
 * Frame-to-frame player identity for 2–4 player packs. Greedy nearest-centroid
 * matching keeps IDs stable while per-frame movement stays smaller than player
 * separation; short tracking gaps hold the ID instead of resetting scores;
 * IDs are never reused within a session. On a device that only ever reports
 * one pose this degrades to a stable single player — never an error.
 */
export class PlayerTracker {
  private readonly matchRadius: number;
  private readonly leaveGraceMs: number;
  private readonly joinFrames: number;
  private readonly minPoseScore: number;
  private readonly maxPlayers: number;
  private readonly players: PlayerRecord[] = [];
  private pending: { x: number; y: number; frames: number } | null = null;
  private nextPlayerId = 0;

  constructor(options: PlayerTrackerOptions) {
    this.maxPlayers = options.maxPlayers;
    this.matchRadius = options.matchRadius ?? 0.3;
    this.leaveGraceMs = options.leaveGraceMs ?? 1_500;
    this.joinFrames = options.joinFrames ?? 3;
    this.minPoseScore = options.minPoseScore ?? 0.2;
  }

  activePlayerIds(nowMs: number): readonly number[] {
    return this.players
      .filter((player) => nowMs - player.lastSeenMs <= this.leaveGraceMs)
      .map((player) => player.playerId);
  }

  update(frame: RuntimePoseFrame): readonly TrackedPlayerPose[] {
    const candidates: Candidate[] = frame.poses
      .filter((pose) => pose.score >= this.minPoseScore)
      .map((pose) => {
        const centroid = poseCentroid(pose);
        return { pose, x: centroid.x, y: centroid.y };
      });

    // Greedy nearest-centroid matching. Continuity comes from per-frame
    // movement being far smaller than player separation; exact overlaps
    // resolve by stable index order, so assignments are deterministic.
    interface Pair { playerIndex: number; candidateIndex: number; cost: number }
    const pairs: Pair[] = [];
    this.players.forEach((player, playerIndex) => {
      candidates.forEach((candidate, candidateIndex) => {
        const distance = Math.hypot(candidate.x - player.x, candidate.y - player.y);
        if (distance > this.matchRadius) return;
        pairs.push({ playerIndex, candidateIndex, cost: distance });
      });
    });
    pairs.sort((a, b) => a.cost - b.cost
      || a.playerIndex - b.playerIndex
      || a.candidateIndex - b.candidateIndex);

    const matchedPlayers = new Set<number>();
    const matchedCandidates = new Set<number>();
    const assignments: TrackedPlayerPose[] = [];
    for (const pair of pairs) {
      if (matchedPlayers.has(pair.playerIndex) || matchedCandidates.has(pair.candidateIndex)) continue;
      matchedPlayers.add(pair.playerIndex);
      matchedCandidates.add(pair.candidateIndex);
      const player = this.players[pair.playerIndex];
      const candidate = candidates[pair.candidateIndex];
      if (player === undefined || candidate === undefined) continue;
      player.x = candidate.x;
      player.y = candidate.y;
      player.lastSeenMs = frame.timestampMs;
      assignments.push({ playerId: player.playerId, pose: candidate.pose, centroid: { x: candidate.x, y: candidate.y } });
    }

    this.admitNewPlayers(candidates, matchedCandidates, frame.timestampMs, assignments);

    for (let index = this.players.length - 1; index >= 0; index -= 1) {
      const player = this.players[index];
      if (player !== undefined && frame.timestampMs - player.lastSeenMs > this.leaveGraceMs) {
        this.players.splice(index, 1);
      }
    }

    return assignments.sort((a, b) => a.playerId - b.playerId);
  }

  private admitNewPlayers(
    candidates: readonly Candidate[],
    matchedCandidates: ReadonlySet<number>,
    timestampMs: number,
    assignments: TrackedPlayerPose[],
  ): void {
    const stranger = candidates.find((_, index) => !matchedCandidates.has(index));
    const strangerIndex = candidates.findIndex((_, index) => !matchedCandidates.has(index));
    if (stranger === undefined || this.players.length >= this.maxPlayers) {
      this.pending = null;
      return;
    }
    // First player joins instantly; later joiners must persist joinFrames
    // frames so a passer-by in the background does not become a player.
    const isFirst = this.players.length === 0;
    if (!isFirst) {
      if (this.pending !== null
        && Math.hypot(stranger.x - this.pending.x, stranger.y - this.pending.y) <= this.matchRadius) {
        this.pending = { x: stranger.x, y: stranger.y, frames: this.pending.frames + 1 };
      } else {
        this.pending = { x: stranger.x, y: stranger.y, frames: 1 };
      }
      if (this.pending.frames < this.joinFrames) return;
    }
    this.pending = null;
    const record: PlayerRecord = {
      playerId: this.nextPlayerId++,
      x: stranger.x,
      y: stranger.y,
      lastSeenMs: timestampMs,
    };
    this.players.push(record);
    if (strangerIndex >= 0) {
      assignments.push({
        playerId: record.playerId,
        pose: stranger.pose,
        centroid: { x: stranger.x, y: stranger.y },
      });
    }
  }
}

const CENTROID_LANDMARKS = new Set(["left_shoulder", "right_shoulder", "left_hip", "right_hip"]);

function poseCentroid(pose: RuntimePose): { x: number; y: number } {
  let x = 0;
  let y = 0;
  let count = 0;
  for (const landmark of pose.landmarks) {
    if (!CENTROID_LANDMARKS.has(landmark.name)) continue;
    if (Math.min(landmark.visibility, landmark.presence) < 0.3) continue;
    x += landmark.x;
    y += landmark.y;
    count += 1;
  }
  if (count === 0) {
    for (const landmark of pose.landmarks) {
      x += landmark.x;
      y += landmark.y;
      count += 1;
    }
  }
  return count === 0 ? { x: 0.5, y: 0.5 } : { x: x / count, y: y / count };
}
