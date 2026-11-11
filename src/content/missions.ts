import type { Level } from '../theme/levels'
import { Mission, type LevelContent, type Subject } from './schema'

/**
 * Every JSON file in content/missions becomes a mission — no registration needed.
 * Invalid files are skipped at runtime (tests/content.test.ts fails on them first).
 */
const files = import.meta.glob<unknown>('../../content/missions/*.json', { eager: true, import: 'default' })

/**
 * Drafts (no teacher review yet) are visible in development and on the demo build
 * (VITE_SHOW_DRAFTS=1); a production build for families hides them.
 */
export const SHOW_DRAFTS = import.meta.env.DEV || import.meta.env.VITE_SHOW_DRAFTS === '1'

export function parseMissions(raw: Record<string, unknown>, showDrafts = SHOW_DRAFTS): Mission[] {
  const out: Mission[] = []
  for (const [file, data] of Object.entries(raw)) {
    const parsed = Mission.safeParse(data)
    if (!parsed.success) {
      console.error(`Invalid mission ${file}`, parsed.error.issues)
      continue
    }
    if (parsed.data.draft && !showDrafts) continue
    out.push(parsed.data)
  }
  return out.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
}

export const MISSIONS: readonly Mission[] = parseMissions(files)

export function missionById(id: string | undefined): Mission | undefined {
  return MISSIONS.find((m) => m.id === id)
}

export function missionsBySubject(subject: Subject | undefined): Mission[] {
  return subject ? MISSIONS.filter((m) => m.subject === subject) : [...MISSIONS]
}

/** If a mission has no variant for the child's level, use the closest one. */
const FALLBACK: Record<Level, Level[]> = {
  small: ['small', 'young', 'guard'],
  young: ['young', 'guard', 'small'],
  guard: ['guard', 'young', 'small'],
}

export function pickLevel(mission: Mission, level: Level): { level: Level; content: LevelContent } {
  for (const l of FALLBACK[level]) {
    const content = mission.levels[l]
    if (content) return { level: l, content }
  }
  // The schema guarantees at least one level.
  throw new Error(`Mission ${mission.id} has no levels`)
}
