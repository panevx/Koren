import { useMemo, useState, type KeyboardEvent } from 'react'
import type { PaintGame } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { play } from '../sound'
import { DoneButton, Feedback, Prompt } from './Feedback'

const CELL = 10
const CLOTH = '#F4EAD5'
const SHELL = '#F6EBD9'

/** Parts of the picture: touching stitches with the same model letter (4-neighbours). Row-major order. */
export function partsOf(rows: readonly string[]) {
  const h = rows.length
  const w = rows[0]!.length
  const id: number[][] = rows.map((r) => [...r].map(() => -1))
  const parts: { letter: string; cells: [number, number][] }[] = []
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const c = rows[y]![x]!
      if (c === ' ' || c === '.' || id[y]![x]! >= 0) continue
      const cells: [number, number][] = []
      const stack: [number, number][] = [[x, y]]
      id[y]![x] = parts.length
      while (stack.length) {
        const [cx, cy] = stack.pop()!
        cells.push([cx, cy])
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const nx = cx + dx
          const ny = cy + dy
          if (nx >= 0 && ny >= 0 && nx < w && ny < h && id[ny]![nx]! < 0 && rows[ny]![nx] === c) {
            id[ny]![nx] = parts.length
            stack.push([nx, ny])
          }
        }
      }
      parts.push({ letter: c, cells })
    }
  return parts
}

/**
 * Paint an embroidery (or an Easter egg) stitch by stitch: pick a colour from the palette, tap a part of the picture —
 * the whole part fills. With `copy`, the small model shows the colours the masters used; a part in a different colour
 * is never "wrong" for long — Raya says "look at the model" and the child just paints it again.
 * Every part is also a button ("Part 3") for the keyboard and screen readers.
 */
