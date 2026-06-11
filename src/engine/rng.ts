/** Deterministic seeded RNG (mulberry32). Keeps market prices and events reproducible per save. */

export type Rng = () => number;

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable 32-bit hash for deriving per-key seeds (e.g. seed + day + ingredient id). */
export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickWeighted<T>(items: T[], weightOf: (item: T) => number, roll: number): T | undefined {
  const total = items.reduce((sum, item) => sum + Math.max(0, weightOf(item)), 0);
  if (total <= 0) return undefined;
  let cursor = roll * total;
  for (const item of items) {
    cursor -= Math.max(0, weightOf(item));
    if (cursor < 0) return item;
  }
  return items[items.length - 1];
}
