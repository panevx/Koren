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
/**
 * Full-body poses of Koren and Raya (public/img/poses/<hero>-<pose>.webp). Since v0.14 there are 13:
 * the first three plus ten from design/v5 — chosen by what the story line is about (map, reading, nature…).
 */
export const POSES = ['wave', 'point', 'think', 'celebrate', 'chef', 'compass', 'encourage', 'explorer', 'map', 'nature', 'reading', 'treasure', 'winter'] as const
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

/** Which map modes show a place (v0.15): landmarks · cities · tourism (ski, spa, cave). */
export const PLACE_TAGS = ['history', 'nature', 'city', 'ski', 'spa', 'cave'] as const

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
    /** Map modes that show the place. At least one. */
    tags: z.array(z.enum(PLACE_TAGS)).min(1),
    /** One short, checked fact shown in the map panel. */
    info: Text.optional(),
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

/** A stop on a river: a town or a place the river passes, in order from the source. `say` = what Koren tells there. */
export const RiverStop = Text.extend({ lat: z.number().min(40.9).max(44.3), lon: z.number().min(22).max(29), say: Text.optional() }).strict()

/**
 * Follow the river (v0.16): the child leads a water drop with a finger along a REAL river line
 * (content/map/layers.json → `t`, from the source to the mouth) past its `stops`, to `end`. The button
 * "to the next stop" does the same for a keyboard, a screen reader or a child who cannot drag yet.
 */
export const TraceGame = z
  .object({
    type: z.literal('trace'),
    prompt: Text,
    river: z.string(),
    /** Where it starts (the source) and where the water goes at the end. */
    start: Text,
    end: Text,
    stops: z.array(RiverStop).max(5).default([]),
    /** Said when the drop reaches the end. */
    fact: Text,
  })
  .strict()

/**
 * The provinces puzzle (v0.16): the shapes of `regions` (ISO codes BG-01…BG-28) wait in a tray; the other provinces
 * are already in place. The child drags each shape to its hole (or taps it, then the hole). Up to all 28.
 */
export const RegionsGame = z
  .object({
    type: z.literal('regions'),
    prompt: Text,
    regions: z.array(z.string().regex(/^BG-(0[1-9]|1\d|2[0-8])$/)).min(2).max(28),
  })
  .strict()
  .refine((g) => new Set(g.regions).size === g.regions.length, { message: 'every province only once', path: ['regions'] })

/**
 * Put it together (v0.18 — "Build a fortress"): each part has its place in a scene (x, y = centre in %, size = width in %).
 * The child drags a part to its place (or taps the part, then the place). Parts with the same picture can swap places.
 * `ghost`: the empty places show a faint shadow of their part (younger children); without it, only a dashed frame.
 * `decoys`: things that do not belong; Raya says `why`.
 */
export const AssembleGame = z
  .object({
    type: z.literal('assemble'),
    prompt: Text,
    scene: z.enum(SCENES),
    parts: z
      .array(Thing.extend({ x: z.number().min(5).max(95), y: z.number().min(8).max(92), size: z.number().min(10).max(45), hint: Text.optional() }).strict())
      .min(2)
      .max(7),
    decoys: z.array(Thing.extend({ why: Text }).strict()).max(3).default([]),
    ghost: z.boolean().default(true),
    done: Text,
  })
  .strict()
  .refine((g) => distinct([...g.parts, ...g.decoys]), { message: 'every part needs its own name (e.g. "left tower", "right tower")', path: ['parts'] })

/**
 * A riddle "Who am I?" / "What am I?" (v0.18): clues are opened one by one; the child may answer at any time.
 * A wrong answer opens the next clue. `fact` is said at the end.
 */
export const RiddleGame = z
  .object({
    type: z.literal('riddle'),
    prompt: Text,
    clues: z.array(Text).min(2).max(5),
    options: z.array(Option).min(2).max(4),
    answer: z.number().int().min(0),
    fact: Text,
  })
  .strict()
  .refine((g) => g.answer < g.options.length, { message: 'answer must point to an option', path: ['answer'] })
  .refine((g) => distinct(g.options), { message: 'options must be different', path: ['options'] })

/**
 * Cook (v0.19): put the right ingredients into the pot (tap or drag; a wrong one jumps out and Raya says `why`),
 * then — if there are `steps` — tap the steps in the right order. At the end the dish appears.
 * Ingredients without a picture are shown as word cards.
 */
export const CookGame = z
  .object({
    type: z.literal('cook'),
    prompt: Text,
    dish: Thing,
    vessel: ImgPath,
    ingredients: z.array(Option.extend({ belongs: z.boolean(), why: Text.optional() }).strict()).min(3).max(9),
    /** Written in the RIGHT order; shown shuffled. */
    steps: z.array(Text).max(5).default([]),
    done: Text,
  })
  .strict()
  .refine((g) => g.ingredients.some((i) => i.belongs), { message: 'at least one ingredient belongs', path: ['ingredients'] })
  .refine((g) => g.ingredients.every((i) => i.belongs || i.why), { message: 'a wrong ingredient needs "why"', path: ['ingredients'] })
  .refine((g) => distinct(g.ingredients) && (g.steps.length === 0 || g.steps.length >= 3), { message: 'ingredients must differ; 0 or 3–5 steps', path: ['steps'] })