export function Paint({ game, onDone }: { game: PaintGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const parts = useMemo(() => partsOf(game.rows), [game.rows])
  const [colour, setColour] = useState(0)
  const [painted, setPainted] = useState<Record<number, number>>({})
  const [misses, setMisses] = useState(0)
  const [say, setSay] = useState<{ good: boolean; text: string } | undefined>()
  const want = (p: number) => parts[p]!.letter.charCodeAt(0) - 97
  const done = parts.every((_, p) => painted[p] !== undefined && (!game.copy || painted[p] === want(p)))
  const w = game.rows[0]!.length * CELL
  const h = game.rows.length * CELL

  const paint = (p: number) => {
    if (done) return
    setPainted((s) => ({ ...s, [p]: colour }))
    if (game.copy && colour !== want(p)) {
      play('hint')
      setMisses((n) => n + 1)
      setSay({ good: false, text: t('paint.lookModel') })
    } else {
      play('correct')
      setSay(undefined)
    }
  }
  const key = (e: KeyboardEvent, p: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      paint(p)
    }
  }

  /** One stitch: a cross on the cloth, a tile on the egg. */
  const stitch = (x: number, y: number, fill: string | null, k: string) =>
    game.look === 'stitch' ? (
      <g key={k} stroke={fill ?? '#C9BBA0'} strokeWidth={fill ? 2.6 : 1} strokeLinecap="round" strokeDasharray={fill ? undefined : '1.5 1.5'}>
        <line x1={x * CELL + 2} y1={y * CELL + 2} x2={x * CELL + 8} y2={y * CELL + 8} />
        <line x1={x * CELL + 8} y1={y * CELL + 2} x2={x * CELL + 2} y2={y * CELL + 8} />
      </g>
    ) : (
      <rect key={k} x={x * CELL} y={y * CELL} width={CELL + 0.3} height={CELL + 0.3} fill={fill ?? '#FFFDF7'} stroke={fill ? 'none' : '#E3D5BA'} strokeWidth={0.5} />
    )

  /** The egg: a smooth egg shape over the grid (narrower at the top). */
  const eggPath = `M${w / 2} 0C${w * 0.93} 0 ${w} ${h * 0.5} ${w} ${h * 0.64}C${w} ${h * 0.9} ${w * 0.78} ${h} ${w / 2} ${h}C${w * 0.22} ${h} 0 ${h * 0.9} 0 ${h * 0.64}C0 ${h * 0.5} ${w * 0.07} 0 ${w / 2} 0Z`
  const picture = (model: boolean) => (
    <g clipPath={game.look === 'egg' ? `url(#egg-${model ? 'm' : 'p'})` : undefined}>
      {game.rows.flatMap((r, y) =>
        [...r].map((c, x) =>
          c === '.' ? (
            game.look === 'stitch' ? null : <rect key={`b${x}-${y}`} x={x * CELL} y={y * CELL} width={CELL} height={CELL} fill={SHELL} />
          ) : null,
        ),
      )}
      {parts.map((part, p) => {
        const fill = model ? game.palette[want(p)]!.color : painted[p] !== undefined ? game.palette[painted[p]!]!.color : null
        return model ? (
          <g key={p}>{part.cells.map(([x, y]) => stitch(x, y, fill, `${x}-${y}`))}</g>
        ) : (
          <g
            key={p}
            role="button"
            tabIndex={0}
            aria-label={t('paint.part', { n: p + 1 })}
            onClick={() => paint(p)}
            onKeyDown={(e) => key(e, p)}
            className="cursor-pointer outline-none focus-visible:opacity-70"
          >
            {/* a transparent hit area per stitch (the cross itself is thin) */}
            {part.cells.map(([x, y]) => (
              <rect key={`h${x}-${y}`} x={x * CELL} y={y * CELL} width={CELL} height={CELL} fill="transparent" />
            ))}
            {part.cells.map(([x, y]) => stitch(x, y, fill, `${x}-${y}`))}
          </g>
        )
      })}
    </g>
  )
  const eggDefs = (id: string) =>
    game.look === 'egg' && (
      <defs>
        <clipPath id={id}>
          <path d={eggPath} />
        </clipPath>
      </defs>
    )

  const frame = game.look === 'stitch' ? 'rounded-[1.5rem] p-3 shadow-soft' : ''
  return (
    <div className="flex flex-1 flex-col gap-3 side:grid side:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] side:content-start side:gap-x-4 side:[&>*]:col-start-1">
      <Prompt>{l(game.prompt)}</Prompt>

      <div className="relative mx-auto flex w-[min(100%,24rem,calc(100dvh-20rem))] flex-col gap-2 side:col-start-2! side:row-span-4 side:row-start-1 side:w-[min(100%,calc(100dvh-7rem))]">
        {game.copy && !done && (
          <figure className="edge-light relative flex items-center gap-2 self-end rounded-[1.25rem] mat-paper p-1.5 pr-3">
            <svg viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="block size-[min(5.5rem,22vw)] rounded-[0.75rem] side:size-[min(8rem,16vw)]" style={game.look === 'stitch' ? { background: CLOTH } : undefined}>
              {eggDefs('egg-m')}
              {picture(true)}
            </svg>
            <figcaption className="text-sm font-extrabold text-muted">{t('paint.model')}</figcaption>
          </figure>
        )}
        <div className={frame} style={game.look === 'stitch' ? { background: CLOTH } : undefined}>
          <svg viewBox={`0 0 ${w} ${h}`} role="group" aria-label={t('paint.picture')} className="block w-full overflow-visible select-none">
            {eggDefs('egg-p')}
            {picture(false)}
            {game.look === 'egg' && <path d={eggPath} fill="none" stroke="#C9B48E" strokeWidth={1.2} pointerEvents="none" />}
          </svg>
        </div>
      </div>

      {!done && (
        <ul aria-label={t('paint.palette')} className="flex flex-wrap justify-center gap-2">
          {game.palette.map((c, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  play('tap')
                  setColour(i)
                }}
                aria-pressed={colour === i}
                className={`edge-light relative tap press flex items-center gap-2 rounded-full mat-paper py-1 pr-4 pl-1 font-extrabold ${colour === i ? 'ring-[3px] ring-green-dark' : ''}`}
              >
                <span className="size-10 rounded-full ring-2 ring-black/10" style={{ background: c.color }} aria-hidden="true" />
                {l(c)}
              </button>
            </li>
          ))}
        </ul>
      )}

      <Feedback correct={done ? l(game.done) : undefined} help={!done && say && !say.good ? say.text : undefined} nudge={misses} idle={t(game.copy ? 'paint.idleCopy' : 'paint.idleFree')} />
      {done && <DoneButton onClick={onDone} />}
    </div>
  )
}
