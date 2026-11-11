import { z } from 'zod'

/**
 * Mission schema — the contract between the content team and the code.
 * A new mission is a new JSON file in content/missions that passes this schema;
 * it never needs new code. tests/content.test.ts validates every file.
 */

const nonEmpty = z.string().trim().min(1)

/** Text shown to the child, always in both languages. */
export const Text = z.object({ bg: nonEmpty, en: nonEmpty }).strict()

/** Path inside public/img, e.g. "tiles/history.webp". */
export const ImgPath = z.string().regex(/^[a-z0-9/_-]+\.(webp|png|svg)$/, 'image path like "folder/name.webp"')

export const HEROES = ['koren', 'raya'] as const
export const POSES = ['wave', 'point', 'think'] as const
export const SUBJECTS = ['history', 'culture', 'language', 'geography'] as const
export const LEVEL_KEYS = ['small', 'young', 'guard'] as const

export const StoryLine = z
  .object({
    hero: z.enum(HEROES),
    pose: z.enum(POSES).default('point'),
    bg: nonEmpty,
    en: nonEmpty,
    img: ImgPath.optional(),
  })
  .strict()

export const Option = z.object({ bg: nonEmpty, en: nonEmpty, img: ImgPath.optional() }).strict()

export const Question = z
  .object({
    q: Text,
    options: z.array(Option).min(2).max(4),
    /** Index of the correct option. */
    answer: z.number().int().min(0),
    /** Shown by Raya after a wrong answer. Never a punishment. */
    hint: Text.optional(),
  })
  .strict()
  .refine((q) => q.answer < q.options.length, { message: 'answer must point to an existing option', path: ['answer'] })

export const QuizGame = z.object({ type: z.literal('quiz'), questions: z.array(Question).min(1).max(6) }).strict()

export const PLACE_ICONS = ['fortress', 'city', 'sea', 'monastery', 'mountain', 'rose', 'house', 'rock'] as const

/** A place on the map of Bulgaria (content/map/places.json). */
export const Place = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    icon: z.enum(PLACE_ICONS),
    lat: z.number().min(41).max(44.3),
    lon: z.number().min(22.3).max(28.7),
    name: Text,
  })
  .strict()

/**
 * "Find it on the map": the child taps one of `choices` (place ids, must include `target`).
 * `showIcons` draws each place's picture on its marker — for children who cannot read yet.
 * After the second wrong tap Raya gives `hint` and the target area is highlighted.
 */
export const MapGame = z
  .object({
    type: z.literal('map'),
    target: z.string(),
    choices: z.array(z.string()).min(2).max(8),
    prompt: Text,
    hint: Text,
    showIcons: z.boolean().default(false),
  })
  .strict()
  .refine((g) => g.choices.includes(g.target), { message: 'choices must include the target', path: ['choices'] })
  .refine((g) => new Set(g.choices).size === g.choices.length, { message: 'choices must be unique', path: ['choices'] })

/**
 * One entry per game template: v0.3 `quiz`, v0.4 `map`. match, order and puzzle
 * are added here (and in src/games) without touching the mission screen.
 */
export const Game = z.discriminatedUnion('type', [QuizGame, MapGame])

export const LevelContent = z
  .object({
    story: z.array(StoryLine).min(1).max(6),
    game: Game,
    /** 0–3 review questions; the 4–6 level usually has none. */
    check: z.array(Question).max(3).default([]),
  })
  .strict()

export const Mission = z
  .object({
    id: z.string().regex(/^[a-z]+-\d{2}-[a-z0-9-]+$/, 'id like "hist-01-asparuh"'),
    subject: z.enum(SUBJECTS),
    free: z.boolean(),
    order: z.number().int().min(1),
    place: z.string().optional(),
    badge: z.object({ id: z.string().regex(/^[a-z0-9-]+$/), icon: ImgPath }).strict(),
    title: Text,
    levels: z
      .object({ small: LevelContent.optional(), young: LevelContent.optional(), guard: LevelContent.optional() })
      .strict()
      .refine((l) => Object.values(l).some(Boolean), 'at least one age level is required'),
    /** Where the facts come from. Required: no source, no mission. */
    sources: z.array(nonEmpty).min(1),
    /** Teacher approval. `null` is only allowed while the mission is a draft. */
    review: z.object({ by: nonEmpty, date: z.iso.date() }).strict().nullable(),
    draft: z.boolean().default(false),
  })
  .strict()
  .refine((m) => m.review !== null || m.draft, {
    message: 'a mission without teacher review must be marked "draft": true',
    path: ['review'],
  })

export type Text = z.infer<typeof Text>
export type StoryLine = z.infer<typeof StoryLine>
export type Question = z.infer<typeof Question>
export type Game = z.infer<typeof Game>
export type MapGame = z.infer<typeof MapGame>
export type Place = z.infer<typeof Place>
export type PlaceIcon = (typeof PLACE_ICONS)[number]
export type LevelContent = z.infer<typeof LevelContent>
export type Mission = z.infer<typeof Mission>
export type Subject = (typeof SUBJECTS)[number]
