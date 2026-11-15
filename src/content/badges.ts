/**
 * Badges that belong to missions which exist in this build. A profile can hold badge ids of missions
 * that were renamed, removed or are hidden (drafts), so `badges.length` alone could read "15 of 14".
 */
export function earnedCount(badges: readonly string[], missions: readonly { badge: { id: string } }[]): number {
  return missions.filter((mission) => badges.includes(mission.badge.id)).length
}
