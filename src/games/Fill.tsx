import { useMemo, useState } from 'react'
import { img } from '../components/Brand'
import type { FillGame } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { m } from '../motion'
import { play } from '../sound'
import { useDrag } from './drag'
import { DoneButton, Feedback, Prompt } from './Feedback'
import { shuffledIndexes } from './shuffle'

/**
 * Fill the gap: one sentence at a time (a proverb, a riddle line, grammar). Drag a word tile into the gap, or tap it.
 * The right word snaps in and the next sentence comes; a wrong one jumps back and Raya gives the sentence's hint.
 * The finished sentences stay above, so the child sees what they have built.
 */
export function Fill({ game, onDone }: { game: FillGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const [at, setAt] = useState(0)
  const [gone, setGone] = useState<number[]>([])
  const [bump, setBump] = useState<{ k: number; n: number } | null>(null)
  const [misses, setMisses] = useState(0)
  const [say, setSay] = useState<{ good: boolean; text: string } | undefined>()
  const done = at === game.items.length
  const item = game.items[Math.min(at, game.items.length - 1)]!
  const order = useMemo(() => shuffledIndexes(item.options.length, `${l(item.text)}`), [item, l])

  const put = (k: number) => {
    if (done) return
    if (k === item.answer) {
      play('correct')
      setSay({ good: true, text: t('fill.good') })
      setGone([])
      setAt((n) => n + 1)
    } else {
      play('hint')
      setMisses((n) => n + 1)
      setBump({ k, n: misses + 1 })
      setGone((g) => [...g, k])
      setSay({ good: false, text: item.hint ? l(item.hint) : t('fill.again') })
    }
  }
  const drag = useDrag((id) => put(Number(id)))
  const parts = (text: { bg: string; en: string }) => l(text).split('___') as [string, string]

  return (
    <div className="flex flex-1 flex-col gap-3">
      <Prompt>{l(game.prompt)}</Prompt>

      <ol className="flex flex-col gap-2.5">
        {game.items.slice(0, at).map((it, i) => {
          const [a, b] = parts(it.text)
          return (
            <li key={i} className="rounded-[1.25rem] bg-green-soft px-4 py-2.5 text-lg leading-snug font-bold text-green-dark">
              {a}
              <span className="font-black underline decoration-gold decoration-[3px] underline-offset-4">{l(it.options[it.answer]!)}</span>
              {b}
            </li>
          )
        })}
        {!done && (
          <m.li key={at} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="edge-light relative rounded-[1.5rem] mat-paper px-4 py-4 text-xl leading-relaxed font-bold">
            {parts(item.text)[0]}
            <span
              data-drop="gap"
              aria-label={t('fill.gap')}
              className="mx-1 inline-block min-w-[5.5rem] translate-y-1 rounded-[0.75rem] border-[3px] border-dashed border-green-deep bg-gold-soft/60 px-2 text-center align-baseline transition-transform data-[over=true]:scale-110 data-[over=true]:bg-gold"
            >
              &nbsp;
            </span>
            {parts(item.text)[1]}
          </m.li>
        )}
      </ol>

      {!done && (
        <>
          <p className="text-center text-sm font-bold text-muted">{t('fill.count', { n: at + 1, total: game.items.length })}</p>
          <ul aria-label={t('fill.words')} className="flex flex-wrap justify-center gap-2.5">
            {order.map((k) => {
              const o = item.options[k]!
              const off = gone.includes(k)
              return (
                <li key={`${at}-${k}`}>
                  <button
                    key={bump?.k === k ? bump.n : undefined}
                    type="button"
                    {...drag(String(k), !off)}
                    onClick={() => put(k)}
                    disabled={off}
                    className={`tap press flex items-center gap-1.5 rounded-[1rem] bg-[#FFF4D6] px-4 py-2 text-lg font-black text-ink shadow-[0_4px_0_#E2C37A] select-none disabled:opacity-40 ${bump?.k === k ? 'anim-wiggle' : ''}`}
                  >
                    {o.img && <img src={img(o.img)} alt="" draggable={false} className="size-9 object-contain" />}
                    {l(o)}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <Feedback correct={done ? t('fill.done') : say?.good ? say.text : undefined} help={!done && say && !say.good ? say.text : undefined} nudge={misses} idle={t('fill.idle')} />
      {done && <DoneButton onClick={onDone} />}
    </div>
  )
}
