import type { StageSize } from "./stage";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bornAtMs: number;
  lifeMs: number;
  size: number;
  color: string;
}

export class ParticleSystem {
  private readonly particles: Particle[] = [];

  constructor(private readonly maximum = 180) {}

  burst(x: number, y: number, nowMs: number, seedText: string, color: string, reducedMotion: boolean): void {
    const count = reducedMotion ? 8 : 28;
    const seed = hash(seedText);
    for (let index = 0; index < count && this.particles.length < this.maximum; index += 1) {
      const angle = seeded(seed + index * 17) * Math.PI * 2;
      const speed = 42 + seeded(seed + index * 31) * 170;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 48,
        bornAtMs: nowMs,
        lifeMs: 520 + seeded(seed + index * 47) * 620,
        size: 3 + seeded(seed + index * 59) * 9,
        color,
      });
    }
  }

  draw(context: CanvasRenderingContext2D, size: StageSize, nowMs: number, reducedMotion: boolean): void {
    for (let index = this.particles.length - 1; index >= 0; index -= 1) {
      const particle = this.particles[index];
      if (particle === undefined) continue;
      const progress = (nowMs - particle.bornAtMs) / particle.lifeMs;
      if (progress >= 1) {
        this.particles.splice(index, 1);
        continue;
      }
      const elapsed = (nowMs - particle.bornAtMs) / 1_000;
      const x = particle.x + particle.vx * elapsed;
      const y = particle.y + particle.vy * elapsed + 120 * elapsed * elapsed;
      context.save();
      context.globalAlpha = (1 - progress) * (reducedMotion ? 0.58 : 0.9);
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(x, y, particle.size * (1 - progress * 0.45), 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
    if (this.particles.length > this.maximum) this.particles.splice(0, this.particles.length - this.maximum);
    void size;
  }

  clear(): void {
    this.particles.length = 0;
  }
}

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result = Math.imul(result ^ value.charCodeAt(index), 16777619);
  }
  return result >>> 0;
}

function seeded(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43_758.5453;
  return value - Math.floor(value);
}
