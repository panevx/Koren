import { z } from 'zod'
import raw from '../../content/fame.json'
import { ImgPath, Text } from './schema'

/** The Hall of Fame (v0.21): people and achievements; a card lights up when its mission is played. */
export const FIELDS = ['science', 'space', 'sport'] as const
const Person = z
  .object({ id: z.string().regex(/^[a-z0-9-]+$/), field: z.enum(FIELDS), name: Text, img: ImgPath, mission: z.string(), fact: Text })
  .strict()
export const FAME = z.object({ note: z.string(), people: z.array(Person).min(3) }).strict().parse(raw).people
export type FamePerson = (typeof FAME)[number]
