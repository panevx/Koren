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
    /** 3D landmark picture shown on the map and in games (optional). */
    img: ImgPath.optional(),
    /** false = too close to another place to show on the "Discover" map (still usable in games). */
    onMap: z.boolean().default(true),
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

const distinct = (items: { bg: string; en: string }[]) =>
  new Set(items.map((i) => i.bg)).size === items.length && new Set(items.map((i) => i.en)).size === items.length

/** Connect pairs: tap an item on the left, then its partner on the right. */
export const MatchGame = z
  .object({
    type: z.literal('match'),
    prompt: Text,
    pairs: z.array(z.object({ a: Option, b: Option }).strict()).min(2).max(6),
    hint: Text.optional(),
  })
  .strict()
  .refine((g) => distinct(g.pairs.map((p) => p.a)) && distinct(g.pairs.map((p) => p.b)), {
    message: 'every item in a column must be different',
    path: ['pairs'],
  })

/** Put cards in order. `items` are written in the CORRECT order; the game shuffles them. */
export const OrderGame = z
  .object({ type: z.literal('order'), prompt: Text, items: z.array(Option).min(3).max(6), hint: Text.optional() })
  .strict()
  .refine((g) => distinct(g.items), { message: 'items must be different', path: ['items'] })

/** Picture puzzle: 4 (2×2), 6 (3×2) or 9 (3×3) pieces, swapped by tapping two of them. */
export const PuzzleGame = z
  .object({
    type: z.literal('puzzle'),
    prompt: Text,
    img: ImgPath,
    pieces: z.union([z.literal(4), z.literal(6), z.literal(9)]),
  })
  .strict()

/** A picture with a name in both languages (the picture is required). */
export const Thing = z.object({ bg: nonEmpty, en: nonEmpty, img: ImgPath }).strict()

export const SCENES = ['forest', 'mountain', 'sea', 'village', 'castle', 'meadow'] as const

/**
 * "Find the hidden": an illustrated scene; the child finds every `target` item.
 * An item with `under` is hidden behind that picture (a bush, a rock…) until tapped.
 * x, y = centre in % of the scene; size = width in % of the scene.
 */
export const FindGame = z
  .object({
    type: z.literal('find'),
    prompt: Text,
    scene: z.enum(SCENES),
    items: z
      .array(
        Thing.extend({
          x: z.number().min(5).max(95),
          y: z.number().min(8).max(92),
          size: z.number().min(10).max(40),
          target: z.boolean().default(false),
          under: ImgPath.optional(),
        }).strict(),
      )
      .min(2)
      .max(12),
    hint: Text.optional(),
  })
  .strict()
  .refine((g) => g.items.some((i) => i.target), { message: 'at least one target', path: ['items'] })

/** Sort into boxes: every item belongs to one of 2–3 bins. */
export const SortGame = z
  .object({
    type: z.literal('sort'),
    prompt: Text,
    bins: z.array(Option).min(2).max(3),
    items: z.array(Option.extend({ bin: z.number().int().min(0), why: Text.optional() }).strict()).min(3).max(9),
    hint: Text.optional(),
  })
  .strict()
  .refine((g) => g.items.every((i) => i.bin < g.bins.length), { message: 'bin must point to an existing box', path: ['items'] })
  .refine((g) => distinct(g.items), { message: 'items must be different', path: ['items'] })

/** Memory: flip two cards at a time. Without `b` both cards show the same picture. */
export const MemoryGame = z
  .object({ type: z.literal('memory'), prompt: Text, pairs: z.array(z.object({ a: Thing, b: Option.optional() }).strict()).min(2).max(8) })
  .strict()
  .refine((g) => distinct(g.pairs.map((p) => p.a)), { message: 'pairs must be different', path: ['pairs'] })

/**
 * Treasure chest: put only the things that belong to `goal` in the chest.
 * A wrong thing jumps back out and Raya explains `why`. When all are in, the chest opens and shows `reward`.
 */
export const ChestGame = z
  .object({
    type: z.literal('chest'),
    prompt: Text,
    items: z.array(Thing.extend({ belongs: z.boolean(), why: Text.optional() }).strict()).min(3).max(8),
    reward: Text,
  })
  .strict()
  .refine((g) => g.items.some((i) => i.belongs) && g.items.some((i) => !i.belongs), {
    message: 'the chest needs things that belong and things that do not',
    path: ['items'],
  })

/** Build Bulgaria: put each piece on its place on the map. `decoys` are empty spots that fit nothing. */
export const BuildGame = z
  .object({
    type: z.literal('build'),
    prompt: Text,
    pieces: z.array(z.object({ place: z.string(), img: ImgPath, hint: Text.optional() }).strict()).min(2).max(6),
    decoys: z.array(z.string()).max(4).default([]),
    /** Show place names next to the empty spots (for younger children). */
    labels: z.boolean().default(false),
  })
  .strict()
  .refine((g) => new Set([...g.pieces.map((p) => p.place), ...g.decoys]).size === g.pieces.length + g.decoys.length, {
    message: 'every place may be used only once',
    path: ['pieces'],
  })

/** Guess the place: clues are shown one by one; the child taps the place on the map. */
export const GuessGame = z
  .object({
    type: z.literal('guess'),
    prompt: Text,
    clues: z.array(Thing).min(2).max(4),
    target: z.string(),
    choices: z.array(z.string()).min(3).max(8),
    fact: Text,
  })
  .strict()
  .refine((g) => g.choices.includes(g.target), { message: 'choices must include the target', path: ['choices'] })
  .refine((g) => new Set(g.choices).size === g.choices.length, { message: 'choices must be unique', path: ['choices'] })

/**
 * One entry per game template (11 since v0.12). A new template is added here
 * and in src/games without touching the mission screen.
 */
export const Game = z.discriminatedUnion('type', [
  QuizGame,
  MapGame,
  MatchGame,
  OrderGame,
  PuzzleGame,
  FindGame,
  SortGame,
  MemoryGame,
  ChestGame,
  BuildGame,
  GuessGame,
])

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
    /** Only for these age levels (e.g. ["small"] = a mission for 4–6 year olds only). No field = for everybody. */
    ages: z.array(z.enum(LEVEL_KEYS)).min(1).optional(),
    /**
     * Game progression (never a paywall): the mission opens when ANY mission in `after` is done,
     * or when the child has `badges` badges. No `unlock` = open from the start.
     */
    unlock: z
      .object({ after: z.array(z.string()).min(1).optional(), badges: z.number().int().min(1).optional() })
      .strict()
      .refine((u) => u.after || u.badges, 'unlock needs "after" or "badges"')
      .optional(),
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
export type MatchGame = z.infer<typeof MatchGame>
export type OrderGame = z.infer<typeof OrderGame>
export type PuzzleGame = z.infer<typeof PuzzleGame>
export type FindGame = z.infer<typeof FindGame>
export type SortGame = z.infer<typeof SortGame>
export type MemoryGame = z.infer<typeof MemoryGame>
export type ChestGame = z.infer<typeof ChestGame>
export type BuildGame = z.infer<typeof BuildGame>
export type GuessGame = z.infer<typeof GuessGame>
export type Thing = z.infer<typeof Thing>
export type SceneId = (typeof SCENES)[number]
export type Option = z.infer<typeof Option>
export type Place = z.infer<typeof Place>
export type PlaceIcon = (typeof PLACE_ICONS)[number]
export type LevelContent = z.infer<typeof LevelContent>
export type Mission = z.infer<typeof Mission>
export type Subject = (typeof SUBJECTS)[number]
