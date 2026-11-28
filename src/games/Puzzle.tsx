import { detailImage } from '../components/detailImage'
import { useMemo, useState } from 'react'
import { img } from '../components/Brand'
import type { PuzzleGame } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { play } from '../sound'
import { DoneButton, Feedback, Prompt } from './Feedback'
import { useDrag } from './drag'
import { shuffledIndexes } from './shuffle'

const GRID: Record<PuzzleGame['pieces'], { cols: number; rows: number }> = {
  4: { cols: 2, rows: 2 },
  6: { cols: 3, rows: 2 },
  9: { cols: 3, rows: 3 },
}

/**
 * Picture puzzle for small fingers: big pieces, tap one, then tap where it goes — they swap.
 * v0.22: a piece can also be dragged onto another one (they swap).
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
    swap(selected, pos)
  }

  /** Swap the pieces at two places (tap, tap — or v0.22: drag one onto the other). */
  const swap = (a: number, b: number) => {
    if (a === b || solved || order[a] === a || order[b] === b) return
    const next = [...order]
    ;[next[a], next[b]] = [next[b]!, next[a]!]
    setOrder(next)
    setSelected(null)
    if (next.every((p, i) => p === i)) play('correct')
    else if (next[a] === a || next[b] === b) play('tap')
  }
  const drag = useDrag((from, to) => swap(Number(from), Number(to)))

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <Prompt>{l(game.prompt)}</Prompt>
        </div>
        <img src={src} alt="" className="size-[min(5rem,17vw)] shrink-0 -rotate-3 rounded-[1.25rem] object-cover shadow-float ring-4 ring-white" aria-hidden="true" />
      </div>

      <div
        className="edge-light relative mx-auto grid w-full max-w-sm gap-1.5 rounded-[2rem] mat-paper p-2.5"
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
              {...drag(String(pos), !done && !solved)}
              data-drop={pos}
              onClick={() => tap(pos)}
              disabled={done && !solved}
              aria-pressed={active}
              aria-label={t('puzzle.piece', { n: pos + 1 })}
              className={`press relative min-h-16 overflow-hidden rounded-2xl ${
                active ? 'z-10 scale-95 shadow-float ring-4 ring-coral' : done ? '' : 'shadow-soft'
              }`}
            >
              <img src={src} {...detailImage(game.img, 'min(100vw, 368px)')} alt="" draggable={false}
                className="pointer-events-none absolute max-w-none"
                style={{ width: `${cols * 100}%`, height: `${rows * 100}%`, left: `-${c * 100}%`, top: `-${r * 100}%` }} />
            </button>
          )
        })}
      </div>

      <Feedback correct={solved ? t('puzzle.done') : undefined} help={undefined} />
      {solved && <DoneButton onClick={onDone} />}
    </div>
  )
}
