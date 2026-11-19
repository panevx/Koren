import { useState } from 'react'
import { img } from '../components/Brand'
import { ART } from '../world'
import { Icon } from '../components/Icon'
import type { SortGame } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { play } from '../sound'
import { useDrag } from './drag'
import { DoneButton, Feedback, Prompt } from './Feedback'
import { shuffledIndexes } from './shuffle'

/**
 * Sort into boxes: drag each thing into the right box — or tap it, then tap the box.
 * A thing in the wrong box hops back out and Raya says why. Sorted things stay visible inside their box.
 */
export function Sort({ game, onDone }: { game: SortGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const [order] = useState(() => shuffledIndexes(game.items.length, l(game.prompt)))
  const [placed, setPlaced] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [misses, setMisses] = useState(0)
  const [bump, setBump] = useState<{ item: number; n: number } | null>(null)
  const [say, setSay] = useState<{ good: boolean; text: string } | undefined>()
  const solved = placed.length === game.items.length

  const drop = (item: number, bin: number) => {
    if (placed.includes(item)) return
    const it = game.items[item]!
    setSelected(null)
    if (it.bin === bin) {
      play('correct')
      setPlaced((p) => [...p, item])
      setSay({ good: true, text: t('sort.good', { name: l(it), box: l(game.bins[bin]!) }) })
    } else {
      play('hint')
      setMisses((n) => n + 1)
      setBump({ item, n: misses + 1 })
      setSay({ good: false, text: it.why ? l(it.why) : misses >= 1 && game.hint ? l(game.hint) : t('sort.tryOther') })
    }
  }
  const drag = useDrag((id, target) => drop(Number(id), Number(target.replace('bin-', ''))))

  return (
    <div className="flex flex-1 flex-col gap-3">
      <Prompt>{l(game.prompt)}</Prompt>

      {/* The boxes (drop targets). */}
      <div className={`grid gap-2.5 ${game.bins.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {game.bins.map((bin, b) => {
          const inside = placed.filter((i) => game.items[i]!.bin === b)
          return (
            <button
              key={b}
              type="button"
              data-drop={`bin-${b}`}
              onClick={() => (selected === null ? setSay({ good: false, text: t('sort.pickFirst') }) : drop(selected, b))}
              aria-label={t('sort.putIn', { box: l(bin) })}
              className={`edge-light relative press rounded-level flex min-h-36 flex-col items-center gap-1 mat-paper p-2 text-center transition-shadow data-[over=true]:shadow-float data-[over=true]:ring-4 data-[over=true]:ring-gold ${
                selected !== null ? 'ring-[3px] ring-sky' : ''
              }`}
            >
              <img src={img(bin.img ?? ART.sortBox)} alt="" draggable={false} className="pop-3d size-[min(4.5rem,18vw)] object-contain" />
              <span className="text-[length:min(1rem,4vw)] leading-tight font-black [overflow-wrap:break-word]">{l(bin)}</span>
              <span className="flex flex-wrap justify-center gap-1" aria-label={t('sort.inside', { n: inside.length })}>
                {inside.map((i) => (
                  <m.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={bouncy} className="grid size-8 place-items-center rounded-full bg-green-soft">
                    {game.items[i]!.img ? (
                      <img src={img(game.items[i]!.img!)} alt={l(game.items[i]!)} className="size-6 object-contain" />
                    ) : (
                      <Icon name="check" className="size-4 text-green-dark" />
                    )}
                  </m.span>
                ))}
              </span>
            </button>
          )
        })}
      </div>

      {/* Things still to sort. */}
      {!solved && (
        <ul aria-label={t('sort.left')} className="flex flex-wrap justify-center gap-2.5">
          {order
            .filter((i) => !placed.includes(i))
            .map((i) => {
              const it = game.items[i]!
              const active = selected === i
              return (
                <li key={i}>
                  <button
                    type="button"
                    {...drag(String(i))}
                    onClick={() => {
                      play('tap')
                      setSelected(active ? null : i)
                    }}
                    aria-pressed={active}
                    className={`tap press flex items-center gap-2 rounded-full py-1.5 pr-4 pl-1.5 font-extrabold select-none ${
                      active ? 'bg-gold text-ink shadow-float' : 'bg-white shadow-soft'
                    } ${bump?.item === i ? 'anim-wiggle' : ''}`}
                    key={bump?.item === i ? bump.n : undefined}
                  >
                    {it.img ? (
                      <img src={img(it.img)} alt="" draggable={false} className="pop-3d size-11 object-contain" />
                    ) : (
                      <span className="size-3 rounded-full bg-coral" aria-hidden="true" />
                    )}
                    {l(it)}
                  </button>
                </li>
              )
            })}
        </ul>
      )}

      <Feedback
        correct={solved ? t('sort.done') : say?.good ? say.text : undefined}
        help={!solved && say && !say.good ? say.text : undefined}
        nudge={misses}
        idle={t('sort.idle')}
      />
      {solved && <DoneButton onClick={onDone} />}
    </div>
  )
}
