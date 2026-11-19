import { useState } from 'react'
import { img } from '../components/Brand'
import { ART } from '../world'
import { Icon } from '../components/Icon'
import { PlaceGlyph } from '../map/PlaceGlyph'
import { placeById } from '../content/places'
import type { GuessGame } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { BulgariaMap, type MapMarker } from '../map/BulgariaMap'
import { bouncy, m } from '../motion'
import { play } from '../sound'
import { DoneButton, Feedback, Prompt } from './Feedback'

/**
 * Guess the place: picture clues appear one by one; the child taps the place on the map.
 * A wrong place greys out and the next clue appears by itself, so nobody gets stuck.
 * Fewer clues used = more gems — a bonus, never a penalty.
 */
export function Guess({ game, onDone }: { game: GuessGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const [shown, setShown] = useState(1)
  const [out, setOut] = useState<string[]>([])
  const [solved, setSolved] = useState(false)
  const target = placeById(game.target)!
  const more = () => {
    play('tap')
    setShown((n) => Math.min(game.clues.length, n + 1))
  }

  const choose = (id: string) => {
    if (solved || out.includes(id)) return
    if (id === game.target) {
      play('correct')
      setSolved(true)
    } else {
      play('hint')
      setOut((o) => [...o, id])
      setShown((n) => Math.min(game.clues.length, n + 1))
    }
  }

  const markers: MapMarker[] = game.choices.map((id, i) => {
    const p = placeById(id)!
    const isOut = out.includes(id)
    const right = solved && id === game.target
    return {
      id,
      x: p.x,
      y: p.y,
      label: right ? l(p.name) : t('map.point', { n: i + 1 }),
      disabled: isOut,
      className: right ? 'size-16' : 'size-12',
      content: right ? (
        <m.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={bouncy} className="grid size-16 place-items-center rounded-full bg-gold shadow-float ring-[3px] ring-white">
          {p.img ? <img src={img(p.img)} alt="" className="size-14 object-contain" /> : <PlaceGlyph icon={p.icon} className="size-8" />}
        </m.span>
      ) : (
        <span
          className={`grid size-9 place-items-center rounded-full font-black shadow-float ring-[3px] ring-white ${
            isOut ? 'bg-sand text-muted opacity-60' : 'bg-coral text-coral-ink'
          }`}
        >
          {isOut ? <Icon name="close" width="1em" height="1em" /> : i + 1}
        </span>
      ),
    }
  })

  const gems = game.clues.length - shown + 1

  return (
    <div className="flex flex-1 flex-col gap-3">
      <Prompt>{l(game.prompt)}</Prompt>

      {/* Clues */}
      <ul aria-label={t('guess.clues')} className="grid grid-cols-[repeat(auto-fit,minmax(5.5rem,1fr))] gap-2">
        {game.clues.map((c, i) => (
          <li key={i} className="edge-light rounded-level relative flex flex-col items-center gap-1 mat-paper p-2 text-center [container-type:inline-size]">
            {i < shown ? (
              <m.div initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} transition={bouncy} className="flex flex-col items-center gap-1">
                <img src={img(c.img)} alt="" className="pop-3d size-[min(3.75rem,15vw)] object-contain" />
                <span className="text-[length:clamp(0.6rem,12cqw,0.95rem)] leading-tight font-extrabold">{l(c)}</span>
              </m.div>
            ) : (
              <>
                <img src={img(ART.orb)} alt="" className="size-[min(3.75rem,15vw)] opacity-60" />
                <span className="sr-only">{t('guess.hidden')}</span>
              </>
            )}
          </li>
        ))}
      </ul>
      {!solved && shown < game.clues.length && (
        <button type="button" onClick={more} className="tap press flex items-center justify-center gap-2 self-center rounded-full bg-gold-soft px-5 font-extrabold shadow-soft">
          <img src={img(ART.lantern)} alt="" className="size-8" />
          {t('guess.more')}
        </button>
      )}

      <BulgariaMap label={t('map.label')} markers={markers} onSelect={choose} />

      {solved ? (
        <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={bouncy} role="status" className="rounded-level flex flex-col gap-2 bg-green-soft p-4">
          <p className="flex items-center gap-2 text-xl font-black text-green-dark">
            {target.img && <img src={img(target.img)} alt="" className="pop-3d size-12 object-contain" />}
            {t('guess.right', { name: l(target.name) })}
          </p>
          <p className="font-bold">{l(game.fact)}</p>
          <p className="flex items-center gap-1 text-sm font-extrabold text-green-dark">
            {Array.from({ length: gems }, (_, i) => (
              <img key={i} src={img(ART.gemGreen)} alt="" className="size-6" />
            ))}
            <span className="ml-1">{t('guess.gems', { n: shown })}</span>
          </p>
        </m.div>
      ) : (
        <Feedback help={out.length ? t('guess.notHere') : undefined} nudge={out.length} idle={t('guess.idle')} />
      )}
      {solved && <DoneButton onClick={onDone} />}
    </div>
  )
}