/** Palette colour for `paint`: a name in both languages and a #hex colour. */
const Colour = Text.extend({ color: z.string().regex(/^#[0-9a-fA-F]{6}$/) }).strict()

/**
 * Paint (v0.19 — embroidery, Easter eggs): a picture made of stitches on a grid. `rows` are text lines of equal length:
 * ' ' = nothing, '.' = the cloth, 'a'–'e' = the colour (index in `palette`) of the model. Touching stitches of the same
 * letter form one part; the child picks a colour and taps a part. `copy`: the parts must match the model (shown small);
 * without it, any colours — done when every part is painted.
 */
export const PaintGame = z
  .object({
    type: z.literal('paint'),
    prompt: Text,
    look: z.enum(['stitch', 'egg']),
    palette: z.array(Colour).min(2).max(5),
    rows: z.array(z.string().regex(/^[ .a-e]+$/)).min(4).max(16),
    copy: z.boolean().default(true),
    done: Text,
  })
  .strict()
  .refine((g) => g.rows.every((r) => r.length === g.rows[0]!.length), { message: 'all rows must be equally long', path: ['rows'] })
  .refine((g) => g.rows.join('').split('').every((c) => c === ' ' || c === '.' || c.charCodeAt(0) - 97 < g.palette.length), { message: 'a letter has no colour in the palette', path: ['rows'] })

/**
 * Cipher (v0.20 — "Read the Glagolitic"): `message.bg` (Bulgarian, capital letters and spaces, only letters that have a
 * Glagolitic counterpart — src/content/glagolitic.ts) is shown in Glagolitic with a key; the child taps the Cyrillic
 * letters one by one. `message.en` is the English meaning, shown at the end. `hint` = what the message is about.
 */
export const CipherGame = z
  .object({
    type: z.literal('cipher'),
    prompt: Text,
    message: z.object({ bg: z.string().regex(/^[А-ЪЬЮ ]+$/, 'capital letters and spaces'), en: nonEmpty }).strict(),
    hint: Text.optional(),
  })
  .strict()

/** One sentence with a gap ("___" exactly once in each language) and 2–4 words for it. */
const Gap = Text.refine((t) => t.bg.split('___').length === 2 && t.en.split('___').length === 2, { message: 'write "___" once in each language' })

/**
 * Fill the gap (v0.20 — proverbs, sentences): drag (or tap) the right word into the gap of each sentence in turn.
 * A wrong word jumps back; Raya gives the `hint` of that sentence.
 */
export const FillGame = z
  .object({
    type: z.literal('fill'),
    prompt: Text,
    items: z
      .array(z.object({ text: Gap, options: z.array(Option).min(2).max(4), answer: z.number().int().min(0), hint: Text.optional() }).strict().refine((i) => i.answer < i.options.length && distinct(i.options), { message: 'answer must exist; options must differ' }))
      .min(1)
      .max(5),
  })
  .strict()

/**
 * Number plates (v0.21): a car number plate with a province code is shown; the child taps the province on the map.
 * One plate after another. `code` = the Cyrillic letters at the start of Bulgarian plates (e.g. "СА", "РВ", "В").
 */
export const PlateGame = z
  .object({
    type: z.literal('plate'),
    prompt: Text,
    plates: z.array(z.object({ code: z.string().regex(/^[АВЕКМНОРСТУХ]{1,2}$/), region: z.string().regex(/^BG-(0[1-9]|1\d|2[0-8])$/) }).strict()).min(2).max(6),
  })
  .strict()
  .refine((g) => new Set(g.plates.map((p) => p.code)).size === g.plates.length, { message: 'every code only once', path: ['plates'] })

/**
 * One entry per game template (11 since v0.12, 13 since v0.16, 15 since v0.18, 17 since v0.19, 19 since v0.20, 20 since v0.21). A new template is added here
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
  TraceGame,
  RegionsGame,
  AssembleGame,
  RiddleGame,
  CookGame,
  PaintGame,
  CipherGame,
  FillGame,
  PlateGame,
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
export type TraceGame = z.infer<typeof TraceGame>
export type RegionsGame = z.infer<typeof RegionsGame>
export type AssembleGame = z.infer<typeof AssembleGame>
export type RiddleGame = z.infer<typeof RiddleGame>
export type CookGame = z.infer<typeof CookGame>
export type PaintGame = z.infer<typeof PaintGame>
export type CipherGame = z.infer<typeof CipherGame>
export type FillGame = z.infer<typeof FillGame>
export type PlateGame = z.infer<typeof PlateGame>
export type Thing = z.infer<typeof Thing>
export type SceneId = (typeof SCENES)[number]
export type Option = z.infer<typeof Option>
export type Place = z.infer<typeof Place>
export type PlaceIcon = (typeof PLACE_ICONS)[number]
export type LevelContent = z.infer<typeof LevelContent>
export type Mission = z.infer<typeof Mission>
export type Subject = (typeof SUBJECTS)[number]
