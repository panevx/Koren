import { useMemo, useState } from 'react'
import { img } from '../components/Brand'
import { Sparkles } from '../components/ds'
import type { CookGame } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { play } from '../sound'
import { useDrag } from './drag'
import { DoneButton, Feedback, Prompt } from './Feedback'
import { shuffledIndexes } from './shuffle'

/**
 * Cook: 1) put the right ingredients into the pot — tap one, or drag it into the pot; a wrong one jumps back out
 * and Raya says why; 2) if the recipe has steps, tap them in the right order (the done ones line up, numbered);
 * 3) the dish appears with sparkles.
 */
export function Cook({ game, onDone }: { game: CookGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const order = useMemo(() => shuffledIndexes(game.ingredients.length, l(game.prompt)), [game.ingredients.length, l, game.prompt])
  const stepOrder = useMemo(() => (game.steps.length ? shuffledIndexes(game.steps.length, `${l(game.prompt)}-steps`) : []), [game.steps.length, l, game.prompt])
  const [inPot, setInPot] = useState<number[]>([])
  const [out, setOut] = useState<number[]>([])
  const [stepsDone, setStepsDone] = useState(0)
  const [bump, setBump] = useState<{ k: string; n: number } | null>(null)
  const [misses, setMisses] = useState(0)
  const [say, setSay] = useState<{ good: boolean; text: string } | undefined>()
  const needed = game.ingredients.map((x, i) => (x.belongs ? i : -1)).filter((i) => i >= 0)
  const mixed = needed.every((i) => inPot.includes(i))
  const cooked = mixed && stepsDone === game.steps.length

  const miss = (k: string, text: string) => {
    play('hint')
    setMisses((n) => n + 1)
    setBump({ k, n: misses + 1 })
    setSay({ good: false, text })
  }

  const add = (i: number) => {
    if (inPot.includes(i) || out.includes(i) || mixed) return
    const ing = game.ingredients[i]!
    if (ing.belongs) {
      play('correct')
      setInPot((s) => [...s, i])
      setSay({ good: true, text: t('cook.in', { name: l(ing) }) })
    } else {
      setOut((s) => [...s, i])
      miss(`i${i}`, l(ing.why!))
    }
  }
  const drag = useDrag((id) => add(Number(id)))

  const step = (k: number) => {
    if (k === stepsDone) {
      play('correct')
      setStepsDone((n) => n + 1)
      setSay({ good: true, text: t('cook.stepOk') })
    } else miss(`s${k}`, t('cook.stepFirst'))
  }

  return (
    <div className="flex flex-1 flex-col gap-3 side:grid side:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] side:content-start side:gap-x-4 side:[&>*]:col-start-1">
      <Prompt>{l(game.prompt)}</Prompt>

      {/* The pot (a drop target); the dish when it is ready */}
      <div className="relative mx-auto grid w-[min(15rem,60vw)] place-items-center side:col-start-2! side:row-span-4 side:row-start-1 side:w-[min(18rem,32vw)]">
        {cooked ? (
          <m.div initial={{ scale: 0.4, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={bouncy} className="relative">
            <Sparkles burst="dish" />
            <img src={img(game.dish.img)} alt={l(game.dish)} className="pop-3d w-full object-contain" />
          </m.div>
        ) : (
          <div data-drop="pot" className="relative w-full rounded-full transition-transform data-[over=true]:scale-110" aria-label={t('cook.pot')} role="img">
            <img src={img(game.vessel)} alt="" draggable={false} className="pop-3d w-full object-contain" />
          </div>
        )}
      </div>

      {/* what is already in the pot */}
      {inPot.length > 0 && !cooked && (
        <ul aria-label={t('cook.inside')} className="-mt-1 flex flex-wrap justify-center gap-1.5">
          {inPot.map((i) => {
            const x = game.ingredients[i]!
            return (
              <m.li key={i} initial={{ y: -16, scale: 0.6 }} animate={{ y: 0, scale: 1 }} transition={bouncy} className="flex items-center gap-1 rounded-full bg-green-soft py-0.5 pr-2.5 pl-0.5 text-sm font-extrabold text-green-dark">
                {x.img ? <img src={img(x.img)} alt="" className="size-7 object-contain" /> : <span className="w-1.5" />}
                {l(x)}
              </m.li>
            )
          })}
        </ul>
      )}

      {/* 1) the ingredients */}
      {!mixed && (
        <ul aria-label={t('cook.ingredients')} className="flex flex-wrap justify-center gap-2">
          {order
            .filter((i) => !inPot.includes(i) && !out.includes(i))
            .map((i) => {
              const x = game.ingredients[i]!
              return (
                <li key={i}>
                  <button
                    key={bump?.k === `i${i}` ? bump.n : undefined}
                    type="button"
                    {...drag(String(i))}
                    onClick={() => add(i)}
                    className={`edge-light relative tap press flex items-center gap-1.5 rounded-full mat-paper py-1 pr-4 font-extrabold select-none ${x.img ? 'pl-1' : 'pl-4'}`}
                  >
                    {x.img && <img src={img(x.img)} alt="" draggable={false} className="size-11 object-contain" />}
                    <span className="leading-tight">{l(x)}</span>
                  </button>
                </li>
              )
            })}
        </ul>
      )}

      {/* 2) the steps */}
      {mixed && game.steps.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-center font-extrabold text-green-dark">{t('cook.stepsTitle')}</p>
          <ol className="flex flex-col gap-1.5">
            {game.steps.slice(0, stepsDone).map((s, k) => (
              <m.li key={k} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 rounded-full bg-green-soft px-3 py-1.5 font-bold text-green-dark">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-sm font-black">{k + 1}</span>
                <span className="min-w-0 flex-1">{l(s)}</span>
              </m.li>
            ))}
          </ol>
          {!cooked && (
            <ul aria-label={t('cook.steps')} className="flex flex-col gap-2">
              {stepOrder
                .filter((k) => k >= stepsDone)
                .map((k) => (
                  <li key={k}>
                    <button
                      key={bump?.k === `s${k}` ? bump.n : undefined}
                      type="button"
                      onClick={() => step(k)}
                      className={`edge-light relative tap press w-full rounded-[1.25rem] mat-paper px-4 py-2 text-left font-bold ${bump?.k === `s${k}` ? 'anim-wiggle' : ''}`}
                    >
                      {l(game.steps[k]!)}
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      <Feedback
        correct={cooked ? l(game.done) : say?.good ? say.text : undefined}
        help={!cooked && say && !say.good ? say.text : undefined}
        nudge={misses}
        idle={t(mixed ? 'cook.stepsIdle' : 'cook.idle')}
      />
      {cooked && <DoneButton onClick={onDone} />}
    </div>
  )
}
