import { z } from 'zod'
import raw from '../../content/path.json'
import { Text } from './schema'
import type { Mission } from './schema'

/** The adventure path: chapters (wooden signs) with missions in the order a child meets them. */
export const PATH = z
  .object({ chapters: z.array(z.object({ title: Text, missions: z.array(z.string()).min(1) }).strict()).min(1) })
  .strict()
  .parse(raw)

/** Chapters with the missions of this build (hidden drafts drop out); missions missing from path.json go to the end. */
export function pathChapters(missions: readonly Mission[]) {
  const listed = new Set(PATH.chapters.flatMap((c) => c.missions))
  const chapters = PATH.chapters
    .map((c) => ({ title: c.title, missions: c.missions.map((id) => missions.find((m) => m.id === id)).filter((m): m is Mission => !!m) }))
    .filter((c) => c.missions.length)
  const rest = missions.filter((m) => !listed.has(m.id))
  if (rest.length && chapters.length) chapters[chapters.length - 1]!.missions.push(...rest)
  return chapters
}
