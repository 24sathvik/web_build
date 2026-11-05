/**
 * Deterministic pseudo-random number generator (Mulberry32).
 * Use this to avoid Math.random() calls during component/scene render.
 */
export function createSeededRandom(initialSeed = 1337) {
  let seed = initialSeed;
  return function next(): number {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t >>> 0) / 4294967296);
  };
}
