/**
 * Today's Bulgarian letters and their Glagolitic counterparts (Unicode block U+2C00, capital letters).
 * SIMPLIFIED for children: one Glagolitic letter per modern letter (И → izhe Ⰹ, У → uku Ⱆ; Й and Я have no simple
 * counterpart, so cipher messages must not use them — tests/language.test.ts checks every message).
 * The letters are drawn with Noto Sans Glagolitic (round, "Bulgarian" Glagolitic), self-hosted in src/assets/fonts.
 */
export const GLAGOLITIC: Readonly<Record<string, string>> = {
  А: 'Ⰰ', Б: 'Ⰱ', В: 'Ⰲ', Г: 'Ⰳ', Д: 'Ⰴ', Е: 'Ⰵ', Ж: 'Ⰶ', З: 'Ⰸ', И: 'Ⰹ', К: 'Ⰽ', Л: 'Ⰾ', М: 'Ⰿ', Н: 'Ⱀ', О: 'Ⱁ',
  П: 'Ⱂ', Р: 'Ⱃ', С: 'Ⱄ', Т: 'Ⱅ', У: 'Ⱆ', Ф: 'Ⱇ', Х: 'Ⱈ', Ц: 'Ⱌ', Ч: 'Ⱍ', Ш: 'Ⱎ', Щ: 'Ⱋ', Ъ: 'Ⱏ', Ь: 'Ⱐ', Ю: 'Ⱓ',
}

/** Can this text be written with the table above (letters and spaces only)? */
export const canWriteGlagolitic = (text: string) => [...text.toUpperCase()].every((c) => c === ' ' || c in GLAGOLITIC)
