import { earnedCount } from './badges'
import type { Mission } from './schema'

/**
 * Game progression — never a paywall, never a punishment:
 * - A mission without `unlock` is open from the start (at least one per subject).
 * - `after`: opens when ANY of those missions is done.  `badges`: opens with that many badges.
 * - A finished mission is always open (replay any time).
 * - Progress from before v0.12 is kept: a mission is also open when a mission that needs it is already done,
 *   and a prerequisite that is not in this build (e.g. a hidden draft) never blocks anything.
 */
export type Status = 'locked' | 'open' | 'done'

type Progress = { done: Record<string, unknown>; badges: readonly string[] }

export function isUnlocked(m: Mission, p: Progress, all: readonly Mission[]): boolean {
  if (p.done[m.id] || !m.unlock) return true
  const { after, badges } = m.unlock
  if (badges !== undefined && earnedCount(p.badges, all) >= badges) return true
  if (after?.some((id) => p.done[id] || !all.some((x) => x.id === id))) return true
  return all.some((x) => x.unlock?.after?.includes(m.id) && p.done[x.id])
}

export function statusOf(m: Mission, p: Progress, all: readonly Mission[]): Status {
  return p.done[m.id] ? 'done' : isUnlocked(m, p, all) ? 'open' : 'locked'
}

/** Ids of missions open (or done) for this progress — compared before/after a badge to celebrate new ones. */
export function unlockedIds(p: Progress, all: readonly Mission[]): string[] {
  return all.filter((m) => isUnlocked(m, p, all)).map((m) => m.id)
}

/** Rewards for collecting badges (shown on the badge screen and in the passport). */
export const MILESTONES = [
  { id: 'bronze', badges: 3 },
  { id: 'silver', badges: 6 },
  { id: 'gold', badges: 10 },
  { id: 'trophy', badges: 'all' },
] as const
export type MilestoneId = (typeof MILESTONES)[number]['id']

export function milestoneNeed(id: MilestoneId, all: readonly Mission[]): number {
  const n = MILESTONES.find((x) => x.id === id)!.badges
  // No missions (a families' build before any is checked): no medal can be "reached" with 0 of 0.
  if (all.length === 0) return Infinity
  return n === 'all' ? all.length : Math.min(n, all.length)
}

export function reachedMilestones(badgeCount: number, all: readonly Mission[]): MilestoneId[] {
  return MILESTONES.filter((x) => badgeCount >= milestoneNeed(x.id, all)).map((x) => x.id)
}
