import { useState } from 'react'
import { img } from '../components/Brand'
import { placeById } from '../content/places'
import type { BuildGame } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { BulgariaMap, type MapMarker } from '../map/BulgariaMap'
import { bouncy, m } from '../motion'
import { play } from '../sound'
import { useDrag } from './drag'
import { DoneButton, Feedback, Prompt } from './Feedback'
import { shuffledIndexes } from './shuffle'

/**
 * Build Bulgaria: landmarks wait in a tray under the map; the child puts each one on its empty spot
 * (drag it there, or tap the landmark and then the spot). `decoys` are extra empty spots for older
 * children; `labels` writes the place names next to the spots for younger ones.
 */
export function Build({ game, onDone }: { game: BuildGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const [order] = useState(() => shuffledIndexes(game.pieces.length, l(game.prompt)))
  const [placed, setPlaced] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(game.pieces.length === 1 ? 0 : null)
  const [misses, setMisses] = useState(0)
  const [bump, setBump] = useState<{ piece: number; n: number } | null>(null)
  const [say, setSay] = useState<{ good: boolean; text: string } | undefined>()
  const solved = placed.length === game.pieces.length
  const spots = [...game.pieces.map((p) => p.place), ...game.decoys]
  const spotOrder = shuffledIndexes(spots.length, `${l(game.prompt)}-spots`)
  const name = (place: string) => l(placeById(place)!.name)

  const tryPlace = (piece: number, spot: string) => {
    if (placed.includes(piece)) return
    setSelected(null)
    const p = game.pieces[piece]!
    if (p.place === spot) {
      play('correct')
      setPlaced((s) => [...s, piece])
      setSay({ good: true, text: t('build.good', { name: name(p.place) }) })
    } else {
      play('hint')
      setMisses((n) => n + 1)
      setBump({ piece, n: misses + 1 })
      setSay({ good: false, text: p.hint ? l(p.hint) : t('build.notHere', { name: name(p.place) }) })
    }
  }
  const drag = useDrag((id, target) => tryPlace(Number(id), target))

  const markers: MapMarker[] = spotOrder.map((k, n) => {
    const place = placeById(spots[k])!
    const piece = game.pieces.findIndex((p) => p.place === place.id)
    const done = piece >= 0 && placed.includes(piece)
    return {
      id: place.id,
      x: place.x,
      y: place.y,
      label: done ? name(place.id) : game.labels ? t('build.spotNamed', { name: name(place.id) }) : t('build.spot', { n: n + 1 }),
      className: done ? 'size-16' : 'size-12',
      content: done ? (
        <m.img initial={{ scale: 0, y: -24 }} animate={{ scale: 1, y: 0 }} transition={bouncy} src={img(game.pieces[piece]!.img)} alt="" className="pop-3d size-16 object-contain" />
      ) : (
        <span
          data-drop={place.id}
          className="relative grid size-11 place-items-center rounded-full border-[3px] border-dashed border-green-deep bg-white/70 transition-transform data-[over=true]:scale-125 data-[over=true]:bg-gold"
        >
          {game.labels && (
            <span className="absolute top-full mt-0.5 rounded-full bg-white/90 px-1.5 text-[0.65rem] leading-tight font-extrabold whitespace-nowrap text-ink">
              {name(place.id)}
            </span>
          )}
        </span>
      ),
    }
  })

  return (
    <div className="flex flex-1 flex-col gap-3">
      <Prompt>{l(game.prompt)}</Prompt>
      <BulgariaMap
        label={t('map.label')}
        markers={markers}
        onSelect={(id) => (selected === null ? setSay({ good: false, text: t('build.pickFirst') }) : tryPlace(selected, id))}
      />
      {!solved && (
        <ul aria-label={t('build.tray')} className="flex flex-wrap justify-center gap-2.5">
          {order
            .filter((i) => !placed.includes(i))
            .map((i) => {
              const p = game.pieces[i]!
              const active = selected === i
              return (
                <li key={i}>
                  <button
                    key={bump?.piece === i ? bump.n : undefined}
                    type="button"
                    {...drag(String(i))}
                    onClick={() => {
                      play('tap')
                      setSelected(active ? null : i)
                    }}
                    aria-pressed={active}
                    className={`tap press flex flex-col items-center rounded-[1.5rem] px-2 pt-1 pb-1.5 font-extrabold select-none ${
                      active ? 'bg-gold text-ink shadow-float' : 'bg-white shadow-soft'
                    } ${bump?.piece === i ? 'anim-wiggle' : ''}`}
                  >
                    <img src={img(p.img)} alt="" draggable={false} className="pop-3d size-[min(4rem,16vw)] object-contain" />
                    <span className="text-sm leading-tight">{name(p.place)}</span>
                  </button>
                </li>
              )
            })}
        </ul>
      )}
      <Feedback
        correct={solved ? t('build.done') : say?.good ? say.text : undefined}
        help={!solved && say && !say.good ? say.text : undefined}
        nudge={misses}
        idle={t('build.idle')}
      />
      {solved && <DoneButton onClick={onDone} />}
    </div>
  )
}
