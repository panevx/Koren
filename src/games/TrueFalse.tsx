import { useState } from 'react'
import { img } from '../components/Brand'
import type { TrueFalseGame } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { m } from '../motion'
import { play } from '../sound'
import { ART } from '../world'
import { HyphenSafe } from '../components/HyphenSafe'
import { DoneButton, Feedback, Prompt } from './Feedback'

/**
 * True or not true? One statement at a time. Whatever the child answers, they hear why — so a wrong answer still teaches.
 * At the end: "you knew N of M" — counted, never punished.
 */
export function TrueFalse({ game, onDone }: { game: TrueFalseGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const [at, setAt] = useState(0)
  const [answer, setAnswer] = useState<boolean | null>(null)
  const [right, setRight] = useState(0)
  const item = game.items[at]!
  const last = at === game.items.length - 1
  const ok = answer !== null && answer === item.answer

  const pick = (v: boolean) => {
    if (answer !== null) return
    setAnswer(v)
    if (v === item.answer) {
      play('correct')
      setRight((n) => n + 1)
    } else play('hint')
  }
  const next = () => {
    play('tap')
    setAt((n) => n + 1)
    setAnswer(null)
  }
  const finished = last && answer !== null

  return (
    <div className="flex flex-1 flex-col gap-3">
      <Prompt>{l(game.prompt)}</Prompt>
      <p className="text-center text-sm font-bold text-muted">{t('tf.count', { n: at + 1, total: game.items.length })}</p>
      <m.div key={at} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="edge-light relative flex flex-col items-center gap-3 rounded-[1.75rem] mat-paper p-5 text-center">
        {item.img && <img src={img(item.img)} alt="" className="pop-3d size-[min(6rem,26vw)] object-contain" />}
        <p className="text-xl leading-snug font-extrabold"><HyphenSafe text={l(item.text)} /></p>
      </m.div>
      <div className="grid grid-cols-2 gap-3">
        {([true, false] as const).map((v) => {
          const chosen = answer === v
          const isRight = answer !== null && v === item.answer
          return (
            <button
              key={String(v)}
              type="button"
              onClick={() => pick(v)}
              disabled={answer !== null}
              className={`press flex flex-col items-center gap-1 rounded-[1.5rem] p-3 text-lg font-black shadow-soft disabled:cursor-default ${
                isRight ? `bg-green-soft text-green-dark ring-[3px] ring-green ${chosen ? 'anim-right' : ''}` : chosen ? 'anim-nudge bg-gold-soft text-ink' : 'bg-white text-ink'
              } ${answer !== null && !isRight && !chosen ? 'opacity-50' : ''}`}
            >
              <img src={img(v ? ART.yes : ART.no)} alt="" className="size-[min(4rem,18vw)]" />
              {v ? t('tf.true') : t('tf.false')}
            </button>
          )
        })}
      </div>
      <Feedback
        correct={finished ? `${l(item.why)} ${t('tf.done', { n: right, total: game.items.length })}` : ok ? l(item.why) : undefined}
        help={answer !== null && !ok && !finished ? l(item.why) : undefined}
        idle={t('tf.idle')}
      />
      {answer !== null && !last && (
        <div className="flex justify-center">
          <button type="button" onClick={next} className="tap press rounded-full bg-green-dark px-6 py-2.5 text-lg font-black text-white">
            {t('tf.next')}
          </button>
        </div>
      )}
      {finished && <DoneButton onClick={onDone} />}
    </div>
  )
}
