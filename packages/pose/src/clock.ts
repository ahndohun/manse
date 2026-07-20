export interface FrameDriver {
  now(): number;
  request(callback: (timestampMs: number) => void): number;
  cancel(handle: number): void;
}

export function createDefaultFrameDriver(): FrameDriver {
  const clockNow = (): number =>
    typeof performance === "undefined" ? Date.now() : performance.now();
  if (typeof requestAnimationFrame === "function") {
    return {
      now: clockNow,
      request: (callback) => requestAnimationFrame(callback),
      cancel: (handle) => cancelAnimationFrame(handle),
    };
  }
  return {
    now: clockNow,
    request: (callback) => Number(setTimeout(() => callback(clockNow()), 1000 / 60)),
    cancel: (handle) => clearTimeout(handle),
  };
}
