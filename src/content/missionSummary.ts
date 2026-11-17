import type { Mission } from './schema'

export type MissionSummary = Pick<Mission, 'id' | 'title' | 'subject' | 'badge' | 'ages' | 'unlock'>

export function summarizeMission({ id, title, subject, badge, ages, unlock }: Mission): MissionSummary {
  return { id, title, subject, badge, ages, unlock }
}

export function compareMissionOrder(a: Mission, b: Mission) {
  return a.order - b.order || a.id.localeCompare(b.id)
}
