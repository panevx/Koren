import { useState } from 'react'
import { img } from '../components/Brand'
import { ART } from '../world'
import { SceneBackdrop } from '../components/Scene'
import type { FindGame } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { play } from '../sound'
import { DoneButton, Feedback, Prompt } from './Feedback'

/**
 * "Find the hidden": the child explores an illustrated scene. Some things hide behind a bush or a rock
 * and appear when it is tapped. The tray below shows what to find; found things light up there.
 * After two taps on the wrong thing a lantern glows next to one that is still missing.
 */
export function Find({ game, onDone }: { game: FindGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const [lifted, setLifted] = useState<number[]>([])
  const [found, setFound] = useState<number[]>([])
  const [misses, setMisses] = useState(0)
  const [say, setSay] = useState<{ good: boolean; text: string } | undefined>()
  const targets = game.items.map((it, i) => (it.target ? i : -1)).filter((i) => i >= 0)
  const solved = targets.every((i) => found.includes(i))
  const glow = !solved && misses >= 2 ? targets.find((i) => !found.includes(i)) : undefined

  const lift = (i: number) => {
    play('tap')
    setLifted((s) => [...s, i])
    setSay(undefined)
  }
  const tap = (i: number) => {
    const item = game.items[i]!
    if (found.includes(i) || solved) return
    if (item.target) {
      play('correct')
      setFound((s) => [...s, i])
      setSay({ good: true, text: t('find.found', { name: l(item) }) })
    } else {
      play('hint')
      setMisses((n) => n + 1)
      setSay({ good: false, text: misses >= 1 && game.hint ? l(game.hint) : t('find.notThis', { name: l(item) }) })
    }
  }

  return (
    // Wide landscape screen: the task and the tray on the left, the scene on the right — as big as the screen allows.
    <div className="flex flex-1 flex-col gap-3 side:grid side:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] side:content-start side:gap-x-4 side:[&>*]:col-start-1">
      <Prompt>{l(game.prompt)}</Prompt>

      <div role="group" aria-label={t('find.scene')} className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-[2rem] shadow-soft side:col-start-2! side:row-span-4 side:row-start-1 side:w-[min(100%,calc((100dvh-6.5rem)*4/3))]">
        <SceneBackdrop scene={game.scene} className="absolute inset-0 size-full" />
        {game.items.map((item, i) => {
          const hidden = item.under && !lifted.includes(i)
          const isFound = found.includes(i)
          const pos = { left: `${item.x}%`, top: `${item.y}%`, width: `${item.size}%` }
          return (
            <div key={i} className="absolute aspect-square -translate-x-1/2 -translate-y-1/2" style={pos}>
              {/* The thing itself (under its cover until the cover is lifted). */}
              <m.button
                type="button"
                onClick={() => tap(i)}
                disabled={!!hidden || isFound}
                aria-label={hidden ? undefined : l(item)}
                aria-hidden={hidden ? true : undefined}
                tabIndex={hidden ? -1 : undefined}
                initial={false}
                animate={hidden ? { scale: 0.5, opacity: 0 } : isFound ? { scale: [1, 1.25, 1.1], opacity: 1 } : { scale: 1, opacity: 1 }}
                transition={bouncy}
                className="absolute inset-0 grid place-items-center rounded-full"
              >
                <img src={img(item.img)} alt="" draggable={false} className="pop-3d size-full object-contain" />
                {isFound && (
                  <m.img
                    src={img(ART.star)}
                    alt=""
                    initial={{ scale: 0, rotate: -40 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={bouncy}
                    className="absolute -top-1 -right-1 size-[42%]"
                  />
                )}
              </m.button>
              {item.under && (
                <m.button
                  type="button"
                  onClick={() => lift(i)}
                  disabled={!hidden}
                  aria-label={t('find.lookUnder', { n: i + 1 })}
                  aria-hidden={hidden ? undefined : true}
                  tabIndex={hidden ? undefined : -1}
                  initial={false}
                  animate={hidden ? { x: 0, y: 0, rotate: 0, opacity: 1 } : { x: '70%', y: '-30%', rotate: 14, opacity: 0.15 }}
                  transition={bouncy}
                  className={`absolute inset-[-28%] grid place-items-center ${hidden ? '' : 'pointer-events-none'}`}
                >
                  <img src={img(item.under)} alt="" draggable={false} className="pop-3d size-full object-contain" />
                </m.button>
              )}
              {glow === i && (
                <span className="anim-glow pointer-events-none absolute inset-[-25%] rounded-full bg-gold/45" aria-hidden="true" />
              )}
            </div>
          )
        })}
      </div>

      {/* What to find — the tray fills up. */}
      <ul aria-label={t('find.toFind')} className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-white px-3 py-2 shadow-soft">
        <li className="sr-only">{t('find.count', { n: found.length, total: targets.length })}</li>
        {targets.map((i) => {
          const item = game.items[i]!
          const ok = found.includes(i)
          return (
            <li key={i} className={`grid size-[min(3.25rem,13vw)] place-items-center rounded-full ${ok ? 'bg-green-soft' : 'bg-sand'}`}>
              <img
                src={img(item.img)}
                alt={l(item)}
                className={`size-[82%] object-contain transition ${ok ? '' : 'opacity-45 grayscale'}`}
              />
            </li>
          )
        })}
      </ul>

      <Feedback
        correct={solved ? t('find.done') : say?.good ? say.text : undefined}
        help={!solved && say && !say.good ? say.text : undefined}
        nudge={misses}
        idle={t('find.idle')}
      />
      {solved && <DoneButton onClick={onDone} />}
    </div>
  )
}
