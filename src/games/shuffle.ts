/** Small seeded PRNG (mulberry32): the same mission is shuffled the same way every time — tests stay stable. */
function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}

/**
 * Returns a shuffled copy of indexes 0..n-1 that is NEVER already in order
 * (a puzzle that starts solved is no puzzle). Deterministic for a given seed.
 */
export function shuffledIndexes(n: number, seed: string): number[] {
  const idx = Array.from({ length: n }, (_, i) => i)
  if (n < 2) return idx
  const rand = rng(hash(seed))
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[idx[i], idx[j]] = [idx[j]!, idx[i]!]
  }
  if (idx.every((v, i) => v === i)) idx.push(idx.shift()!)
  return idx
}
