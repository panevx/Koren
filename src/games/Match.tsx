import { useMemo, useState } from 'react'
import { img } from '../components/Brand'
import type { MatchGame, Option } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { play } from '../sound'
import { DoneButton, Feedback, Prompt } from './Feedback'
import { shuffledIndexes } from './shuffle'

type Side = 'a' | 'b'
/** Number badges of found pairs (white digits — all pass 4.5:1). */
const PAIR_COLORS = ['bg-green-dark', 'bg-coral-dark', 'bg-[#1E6FB8]', 'bg-[#7B2FA0]', 'bg-[#B45309]', 'bg-[#5D4037]']

/**
 * Match pairs by tapping: an item on one side, then its partner on the other
 * (works the same with a finger, a mouse or a keyboard). Found pairs get the same number and colour.
 */
export function Match({ game, onDone }: { game: MatchGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const right = useMemo(() => shuffledIndexes(game.pairs.length, l(game.prompt)), [game, l])
  const [selected, setSelected] = useState<{ side: Side; pair: number } | null>(null)
  const [matched, setMatched] = useState<number[]>([])
  const [misses, setMisses] = useState(0)
  /** Raya speaks only right after a miss; a correct pair clears her message. */
  const [lastMissed, setLastMissed] = useState(false)
  const solved = matched.length === game.pairs.length

  const tap = (side: Side, pair: number) => {
    if (solved || matched.includes(pair)) return
    if (!selected || selected.side === side) {
      play('tap')
      setSelected({ side, pair })
      return
    }
    if (selected.pair === pair) {
      setMatched((m) => [...m, pair])
      setLastMissed(false)
      play('correct')
    } else {
      setMisses((n) => n + 1)
      setLastMissed(true)
      play('hint')
    }
    setSelected(null)
  }

  const card = (side: Side, pair: number, option: Option) => {
    const done = matched.includes(pair)
    const active = selected?.side === side && selected.pair === pair
    const number = matched.indexOf(pair)
    return (
      <button
        key={`${side}${pair}`}
        type="button"
        onClick={() => tap(side, pair)}
        aria-pressed={active || done}
        disabled={done}
        className={`tap press rounded-level relative flex w-full flex-col items-center justify-center gap-1 px-2 py-2.5 text-center leading-tight font-extrabold [container-type:inline-size] ${
          done
            ? 'bg-green-soft text-green-dark'
            : active
              ? 'scale-[1.04] bg-gold text-ink shadow-float'
              : 'bg-white shadow-soft'
        }`}
      >
        {option.img && (
          <img
            src={img(option.img)}
            alt=""
            className={option.img.startsWith('heroes/') ? 'size-16 rounded-full object-cover' : 'pop-3d size-16 object-contain'}
          />
        )}
        {/* The label shrinks with the card (cqw), so one long word never breaks. */}
        <span className="text-[length:clamp(0.6rem,12cqw,1rem)]">{l(option)}</span>
        {done && (
          <m.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={bouncy}
            className={`absolute -top-2 -right-2 grid size-7 place-items-center rounded-full text-sm font-black text-white ring-2 ring-white ${PAIR_COLORS[number % PAIR_COLORS.length]}`}
            aria-hidden="true"
          >
            {number + 1}
          </m.span>
        )}
      </button>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Prompt>{l(game.prompt)}</Prompt>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div role="group" aria-label={t('match.left')} className="flex flex-col gap-3">
          {game.pairs.map((p, i) => card('a', i, p.a))}
        </div>
        <div role="group" aria-label={t('match.right')} className="flex flex-col gap-3">
          {right.map((i) => card('b', i, game.pairs[i]!.b))}
        </div>
      </div>
      <Feedback
        correct={solved ? t('match.done') : undefined}
        help={!lastMissed ? undefined : misses >= 2 && game.hint ? l(game.hint) : t('quiz.tryAgain')}
        nudge={misses}
      />
      {solved && <DoneButton onClick={onDone} />}
    </div>
  )
}
