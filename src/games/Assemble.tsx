import { useMemo, useState } from 'react'
import { img } from '../components/Brand'
import { SceneBackdrop } from '../components/Scene'
import type { AssembleGame } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { play } from '../sound'
import { useDrag } from './drag'
import { DoneButton, Feedback, Prompt } from './Feedback'
import { shuffledIndexes } from './shuffle'

/** Pieces in the tray: the parts (k < parts.length) and the decoys (k ≥ parts.length). */
type Piece = { k: number; bg: string; en: string; img: string; decoy: boolean }

/**
 * Put it together ("Build a fortress"): the parts wait in a tray under the scene; each has an empty place in the scene.
 * Drag a part to its place, or tap it and then the place. Parts with the same picture may go to either of their places.
 * A decoy (something that does not belong) jumps back and Raya says why. When everything is in place, the scene cheers.
 */
export function Assemble({ game, onDone }: { game: AssembleGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const pieces: Piece[] = useMemo(
    () => [...game.parts.map((p, k) => ({ ...p, k, decoy: false })), ...game.decoys.map((d, i) => ({ ...d, k: game.parts.length + i, decoy: true }))],
    [game],
  )
  const order = useMemo(() => shuffledIndexes(pieces.length, l(game.prompt)), [pieces.length, l, game.prompt])
  // filled[slot] = the piece that sits there
  const [filled, setFilled] = useState<Record<number, number>>({})
  const [gone, setGone] = useState<number[]>([]) // decoys sent away
  const [selected, setSelected] = useState<number | null>(null)
  const [bump, setBump] = useState<{ k: number; n: number } | null>(null)
  const [misses, setMisses] = useState(0)
  const [say, setSay] = useState<{ good: boolean; text: string } | undefined>()
  const placed = new Set(Object.values(filled))
  const solved = Object.keys(filled).length === game.parts.length
  const name = (p: { bg: string; en: string }) => l(p)

  const miss = (k: number, text: string) => {
    play('hint')
    setMisses((n) => n + 1)
    setBump({ k, n: misses + 1 })
    setSay({ good: false, text })
  }

  const tryPlace = (k: number, slot: number) => {
    setSelected(null)
    if (placed.has(k) || filled[slot] !== undefined) return
    const piece = pieces[k]!
    if (piece.decoy) {
      const d = game.decoys[k - game.parts.length]!
      setGone((g) => [...g, k])
      miss(k, `${t('assemble.notPart', { name: name(piece) })} ${l(d.why)}`)
      return
    }
    // the right place, or a place for an identical part (two towers, two walls)
    if (k === slot || game.parts[slot]!.img === piece.img) {
      play('correct')
      setFilled((f) => ({ ...f, [slot]: k }))
      setSay({ good: true, text: t('assemble.good', { name: name(piece) }) })
    } else {
      const hint = game.parts[k]!.hint
      miss(k, hint ? l(hint) : t('assemble.notHere', { name: name(piece) }))
    }
  }
  const drag = useDrag((id, target) => tryPlace(Number(id), Number(target)))

  const tray = order.filter((k) => !placed.has(k) && !gone.includes(k))
  const glow = !solved && misses >= 2 && selected !== null && !pieces[selected]!.decoy ? game.parts.findIndex((p, s) => filled[s] === undefined && p.img === pieces[selected]!.img) : -1

  return (
    <div className="flex flex-1 flex-col gap-3 side:grid side:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] side:content-start side:gap-x-4 side:[&>*]:col-start-1">
      <Prompt>{l(game.prompt)}</Prompt>

      <div
        role="group"
        aria-label={t('assemble.scene')}
        className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-[2rem] shadow-soft side:col-start-2! side:row-span-4 side:row-start-1 side:w-[min(100%,calc((100dvh-6.5rem)*4/3))]"
      >
        <SceneBackdrop scene={game.scene} className="absolute inset-0 size-full" />
        {game.parts.map((part, slot) => {
          const k = filled[slot]
          const pos = { left: `${part.x}%`, top: `${part.y}%`, width: `${part.size}%` }
          return (
            <div key={slot} className="absolute -translate-x-1/2 -translate-y-1/2" style={pos}>
              {k === undefined ? (
                <button
                  type="button"
                  data-drop={slot}
                  onClick={() => (selected === null ? setSay({ good: false, text: t('assemble.pickFirst') }) : tryPlace(selected, slot))}
                  aria-label={t('assemble.place', { n: slot + 1 })}
                  className={`relative grid w-full place-items-center rounded-[1rem] border-[3px] border-dashed border-white/90 bg-white/25 transition-transform data-[over=true]:scale-110 data-[over=true]:bg-gold/50 ${glow === slot ? 'anim-glow bg-gold/50' : ''}`}
                >
                  <img
                    src={img(part.img)}
                    alt=""
                    draggable={false}
                    className={`w-full object-contain ${game.ghost ? 'opacity-30 brightness-0' : 'invisible'}`}
                  />
                </button>
              ) : (
                <m.img
                  src={img(pieces[k]!.img)}
                  alt={name(pieces[k]!)}
                  initial={{ y: -30, scale: 1.2, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  transition={bouncy}
                  className="pop-3d w-full object-contain"
                />
              )}
            </div>
          )
        })}
      </div>

      {!solved && (
        <ul aria-label={t('assemble.tray')} className="flex flex-wrap justify-center gap-2.5">
          {tray.map((k) => {
            const p = pieces[k]!
            const active = selected === k
            return (
              <li key={k}>
                <button
                  key={bump?.k === k ? bump.n : undefined}
                  type="button"
                  {...drag(String(k))}
                  onClick={() => {
                    play('tap')
                    setSelected(active ? null : k)
                  }}
                  aria-pressed={active}
                  className={`tap press flex w-[min(6rem,26vw)] flex-col items-center rounded-[1.5rem] px-1.5 pt-1 pb-1.5 font-extrabold select-none [container-type:inline-size] ${
                    active ? 'bg-gold text-ink shadow-float' : 'bg-white shadow-soft'
                  } ${bump?.k === k ? 'anim-wiggle' : ''}`}
                >
                  <img src={img(p.img)} alt="" draggable={false} className="pop-3d size-[min(3.75rem,15vw)] object-contain" />
                  <span className="w-full text-center text-[length:clamp(0.5rem,11cqw,0.85rem)] leading-tight">{name(p)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <Feedback
        correct={solved ? l(game.done) : say?.good ? say.text : undefined}
        help={!solved && say && !say.good ? say.text : undefined}
        nudge={misses}
        idle={t('assemble.idle')}
      />
      {solved && <DoneButton onClick={onDone} />}
    </div>
  )
}
