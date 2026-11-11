import { useMemo, useState } from 'react'
import { img } from '../components/Brand'
import type { MatchGame, Option } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { play } from '../sound'
import { DoneButton, Feedback, Prompt } from './Feedback'
import { shuffledIndexes } from './shuffle'

type Side = 'a' | 'b'
const PAIR_COLORS = ['bg-green', 'bg-red', 'bg-[#1E88E5]', 'bg-[#8E24AA]', 'bg-[#EF6C00]', 'bg-[#5D4037]']

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
        className={`tap rounded-level relative flex w-full flex-col items-center justify-center gap-1 border-2 px-2 py-2 text-center text-base leading-tight font-extrabold transition ${
          done
            ? 'border-green bg-green/10 text-green-dark'
            : active
              ? 'border-gold bg-gold/20 shadow-md ring-2 ring-gold'
              : 'border-sand bg-white hover:border-green'
        }`}
      >
        {option.img && <img src={img(option.img)} alt="" className="size-14 object-contain" />}
        <span>{l(option)}</span>
        {done && (
          <span
            className={`absolute -top-2 -right-2 grid size-7 place-items-center rounded-full text-sm font-black text-white ${PAIR_COLORS[number % PAIR_COLORS.length]}`}
            aria-hidden="true"
          >
            {number + 1}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Prompt>{l(game.prompt)}</Prompt>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div className="flex flex-col gap-3">{game.pairs.map((p, i) => card('a', i, p.a))}</div>
        <div className="flex flex-col gap-3">{right.map((i) => card('b', i, game.pairs[i]!.b))}</div>
      </div>
      <Feedback
        correct={solved ? t('match.done') : undefined}
        help={!lastMissed ? undefined : misses >= 2 && game.hint ? l(game.hint) : t('quiz.tryAgain')}
      />
      {solved && <DoneButton onClick={onDone} />}
    </div>
  )
}
