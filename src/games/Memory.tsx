import { useEffect, useMemo, useState } from 'react'
import { img } from '../components/Brand'
import { ART } from '../world'
import type { MemoryGame, Option } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { play } from '../sound'
import { DoneButton, Feedback, Prompt } from './Feedback'
import { shuffledIndexes } from './shuffle'

/**
 * Memory: turn two cards; a pair stays open. Pairs can be picture + picture (small children)
 * or picture + word (older ones). Turned cards that do not match close again after a moment.
 */
export function Memory({ game, onDone }: { game: MemoryGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const cards = useMemo(() => shuffledIndexes(game.pairs.length * 2, l(game.prompt)), [game, l])
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [misses, setMisses] = useState(0)
  const [say, setSay] = useState<{ good: boolean; text: string } | undefined>()
  const solved = matched.length === game.pairs.length
  const pairOf = (card: number) => Math.floor(cards[card]! / 2)
  const face = (card: number): Option => {
    const p = game.pairs[pairOf(card)]!
    return cards[card]! % 2 === 1 && p.b ? p.b : p.a
  }

  // Two different cards: show them for a moment, then turn them back.
  useEffect(() => {
    if (open.length !== 2) return
    const [x, y] = open as [number, number]
    if (pairOf(x) === pairOf(y)) {
      play('correct')
      setMatched((s) => [...s, pairOf(x)])
      setSay({ good: true, text: t('memory.pair', { name: l(game.pairs[pairOf(x)]!.a) }) })
      setOpen([])
      return
    }
    play('hint')
    setMisses((n) => n + 1)
    setSay({ good: false, text: t('memory.again') })
    const timer = setTimeout(() => setOpen([]), 1100)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const turn = (card: number) => {
    if (open.length === 2 || open.includes(card) || matched.includes(pairOf(card))) return
    play('tap')
    setOpen((o) => [...o, card])
  }

  const cols = cards.length <= 4 ? 'grid-cols-2' : cards.length <= 9 ? 'grid-cols-3' : 'grid-cols-4'

  return (
    <div className="flex flex-1 flex-col gap-3">
      <Prompt>{l(game.prompt)}</Prompt>
      <div role="group" aria-label={t('memory.board')} className={`grid gap-2.5 ${cols} [perspective:900px]`}>
        {cards.map((_, card) => {
          const up = open.includes(card) || matched.includes(pairOf(card))
          const done = matched.includes(pairOf(card))
          const f = face(card)
          return (
            <button
              key={card}
              type="button"
              onClick={() => turn(card)}
              aria-label={up ? l(f) : t('memory.card', { n: card + 1 })}
              aria-pressed={up}
              className="press relative aspect-[3/4] w-full [container-type:inline-size]"
            >
              <m.span
                initial={false}
                animate={{ rotateY: up ? 180 : 0 }}
                transition={bouncy}
                className="absolute inset-0 [transform-style:preserve-3d]"
              >
                {/* back */}
                <span className="absolute inset-0 grid place-items-center [backface-visibility:hidden]">
                  <img src={img(ART.card)} alt="" draggable={false} className="absolute inset-0 size-full object-contain" />
                  <img src={img(ART.orb)} alt="" draggable={false} className="relative size-[38%] opacity-80" />
                </span>
                {/* face */}
                <span
                  className={`rounded-level absolute inset-[4%] flex [transform:rotateY(180deg)] flex-col items-center justify-center gap-1 p-1.5 text-center shadow-soft [backface-visibility:hidden] ${
                    done ? 'bg-green-soft ring-[3px] ring-green' : 'bg-white'
                  }`}
                >
                  {f.img && <img src={img(f.img)} alt="" draggable={false} className="pop-3d size-[70%] object-contain" />}
                  <span className={`leading-tight font-extrabold ${f.img ? 'text-[length:clamp(0.55rem,11cqw,0.95rem)]' : 'text-[length:clamp(0.7rem,15cqw,1.25rem)]'}`}>
                    {l(f)}
                  </span>
                </span>
              </m.span>
            </button>
          )
        })}
      </div>
      <p className="text-center text-sm font-bold text-muted">{t('memory.count', { n: matched.length, total: game.pairs.length })}</p>
      <Feedback
        correct={solved ? t('memory.done') : say?.good ? say.text : undefined}
        help={!solved && say && !say.good ? say.text : undefined}
        nudge={misses}
      />
      {solved && <DoneButton onClick={onDone} />}
    </div>
  )
}
