import { useState } from 'react'
import { Link } from 'react-router'
import { BottomNav } from '../components/BottomNav'
import { Icon } from '../components/Icon'
import { Screen, TopBar } from '../components/ui'
import { MISSIONS } from '../content/missions'
import { PLACES } from '../content/places'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { BulgariaMap, type MapMarker } from '../map/BulgariaMap'
import { PlaceGlyph } from '../map/PlaceGlyph'
import { useProgress } from '../store/progress'

/** "Discover Bulgaria": every place on the map; places with finished missions turn gold. */
export function MapScreen() {
  const t = useT()
  const l = useLocalized()
  const done = useProgress((s) => s.done)
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
          className={`grid size-9 place-items-center rounded-full border-[3px] shadow-md transition ${
            gold ? 'bg-gold text-ink' : missionsAt(p.id).length ? 'bg-red text-white' : 'bg-white text-green'
          } ${active ? 'scale-125 border-ink' : 'border-white'}`}
        >
          <PlaceGlyph icon={p.icon} className="size-5" />
        </span>
      ),
    }
  })

  const place = PLACES.find((p) => p.id === selected)
  const here = place ? missionsAt(place.id) : []

  return (
    <Screen>
      <TopBar title={t('tile.discover')} />
      <div className="flex flex-col gap-3 px-3 pb-28">
        <BulgariaMap label={t('map.label')} markers={markers} onSelect={setSelected} />
        <p className="text-center text-sm font-semibold text-muted">{t('map.zoomTip')}</p>

        {place && (
          <section className="rounded-level relative bg-white p-4 shadow-md" aria-live="polite">
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label={t('map.close')}
              className="tap absolute top-1 right-1 grid place-items-center rounded-full text-muted"
            >
              <Icon name="close" />
            </button>
            <h2 className="flex items-center gap-2 pr-10 text-xl font-black">
              <span className="grid size-9 place-items-center rounded-full bg-green text-white">
                <PlaceGlyph icon={place.icon} className="size-5" />
              </span>
              {l(place.name)}
            </h2>
            {here.length ? (
              <ul className="mt-3 flex flex-col gap-2">
                {here.map((m) => (
                  <li key={m.id}>
                    <Link
                      to={`/mission/${m.id}`}
                      className="tap rounded-level flex items-center gap-3 border-2 border-sand px-3 font-extrabold hover:border-green"
                    >
                      <span className="flex-1">{l(m.title)}</span>
                      {done[m.id] && <Icon name="check" className="text-green" />}
                      <span className="grid size-9 place-items-center rounded-full bg-green text-white" aria-hidden="true">
                        <Icon name="play" width="1em" height="1em" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 font-semibold text-muted">{t('map.noMission')}</p>
            )}
          </section>
        )}
      </div>
      <BottomNav />
    </Screen>
  )
}
