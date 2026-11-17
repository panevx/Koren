import type { CSSProperties } from 'react'

/**
 * Font size that lets the LONGEST word of `text` fit on one line of its container (needs `[container-type:inline-size]`
 * on the parent). Short titles keep `max`; a long word or a squeezed column (tablet, big system font) gets smaller letters
 * instead of a word broken in two („Аспару-х“). `perChar` = average letter width of Nunito Black in em (Cyrillic capitals are wide).
 */
export function fitWords(text: string, max: string, perChar = 0.7): CSSProperties {
  const longest = Math.max(4, ...text.split(/[\s‑-]+/).map((w) => w.length))
  return { fontSize: `min(${max}, ${(100 / (longest * perChar)).toFixed(2)}cqw)` }
}
