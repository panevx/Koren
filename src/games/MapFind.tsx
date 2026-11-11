import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Card } from '../components/ui'
import { placeById, type MapPlace } from '../content/places'
import type { MapGame } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { BulgariaMap, type MapMarker } from '../map/BulgariaMap'
import { PlaceGlyph } from '../map/PlaceGlyph'
import { UNITS_PER_KM } from '../map/projection'
import { play } from '../sound'
import { DoneButton, Feedback } from './Feedback'

/** Radius of the hint circle around the target. */
const HINT_RADIUS_KM = 45

/**
 * "Find it on the map". Wrong taps are set aside gently; after the second one
 * Raya gives the hint and the area around the target is highlighted.
 */
export function MapFind({ game, onDone }: { game: MapGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const [wrong, setWrong] = useState<string[]>([])
  const [solved, setSolved] = useState(false)

  const target = placeById(game.target)!
  const choices = game.choices.map(placeById).filter((p): p is MapPlace => Boolean(p))
  const showHint = !solved && wrong.length >= 2

  const choose = (id: string) => {
    if (solved || wrong.includes(id)) return
    if (id === game.target) {
      setSolved(true)
      play('correct')
    } else {
      setWrong((w) => [...w, id])
      play('hint')
    }
  }

  const markers: MapMarker[] = choices.map((p, i) => {
    const isWrong = wrong.includes(p.id)
    const isRight = solved && p.id === game.target
    const tone = isRight ? 'bg-gold text-ink' : isWrong ? 'bg-sand text-muted opacity-70' : 'bg-coral text-coral-ink'
    return {
      id: p.id,
      x: p.x,
      y: p.y,
      // Never the place name: that would give the answer away to screen-reader users.
      label: t('map.point', { n: i + 1 }),
      disabled: isWrong || (solved && !isRight),
      className: 'size-12',
      content: (
        <span className={`grid size-9 place-items-center rounded-full shadow-float ring-[3px] ring-white transition-transform ${isRight ? 'scale-125' : ''} ${tone}`}>
          {isRight ? (
            <Icon name="check" width="1.1em" height="1.1em" />
          ) : game.showIcons ? (
            <PlaceGlyph icon={p.icon} className="size-5" />
          ) : null}
        </span>
      ),
    }
  })

  return (
    <div className="flex flex-1 flex-col gap-3">
      <Card className="flex items-center gap-3 px-4 py-3">
        {game.showIcons && (
          <span className="puck grid size-14 shrink-0 place-items-center rounded-full bg-coral text-coral-ink [--edge:var(--color-coral-deep)]" aria-hidden="true">
            <PlaceGlyph icon={target.icon} className="size-8" />
          </span>
        )}
        <h3 className="min-w-0 flex-1 text-xl leading-snug font-extrabold">{l(game.prompt)}</h3>
      </Card>

      <BulgariaMap
        label={t('map.label')}
        markers={markers}
        onSelect={choose}
        highlight={showHint ? { x: target.x, y: target.y, r: HINT_RADIUS_KM * UNITS_PER_KM } : undefined}
      />

      <Feedback
        correct={solved ? t('map.found', { name: l(target.name) }) : undefined}
        help={wrong.length > 0 ? (showHint ? l(game.hint) : t('map.tryAgain')) : undefined}
        idle={t('map.zoomTip')}
        nudge={wrong.length}
      />

      {solved && <DoneButton onClick={onDone} />}
    </div>
  )
}
