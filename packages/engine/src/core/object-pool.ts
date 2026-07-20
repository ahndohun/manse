export interface ObjectPoolMetrics {
  readonly created: number;
  readonly inUse: number;
  readonly available: number;
  readonly highWaterMark: number;
}

/** Reuses mutable renderer/runtime objects without coupling the engine to a renderer. */
export class ObjectPool<T extends object> {
  private readonly available: T[] = [];
  private readonly leased = new Set<T>();
  private created = 0;
  private highWaterMark = 0;

  constructor(
    private readonly create: () => T,
    private readonly reset: (value: T) => void = () => undefined,
    initialSize = 0,
  ) {
    if (!Number.isInteger(initialSize) || initialSize < 0) {
      throw new RangeError("initialSize must be a non-negative integer");
    }
    for (let index = 0; index < initialSize; index += 1) {
      this.available.push(this.newValue());
    }
  }

  acquire(): T {
    const value = this.available.pop() ?? this.newValue();
    this.leased.add(value);
    this.highWaterMark = Math.max(this.highWaterMark, this.leased.size);
    return value;
  }

  release(value: T): void {
    if (!this.leased.delete(value)) throw new Error("Cannot release an object not leased by this pool");
    this.reset(value);
    this.available.push(value);
  }

  releaseAll(): void {
    for (const value of [...this.leased]) this.release(value);
  }

  metrics(): ObjectPoolMetrics {
    return {
      created: this.created,
      inUse: this.leased.size,
      available: this.available.length,
      highWaterMark: this.highWaterMark,
    };
  }

  private newValue(): T {
    this.created += 1;
    return this.create();
  }
}
