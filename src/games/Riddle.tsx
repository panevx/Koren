import { useState } from 'react'
import { img } from '../components/Brand'
import type { RiddleGame } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { play } from '../sound'
import { ART } from '../world'
import { DoneButton, Feedback, Prompt } from './Feedback'
import { shuffledIndexes } from './shuffle'

/**
 * A riddle "Who am I?": the clues open one by one (the first is open). The child may answer at any time;
 * a wrong answer is never a "no" — it opens the next clue (Raya: "listen to one more clue").
 */
export function Riddle({ game, onDone }: { game: RiddleGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const [open, setOpen] = useState(1)
  const [tried, setTried] = useState<number[]>([])
  const [solved, setSolved] = useState(false)
  const [misses, setMisses] = useState(0)
  const [say, setSay] = useState<string | undefined>()
  const order = shuffledIndexes(game.options.length, l(game.prompt))
  const more = open < game.clues.length

  const next = () => {
    play('tap')
    setOpen((n) => Math.min(game.clues.length, n + 1))
    setSay(undefined)
  }
  const pick = (i: number) => {
    if (solved || tried.includes(i)) return
    if (i === game.answer) {
      play('correct')
      setSolved(true)
      return
    }
    play('hint')
    setTried((s) => [...s, i])
    setMisses((n) => n + 1)
    setOpen((n) => Math.min(game.clues.length, n + 1))
    setSay(more ? t('riddle.notYet', { name: l(game.options[i]!) }) : t('riddle.notHim', { name: l(game.options[i]!) }))
  }

  return (
    <div className="flex flex-1 flex-col gap-3 side:grid side:grid-cols-2 side:content-start side:gap-x-4 side:[&>*]:col-start-1">
      <Prompt>{l(game.prompt)}</Prompt>

      {/* The clues: open ones are read, closed ones wait as cards */}
      <ol aria-label={t('riddle.clues')} className="flex flex-col gap-2">
        {game.clues.map((c, i) => (
          <li key={i}>
            {i < open ? (
              <m.p
                initial={i === 0 ? false : { opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={bouncy}
                className="flex items-start gap-2 rounded-[1.25rem] bg-white px-3 py-2.5 text-lg leading-snug font-bold shadow-soft"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gold-soft text-sm font-black text-ink" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">{l(c)}</span>
              </m.p>
            ) : (
              <span className="flex items-center gap-2 rounded-[1.25rem] bg-sand/60 px-3 py-2.5 text-sm font-bold text-muted" aria-hidden="true">
                <img src={img(ART.lantern)} alt="" className="size-6 opacity-60" />
                {t('riddle.closed', { n: i + 1 })}
              </span>
            )}
          </li>
        ))}
      </ol>
      {!solved && more && (
        <div className="flex justify-center">
          <button type="button" onClick={next} className="tap press rounded-full bg-white px-5 py-2 text-base font-extrabold text-green-dark shadow-soft">
            {t('riddle.more')}
          </button>
        </div>
      )}

      {/* The answers, with pictures */}
      <ul aria-label={t('riddle.answers')} className="grid grid-cols-2 content-start gap-2.5 side:col-start-2! side:row-span-4 side:row-start-1">
        {order.map((i) => {
          const o = game.options[i]!
          const right = solved && i === game.answer
          const no = tried.includes(i)
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => pick(i)}
                disabled={no || (solved && !right)}
                className={`press flex h-full w-full flex-col items-center gap-1 rounded-[1.5rem] p-2 font-extrabold [container-type:inline-size] ${
                  right ? 'bg-green-soft text-green-dark ring-[3px] ring-green' : no ? 'bg-sand/50 text-muted opacity-60' : 'bg-white shadow-soft'
                }`}
              >
                {o.img && <img src={img(o.img)} alt="" className={`pop-3d size-[min(5.5rem,24vw)] object-contain ${no ? 'grayscale' : ''}`} />}
                <span className="text-center text-[length:clamp(0.7rem,11cqw,1rem)] leading-tight">{l(o)}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <Feedback correct={solved ? l(game.fact) : undefined} help={!solved ? say : undefined} nudge={misses} idle={t('riddle.idle')} />
      {solved && <DoneButton onClick={onDone} />}
    </div>
  )
}
