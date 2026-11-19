import { useEffect, useState } from 'react'
import { img } from '../components/Brand'
import type { BlitzGame } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { m } from '../motion'
import { play } from '../sound'
import { ART } from '../world'
import { DoneButton, Feedback, Prompt } from './Feedback'
import { shuffledIndexes } from './shuffle'

/**
 * Blitz: quick questions one after another. The clock is the child's choice — OFF by default. With the clock on,
 * an answer before the time is up earns a lightning star; when the time is up nothing is lost: the clock just
 * disappears for that question and the child answers in peace. A wrong answer: Raya's hint, try again.
 */
export function Blitz({ game, onDone }: { game: BlitzGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const [clock, setClock] = useState(false)
  const [at, setAt] = useState(0)
  const [tried, setTried] = useState<number[]>([])
  const [left, setLeft] = useState(game.seconds)
  const [stars, setStars] = useState(0)
  const [say, setSay] = useState<string | undefined>()
  const done = at === game.questions.length
  const q = game.questions[Math.min(at, game.questions.length - 1)]!
  const order = shuffledIndexes(q.options.length, l(q.q))
  const running = clock && !done && left > 0

  useEffect(() => {
    if (!running) return
    const id = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [running, left])
  useEffect(() => {
    if (clock && left === 0 && !done) setSay(t('blitz.timeUp'))
  }, [clock, left, done, t])

  const pick = (i: number) => {
    if (done || tried.includes(i)) return
    if (i === q.answer) {
      play('correct')
      if (clock && left > 0) setStars((n) => n + 1)
      setAt((n) => n + 1)
      setTried([])
      setLeft(game.seconds)
      setSay(undefined)
    } else {
      play('hint')
      setTried((s) => [...s, i])
      setSay(q.hint ? l(q.hint) : t('blitz.again'))
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <Prompt>{l(game.prompt)}</Prompt>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={clock}
          onClick={() => {
            setClock((c) => !c)
            setLeft(game.seconds)
            setSay(undefined)
          }}
          className={`tap press flex items-center gap-2 rounded-full py-1 pr-4 pl-1 text-sm font-extrabold shadow-soft ${clock ? 'bg-coral text-coral-ink' : 'bg-white text-ink'}`}
        >
          <img src={img(ART.timer)} alt="" className="size-9" />
          {clock ? t('blitz.clockOn') : t('blitz.clockOff')}
        </button>
        <p className="text-sm font-bold text-muted">{t('blitz.count', { n: Math.min(at + 1, game.questions.length), total: game.questions.length })}</p>
      </div>
      {!done && (
        <m.div key={at} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="edge-light relative rounded-[1.75rem] mat-paper p-5">
          {clock && left > 0 && (
            <div className="absolute -top-2 -right-2 grid size-12 place-items-center rounded-full bg-coral text-lg font-black text-coral-ink shadow-float" aria-live="off">
              {left}
            </div>
          )}
          <p className="pr-8 text-xl leading-snug font-extrabold">{l(q.q)}</p>
        </m.div>
      )}
      {!done && (
        <ul aria-label={t('blitz.answers')} className="grid grid-cols-2 gap-2.5">
          {order.map((i) => {
            const o = q.options[i]!
            const no = tried.includes(i)
            return (
              <li key={`${at}-${i}`}>
                <button
                  type="button"
                  onClick={() => pick(i)}
                  disabled={no}
                  className="edge-light relative press flex h-full w-full flex-col items-center justify-center gap-1 rounded-[1.25rem] mat-paper px-3 py-3 text-lg font-black disabled:opacity-40"
                >
                  {o.img && <img src={img(o.img)} alt="" className="size-12 object-contain" />}
                  {l(o)}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <Feedback
        correct={done ? (clock || stars ? t('blitz.doneStars', { n: stars }) : t('blitz.done')) : undefined}
        help={!done ? say : undefined}
        nudge={tried.length}
        idle={t('blitz.idle')}
      />
      {done && <DoneButton onClick={onDone} />}
    </div>
  )
}
