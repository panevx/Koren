import { useMemo, useState } from 'react'
import { GLAGOLITIC } from '../content/glagolitic'
import type { CipherGame } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { play } from '../sound'
import { DoneButton, Feedback, Prompt } from './Feedback'
import { shuffledIndexes } from './shuffle'

/** A few letters that are not in the message, so the keyboard is not just the answer. */
const EXTRA = ['Б', 'Ж', 'Ф', 'Ц', 'Ш', 'Ю', 'Х', 'Щ']

/**
 * Read the Glagolitic: the message is written in Glagolitic; the key shows each Glagolitic letter with today's letter.
 * The child taps today's letters in order; the next empty box glows. A wrong letter: Raya says "look at the key"
 * and the matching key card lights up. At the end the whole message and its meaning appear.
 */
export function Cipher({ game, onDone }: { game: CipherGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const glyphNumber = (letter: string) => GLAGOLITIC[letter]!.codePointAt(0)! - 0x2c00 + 1
  const glyphName = (letter: string) => t('cipher.glyphNumber', { n: glyphNumber(letter) })
  const chars = [...game.message.bg]
  const letters = chars.map((c, i) => ({ c, i })).filter((x) => x.c !== ' ')
  const inMessage = useMemo(() => [...new Set(letters.map((x) => x.c))], [letters])
  const keyboard = useMemo(() => {
    const extra = EXTRA.filter((c) => !inMessage.includes(c)).slice(0, 3)
    const all = [...inMessage, ...extra]
    return shuffledIndexes(all.length, game.message.bg).map((k) => all[k]!)
  }, [inMessage, game.message.bg])
  // the key: in alphabet order, so it reads like a table
  const key = useMemo(() => [...keyboard].sort((a, b) => a.localeCompare(b, 'bg')), [keyboard])
  const [filled, setFilled] = useState(0)
  const [misses, setMisses] = useState(0)
  const [glow, setGlow] = useState<string | null>(null)
  const [say, setSay] = useState<string | undefined>()
  const done = filled === letters.length

  const press = (c: string) => {
    if (done) return
    const want = letters[filled]!.c
    if (c === want) {
      play('correct')
      setFilled((n) => n + 1)
      setGlow(null)
      setSay(undefined)
    } else {
      play('hint')
      setMisses((n) => n + 1)
      setGlow(want)
      setSay(t('cipher.lookKey', { glyph: GLAGOLITIC[want]! }))
    }
  }

  let seen = 0
  return (
    <div className="flex flex-1 flex-col gap-3 side:grid side:grid-cols-2 side:content-start side:gap-x-4 side:[&>*]:col-start-1">
      <Prompt>{l(game.prompt)}</Prompt>

      {/* The message: a Glagolitic letter over each box */}
      <div
        role="group"
        aria-label={t('cipher.message')}
        className="flex flex-wrap justify-center gap-x-3 gap-y-2 rounded-[1.75rem] bg-[#F4EAD5] px-3 py-3 shadow-soft side:col-start-2! side:row-start-1"
      >
        {game.message.bg.split(' ').map((word, w) => (
          <div key={w} className="flex gap-1">
            {[...word].map((c, j) => {
              const n = seen++
              const open = n < filled
              const next = n === filled && !done
              return (
                <div key={j} className="flex flex-col items-center gap-0.5">
                  <span className="sr-only">{t('cipher.symbolAt', { n: n + 1, glyph: glyphName(c) })}</span>
                  <span className="text-[length:min(2rem,8vw)] leading-none text-[#7A3B12]" style={{ fontFamily: "'Noto Sans Glagolitic', serif" }} aria-hidden="true">
                    {GLAGOLITIC[c]}
                  </span>
                  <m.span
                    key={open ? 'o' : 'c'}
                    initial={open ? { scale: 0.4 } : false}
                    animate={{ scale: 1 }}
                    transition={bouncy}
                    lang={open ? 'bg' : undefined}
                    className={`grid size-[min(2.25rem,9vw)] place-items-center rounded-[0.6rem] text-[length:min(1.25rem,5.5vw)] font-black ${
                      open ? 'bg-white text-green-dark' : next ? 'bg-gold-soft ring-[3px] ring-gold' : 'bg-white/60'
                    }`}
                  >
                    {open ? c : ''}
                  </m.span>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* The key */}
      <ul aria-label={t('cipher.key')} className="grid grid-cols-[repeat(auto-fill,minmax(3.4rem,1fr))] gap-1.5 side:col-start-2! side:row-start-2">
        {key.map((c) => (
          <li
            key={c}
            className={`flex items-center justify-center gap-1 rounded-full px-2 py-1 text-base font-black transition ${glow === c ? 'anim-glow bg-gold text-ink' : 'bg-white text-ink shadow-soft'}`}
          >
            <span style={{ fontFamily: "'Noto Sans Glagolitic', serif" }} className="text-xl leading-none text-[#7A3B12]" aria-hidden="true">
              {GLAGOLITIC[c]}
            </span>
            <span aria-hidden="true">=</span>
            <span aria-hidden="true">{c}</span>
            <span className="sr-only">{t('cipher.keyItem', { n: glyphNumber(c) })} <span lang="bg">{c}</span></span>
          </li>
        ))}
      </ul>

      {/* The keyboard: today's letters */}
      {!done && (
        <ul aria-label={t('cipher.letters')} className="flex flex-wrap justify-center gap-2">
          {keyboard.map((c) => (
            <li key={c}>
              <button type="button" lang="bg" onClick={() => press(c)} className="edge-light relative tap press grid size-[max(3rem,var(--tap))] place-items-center rounded-full mat-paper text-2xl font-black text-ink">
                {c}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="sr-only" aria-live="polite">
        {!done && t('cipher.nextBox', { n: filled + 1, glyph: glyphName(letters[filled]!.c) })}
      </p>
      <Feedback
        correct={done ? t('cipher.done') : undefined}
        help={!done ? say : undefined}
        nudge={misses}
        idle={game.hint ? l(game.hint) : t('cipher.idle')}
      />
      {done && (
        <>
          <p className="text-center font-bold" lang="bg">{game.message.bg}</p>
          <p className="text-center font-semibold">{t('cipher.meaning', { meaning: game.message.en })}</p>
          <DoneButton onClick={onDone} />
        </>
      )}
    </div>
  )
}
