import type { PlayerEvent } from "@manse/runtime-web";
import type { MissionState } from "./mission";

/** Gesture-unlocked, asset-free feedback. Replace its motifs or route to licensed pack audio. */
export class PresentationAudio {
  private context: AudioContext | null = null;
  private lastProgressUnit = 0;

  arm(): void {
    try {
      this.context ??= new AudioContext();
      void this.context.resume();
    } catch {
      // Audio is enhancement-only; the visual game remains complete.
    }
  }

  onEvent(event: PlayerEvent, mission: MissionState): void {
    if (event.type === "target-hit") {
      this.tone(520 + Math.min(mission.streak, 6) * 52, 0.12, "triangle", 0.09);
      this.tone(820, 0.16, "sine", 0.045, 0.04);
    } else if (event.type === "challenge-progress" && event.unit > this.lastProgressUnit) {
      this.lastProgressUnit = event.unit;
      this.tone(390 + event.unit * 32, 0.1, "square", 0.035);
    } else if (event.type === "scene-changed") {
      this.lastProgressUnit = 0;
      this.tone(330, 0.16, "sine", 0.04);
      this.tone(494, 0.2, "triangle", 0.055, 0.09);
    } else if (event.type === "complete") {
      [392, 523.25, 659.25, 783.99].forEach((frequency, index) => {
        this.tone(frequency, 0.42, "triangle", 0.075, index * 0.085);
      });
    }
  }

  destroy(): void {
    const context = this.context;
    this.context = null;
    if (context !== null) void context.close().catch(() => undefined);
  }

  private tone(frequency: number, duration: number, type: OscillatorType, volume: number, delay = 0): void {
    const context = this.context;
    if (context === null) return;
    try {
      const startAt = context.currentTime + delay;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startAt);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(80, frequency * 0.84), startAt + duration);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + duration + 0.02);
    } catch {
      // Ignore device-specific Web Audio failures.
    }
  }
}
