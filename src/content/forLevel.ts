import type { Level } from '../theme/levels'

/** The missions a child of this level sees (no `ages` = everybody). Without zod, so the hub can use it. */
export function forLevel<T extends { ages?: readonly string[] }>(missions: readonly T[], level: Level): T[] {
  return missions.filter((m) => !m.ages || m.ages.includes(level))
}
