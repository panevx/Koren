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

type RawChapter = { title: { bg: string; en: string }; missions: string[] }
const CHAPTERS = (raw as { chapters: RawChapter[] }).chapters

/** The chapter of the adventure path a mission belongs to (number from 1, title, ids) — for the hub's adventure card. */
export function chapterOf(id: string): { n: number; title: { bg: string; en: string }; missions: readonly string[] } | undefined {
  const i = CHAPTERS.findIndex((c) => c.missions.includes(id))
  return i < 0 ? undefined : { n: i + 1, title: CHAPTERS[i]!.title, missions: CHAPTERS[i]!.missions }
}
