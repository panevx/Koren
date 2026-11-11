import { useMemo, useState } from 'react'
import { img } from '../components/Brand'
import type { PuzzleGame } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { play } from '../sound'
import { DoneButton, Feedback, Prompt } from './Feedback'
import { shuffledIndexes } from './shuffle'

const GRID: Record<PuzzleGame['pieces'], { cols: number; rows: number }> = {
  4: { cols: 2, rows: 2 },
  6: { cols: 3, rows: 2 },
  9: { cols: 3, rows: 3 },
}

/**
 * Picture puzzle for small fingers: big pieces, tap one, then tap where it goes — they swap.
 * A piece in its right place locks. The finished picture is always shown small as a guide.
 */
export function Puzzle({ game, onDone }: { game: PuzzleGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const { cols, rows } = GRID[game.pieces]
  const initial = useMemo(() => shuffledIndexes(game.pieces, game.img), [game])
  // order[position] = piece shown at that position
  const [order, setOrder] = useState(initial)
  const [selected, setSelected] = useState<number | null>(null)
  const solved = order.every((piece, pos) => piece === pos)
  const src = img(game.img)

  const tap = (pos: number) => {
    if (solved || order[pos] === pos) return
    if (selected === null) {
      play('tap')
      setSelected(pos)
      return
    }
    if (selected === pos) {
      setSelected(null)
      return
    }
    const next = [...order]
    ;[next[selected], next[pos]] = [next[pos]!, next[selected]!]
    setOrder(next)
    setSelected(null)
    if (next.every((p, i) => p === i)) play('correct')
    else if (next[pos] === pos || next[selected] === selected) play('tap')
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Prompt>{l(game.prompt)}</Prompt>
        </div>
        <img src={src} alt="" className="rounded-level size-20 shrink-0 border-2 border-white object-cover shadow-sm" aria-hidden="true" />
      </div>

      <div
        className="rounded-level mx-auto grid w-full max-w-sm gap-1 overflow-hidden bg-sand p-1"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, aspectRatio: `${cols} / ${rows}` }}
        role="group"
        aria-label={t('puzzle.board')}
      >
        {order.map((piece, pos) => {
          const done = piece === pos
          const active = selected === pos
          const c = piece % cols
          const r = Math.floor(piece / cols)
          return (
            <button
              key={pos}
              type="button"
              onClick={() => tap(pos)}
              disabled={done && !solved}
              aria-pressed={active}
              aria-label={t('puzzle.piece', { n: pos + 1 })}
              className={`relative min-h-16 rounded-md bg-no-repeat transition ${
                active ? 'z-10 scale-95 ring-4 ring-[var(--accent)]' : done ? '' : 'hover:brightness-110'
              }`}
              style={{
                backgroundImage: `url("${src}")`,
                backgroundSize: `${cols * 100}% ${rows * 100}%`,
                backgroundPosition: `${cols > 1 ? (c / (cols - 1)) * 100 : 0}% ${rows > 1 ? (r / (rows - 1)) * 100 : 0}%`,
              }}
            />
          )
        })}
      </div>

      <Feedback correct={solved ? t('puzzle.done') : undefined} help={undefined} />
      {solved && <DoneButton onClick={onDone} />}
    </div>
  )
}
