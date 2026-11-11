import { useMemo, useState } from 'react'
import { img } from '../components/Brand'
import { Icon } from '../components/Icon'
import type { OrderGame } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { play } from '../sound'
import { DoneButton, Feedback, Prompt } from './Feedback'
import { shuffledIndexes } from './shuffle'

/**
 * Put cards in order: tap the cards one by one and they fill the numbered places.
 * Tap a placed card to take it back. When every place is full, the correct ones
 * lock in green and the others come back to try again — with a hint, not a penalty.
 */
export function Order({ game, onDone }: { game: OrderGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const n = game.items.length
  const start = useMemo(() => shuffledIndexes(n, l(game.prompt)), [n, game, l])
  const [slots, setSlots] = useState<(number | null)[]>(() => Array(n).fill(null))
  const [locked, setLocked] = useState<boolean[]>(() => Array(n).fill(false))
  const [misses, setMisses] = useState(0)
  const solved = locked.every(Boolean)
  const pool = start.filter((i) => !slots.includes(i))

  const place = (item: number) => {
    const free = slots.indexOf(null)
    if (free < 0) return
    play('tap')
    const next = [...slots]
    next[free] = item
    if (next.includes(null)) {
      setSlots(next)
      return
    }
    // All places filled: lock the correct ones, send the rest back.
    const ok = next.map((v, i) => v === i)
    setLocked(ok)
    if (ok.every(Boolean)) {
      setSlots(next)
      play('correct')
    } else {
      setSlots(next.map((v, i) => (ok[i] ? v : null)))
      setMisses((m) => m + 1)
      play('hint')
    }
  }

  const takeBack = (slot: number) => {
    if (locked[slot] || slots[slot] === null) return
    const next = [...slots]
    next[slot] = null
    setSlots(next)
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Prompt>{l(game.prompt)}</Prompt>

      <ol className="flex flex-col gap-2" aria-label={t('order.slots')}>
        {slots.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-green-dark text-lg font-black text-white" aria-hidden="true">
              {i + 1}
            </span>
            {item === null ? (
              <span className="tap flex flex-1 items-center rounded-full bg-sand/70 px-4 text-sm font-bold text-muted shadow-[inset_0_2px_4px_rgb(28_43_35/0.1)]">
                {t('order.empty')}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => takeBack(i)}
                disabled={locked[i]}
                aria-label={`${i + 1}. ${l(game.items[item]!)}`}
                className={`tap press flex min-w-0 flex-1 items-center gap-2 rounded-[1.5rem] px-4 py-2 text-left leading-snug font-extrabold ${
                  locked[i] ? 'bg-green-soft text-green-dark' : 'bg-white shadow-soft'
                }`}
              >
                {game.items[item]!.img && <img src={img(game.items[item]!.img!)} alt="" className="size-10 object-contain" />}
                <span className="min-w-0 flex-1">{l(game.items[item]!)}</span>
                {locked[i] && <Icon name="check" />}
              </button>
            )}
          </li>
        ))}
      </ol>

      {pool.length > 0 && (
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-3" aria-label={t('order.cards')} role="group">
          {pool.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => place(item)}
              className="tap press puck flex items-center gap-2 rounded-[1.5rem] bg-white px-4 py-2 text-left leading-snug font-extrabold [--edge:var(--color-sand)]"
            >
              {game.items[item]!.img && <img src={img(game.items[item]!.img!)} alt="" className="size-10 object-contain" />}
              {l(game.items[item]!)}
            </button>
          ))}
        </div>
      )}

      <Feedback
        correct={solved ? t('order.done') : undefined}
        help={misses === 0 || solved ? undefined : misses >= 2 && game.hint ? l(game.hint) : t('order.tryAgain')}
        nudge={misses}
      />
      {solved && <DoneButton onClick={onDone} />}
    </div>
  )
}
