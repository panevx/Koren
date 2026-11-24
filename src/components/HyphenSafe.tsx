import { hyphenSafe } from './fit'

/**
 * Text whose hyphenated words („най-високият“, „Slavo-Bulgarian“) never break at the hyphen — a child reads „най-“ and
 * „високият“ on two lines as two words. Size the text with fitWords(…, wholeHyphenated: true) so such a word still fits.
 */
export function HyphenSafe({ text }: { text: string }) {
  // one inline wrapper: inside a flex row (a button with a picture) the pieces must stay ONE text, not become flex items
  return (
    <span>
      {hyphenSafe(text).map((part, i) => (typeof part === 'string' ? part : <span key={i} className="whitespace-nowrap">{part.nowrap}</span>))}
    </span>
  )
}
