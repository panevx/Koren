import type { CSSProperties } from 'react'

/**
 * Font size that lets the LONGEST word of `text` fit on one line of its container (needs `[container-type:inline-size]`
 * on the parent). Short titles keep `max`; a long word or a squeezed column (tablet, big system font) gets smaller letters
 * instead of a word broken in two („Аспару-х“). `perChar` = average letter width of Nunito Black in em (Cyrillic capitals are wide).
 */
export function fitWords(text: string, max: string, perChar = 0.7, wholeHyphenated = false): CSSProperties {
  // wholeHyphenated: words like „Най-високият“ are kept on one line (see HyphenSafe), so they are measured whole
  const longest = Math.max(4, ...text.split(wholeHyphenated ? /\s+/ : /[\s‑–-]+/).map((w) => w.length))
  return { fontSize: `min(${max}, ${(100 / (longest * perChar)).toFixed(2)}cqw)` }
}

/**
 * Splits text into words and keeps every hyphenated word (and a range like „(681–893)“) („Най-високият“, „Велико-Търновска“) on one line — on a card with
 * one or two words a break after the hyphen reads like a broken word to a child. Use with fitWords(…, wholeHyphenated: true).
 */
export function hyphenSafe(text: string): (string | { nowrap: string })[] {
  return text.split(/(\s+)/).map((part) => (/\S[-–]\S/.test(part) ? { nowrap: part } : part))
}
