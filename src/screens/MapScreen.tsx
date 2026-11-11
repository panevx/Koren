import { useState } from 'react'
import { Link } from 'react-router'
import { Icon } from '../components/Icon'
import { Card, Screen, TopBar } from '../components/ui'
import { MISSIONS } from '../content/missions'
import { PLACES } from '../content/places'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { BulgariaMap, type MapMarker } from '../map/BulgariaMap'
import { PlaceGlyph } from '../map/PlaceGlyph'
import { bouncy, m } from '../motion'
import { useActiveProfile } from '../store/profiles'

/** "Discover Bulgaria": every place on the map; places with finished missions turn gold. */
export function MapScreen() {
  const t = useT()
  const l = useLocalized()
  const done = useActiveProfile().done
  const [selected, setSelected] = useState<string | null>(null)

  const missionsAt = (placeId: string) => MISSIONS.filter((m) => m.place === placeId)
  const isGold = (placeId: string) => missionsAt(placeId).some((m) => done[m.id])

  const markers: MapMarker[] = PLACES.map((p) => {
    const gold = isGold(p.id)
    const active = selected === p.id
    return {
      id: p.id,
      x: p.x,
      y: p.y,
      label: l(p.name),
      className: 'size-12',
      content: (
        <span
          className={`grid size-7 place-items-center rounded-full shadow-float ring-2 transition-transform duration-300 ${
            gold ? 'bg-gold text-ink' : missionsAt(p.id).length ? 'bg-coral text-coral-ink' : 'bg-white text-green-dark'
          } ${active ? 'scale-150 ring-ink' : 'ring-white'}`}
        >
          <PlaceGlyph icon={p.icon} className="size-4" />
        </span>
      ),
    }
  })

  const place = PLACES.find((p) => p.id === selected)
  const here = place ? missionsAt(place.id) : []

  return (
    <Screen nav>
      <TopBar title={t('tile.discover')} />
      <div className="flex flex-col gap-3 px-4 pb-32">
        <BulgariaMap label={t('map.label')} markers={markers} onSelect={setSelected} />
        <p className="text-center text-sm font-semibold text-muted">{t('map.zoomTip')}</p>

        {place && (
          <m.div key={place.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={bouncy}>
            <Card as="section" className="relative p-4">
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label={t('map.close')}
                className="tap press absolute top-1 right-1 grid place-items-center rounded-full text-muted"
              >
                <Icon name="close" />
              </button>
              <h2 className="flex items-center gap-3 pr-12 text-xl leading-tight font-black" aria-live="polite">
                <span className="puck grid size-11 shrink-0 place-items-center rounded-full bg-sky text-ink [--edge:var(--color-sky-deep)]">
                  <PlaceGlyph icon={place.icon} className="size-6" />
                </span>
                {l(place.name)}
              </h2>
              {here.length ? (
                <ul className="mt-4 flex flex-col gap-3">
                  {here.map((mission) => (
                    <li key={mission.id}>
                      <Link to={`/mission/${mission.id}`} className="tap press flex items-center gap-3 rounded-full bg-cream py-1.5 pr-1.5 pl-5 font-extrabold">
                        <span className="min-w-0 flex-1 leading-tight">{l(mission.title)}</span>
                        {done[mission.id] && <Icon name="check" className="shrink-0 text-green-dark" />}
                        <span className="puck grid size-11 shrink-0 place-items-center rounded-full bg-coral text-coral-ink [--edge:var(--color-coral-deep)]" aria-hidden="true">
                          <Icon name="play" width="1.1em" height="1.1em" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 font-semibold text-muted">{t('map.noMission')}</p>
              )}
            </Card>
          </m.div>
        )}
      </div>
    </Screen>
  )
}
