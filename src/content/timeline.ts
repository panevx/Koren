import { z } from 'zod'
import raw from '../../content/timeline/epochs.json'
import { Text } from './schema'

/**
 * Timeline of Bulgaria's borders (content/timeline/epochs.json).
 * Borders before 1940 are SCHEMATIC: hand-placed [lat, lon] points along known landmarks
 * (the Danube, the Balkan Mountains, towns). The map clips them to the real coastline.
 * Like a mission, the timeline stays a draft until a teacher checks it against a historical atlas.
 */
const Ring = z.array(z.tuple([z.number(), z.number()])).min(4)

export const Epoch = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    year: z.number().int().min(600).max(2100),
    title: Text,
    /** One text per age level. */
    text: z.object({ small: Text, young: Text, guard: Text }).strict(),
    /** Place id from content/map/places.json. */
    capital: z.string().optional(),
    shape: z
      .object({
        /** Start from today's borders… */
        base: z.literal('today').optional(),
        /** …add these areas… */
        add: z.array(Ring).optional(),
        /** …and cut these out. */
        remove: z.array(Ring).optional(),
        /** Borders that were agreed but never came into being (drawn as a dotted line). */
        planned: z.array(Ring).optional(),
      })
      .strict(),
  })
  .strict()

export const Timeline = z
  .object({
    sources: z.array(z.string().trim().min(1)).min(1),
    review: z.object({ by: z.string().min(1), date: z.iso.date() }).strict().nullable(),
    draft: z.boolean(),
    epochs: z.array(Epoch).min(2),
  })
  .strict()
  .refine((t) => t.review !== null || t.draft, { message: 'a timeline without teacher review must be a draft', path: ['review'] })

export type Epoch = z.infer<typeof Epoch>

export const TIMELINE = Timeline.parse(raw)
export const EPOCHS: readonly Epoch[] = TIMELINE.epochs

/** Was there a Bulgarian state in this epoch? */
export const hasState = (e: Epoch) => Boolean(e.shape.base || e.shape.add?.length)
