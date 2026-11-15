import raw from '../../content/path.json'

/**
 * Mission ids in adventure-path order, read straight from content/path.json (validated by src/content/path.ts
 * and tests) — without zod, so the hub can use it while staying small.
 */
export const PATH_ORDER: readonly string[] = (raw as { chapters: { missions: string[] }[] }).chapters.flatMap((c) => c.missions)

export function byPathOrder<T extends { id: string }>(missions: readonly T[]): T[] {
  const at = (id: string) => {
    const i = PATH_ORDER.indexOf(id)
    return i < 0 ? Infinity : i
  }
  return [...missions].sort((a, b) => at(a.id) - at(b.id))
}
