import { useEffect, useState } from 'react'
import { img } from '../components/Brand'
import { ART } from '../world'
import type { ChestGame } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { play } from '../sound'
import { useDrag } from './drag'
import { DoneButton, Feedback, Prompt } from './Feedback'
import { shuffledIndexes } from './shuffle'

/**
 * Treasure chest ("Put the tradition together"): put in the chest only the things that belong.
 * Tap a thing (or drag it into the chest). A thing that does not belong jumps back and Raya explains why —
 * so the wrong answers teach too. When everything is in, the chest closes, opens again and shows a fact.
 */
export function Chest({ game, onDone }: { game: ChestGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const [order] = useState(() => shuffledIndexes(game.items.length, l(game.prompt)))
  const [inside, setInside] = useState<number[]>([])
  const [misses, setMisses] = useState(0)
  const [bump, setBump] = useState<{ item: number; n: number } | null>(null)
  const [say, setSay] = useState<{ good: boolean; text: string } | undefined>()
  const [stage, setStage] = useState<'open' | 'closed' | 'treasure'>('open')
  const need = game.items.filter((i) => i.belongs).length
  const solved = inside.length === need

  useEffect(() => {
    if (!solved) return
    setStage('closed')
    const timer = setTimeout(() => {
      setStage('treasure')
      play('badge')
    }, 900)
    return () => clearTimeout(timer)
  }, [solved])

  const put = (i: number) => {
    if (solved || inside.includes(i)) return
    const item = game.items[i]!
    if (item.belongs) {
      play('correct')
      setInside((s) => [...s, i])
      setSay({ good: true, text: t('chest.in', { name: l(item) }) })
    } else {
      play('hint')
      setMisses((n) => n + 1)
      setBump({ item: i, n: misses + 1 })
      setSay({ good: false, text: item.why ? l(item.why) : t('chest.notThis', { name: l(item) }) })
    }
  }
  const drag = useDrag((id, target) => target === 'chest' && put(Number(id)))

  return (
    <div className="flex flex-1 flex-col gap-3">
      <Prompt>{l(game.prompt)}</Prompt>

      <div className="relative flex flex-col items-center">
        {stage === 'treasure' && (
          <m.img
            src={img(ART.burst)}
            alt=""
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1.15, opacity: 1 }}
            transition={bouncy}
            className="anim-spin-slow absolute top-0 size-[min(13rem,52vw)]"
          />
        )}
        <div
          data-drop="chest"
          role="img"
          aria-label={t('chest.label', { n: inside.length, total: need })}
          className="relative grid size-[min(10rem,42vw)] place-items-center rounded-full transition-transform data-[over=true]:scale-110"
        >
          <m.img
            key={stage}
            src={img(stage === 'closed' ? ART.chestClosed : ART.chestOpen)}
            alt=""
            draggable={false}
            initial={{ scale: 0.85, y: 6 }}
            animate={{ scale: 1, y: 0 }}
            transition={bouncy}
            className="pop-3d size-full object-contain"
          />
        </div>
        {/* What is already inside */}
        <div className="-mt-2 flex min-h-10 flex-wrap justify-center gap-1.5" aria-hidden="true">
          {Array.from({ length: need }, (_, k) => {
            const i = inside[k]
            return (
              <span key={k} className={`grid size-10 place-items-center rounded-full ${i === undefined ? 'bg-sand' : 'bg-gold-soft'}`}>
                {i !== undefined && (
                  <m.img initial={{ scale: 0, y: -30 }} animate={{ scale: 1, y: 0 }} transition={bouncy} src={img(game.items[i]!.img)} alt="" className="size-8 object-contain" />
                )}
              </span>
            )
          })}
        </div>
      </div>

      {stage === 'treasure' ? (
        <m.div
          initial={{ opacity: 0, y: 20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={bouncy}
          className="rounded-level flex items-center gap-3 bg-gold-soft p-4 shadow-soft"
          role="status"
        >
          <img src={img(ART.scroll)} alt="" className="pop-3d size-[min(4.5rem,18vw)] shrink-0 object-contain" />
          <p className="min-w-0 flex-1 text-lg leading-snug font-bold">{l(game.reward)}</p>
        </m.div>
      ) : (
        !solved && (
          <ul aria-label={t('chest.shelf')} className="grid grid-cols-2 gap-2.5 min-[420px]:grid-cols-3">
            {order
              .filter((i) => !inside.includes(i))
              .map((i) => {
                const item = game.items[i]!
                return (
                  <li key={i}>
                    <button
                      key={bump?.item === i ? bump.n : undefined}
                      type="button"
                      {...drag(String(i))}
                      onClick={() => put(i)}
                      className={`tap press rounded-level flex w-full flex-col items-center gap-1 bg-white p-2 text-center font-extrabold shadow-soft select-none [container-type:inline-size] ${
                        bump?.item === i ? 'anim-wiggle' : ''
                      }`}
                    >
                      <img src={img(item.img)} alt="" draggable={false} className="pop-3d size-[min(4rem,16vw)] object-contain" />
                      <span className="text-[length:clamp(0.65rem,11cqw,1rem)] leading-tight">{l(item)}</span>
                    </button>
                  </li>
                )
              })}
          </ul>
        )
      )}

      {stage !== 'treasure' && (
        <Feedback correct={say?.good ? say.text : undefined} help={say && !say.good ? say.text : undefined} nudge={misses} idle={t('chest.idle')} />
      )}
      {stage === 'treasure' && <DoneButton onClick={onDone} />}
    </div>
  )
}
