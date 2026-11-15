import { useState } from 'react'
import { Link } from 'react-router'
import { img } from '../components/Brand'
import { Icon } from '../components/Icon'
import { UnlockInfo } from '../components/UnlockInfo'
import { useProgress } from '../content/useProgress'
import { ART } from '../world'
import { TimelineLink } from '../components/TimelineLink'
import { Card, Screen, TopBar } from '../components/ui'
import { useChildMissions } from '../content/useChildMissions'
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
  const missions = useChildMissions()
  const progress = useProgress(missions)
  const [selected, setSelected] = useState<string | null>(null)

  const missionsAt = (placeId: string) => missions.filter((m) => m.place === placeId)
  /** done (gold) · open (glows) · locked (grey, with a key) · none (no mission here yet). */
  const stateOf = (placeId: string) => {
    const here = missionsAt(placeId).map(progress.status)
    return here.includes('done') ? 'done' : here.includes('open') ? 'open' : here.length ? 'locked' : 'none'
  }

  // A few places lie so close to a bigger one that their pictures would overlap; they appear in games only.
  const markers: MapMarker[] = PLACES.filter((p) => p.onMap).map((p) => {
    const state = stateOf(p.id)
    const active = selected === p.id
    const fresh = missionsAt(p.id).some(progress.isNew)
    return {
      id: p.id,
      x: p.x,
      y: p.y,
      label: l(p.name),
      className: p.img ? 'size-14' : 'size-12',
      content: (
        <span data-state={state} className={`relative grid place-items-center transition-transform duration-300 ${active ? 'scale-125' : ''}`}>
          {fresh && <img src={img(ART.burst)} alt="" className="anim-spin-slow pointer-events-none absolute size-16 max-w-none opacity-80" />}
          {p.img ? (
            <span
              className={`relative grid size-11 place-items-center rounded-full shadow-float ring-[3px] ${
                state === 'done' ? 'bg-gold-soft ring-gold' : state === 'open' ? 'bg-white ring-coral' : 'bg-white/85 ring-white'
              } ${active ? 'ring-ink' : ''}`}
            >
              <img src={img(p.img)} alt="" className={`size-10 object-contain ${state === 'locked' ? 'opacity-50 grayscale' : ''}`} />
            </span>
          ) : (
            <span
              className={`relative grid size-7 place-items-center rounded-full shadow-float ring-2 ${
                state === 'done' ? 'bg-gold text-ink' : state === 'open' ? 'bg-coral text-coral-ink' : state === 'locked' ? 'bg-sand text-muted' : 'bg-white text-green-dark'
              } ${active ? 'ring-ink' : 'ring-white'}`}
            >
              <PlaceGlyph icon={p.icon} className="size-4" />
            </span>
          )}
          {state === 'locked' && <img src={img(ART.key)} alt="" className="absolute -right-2 -bottom-1 size-5" />}
          {state === 'done' && (
            <span className="absolute -right-1.5 -bottom-1 grid size-4 place-items-center rounded-full bg-green-dark text-white ring-2 ring-white">
              <Icon name="check" width="0.7em" height="0.7em" />
            </span>
          )}
        </span>
      ),
    }
  })

  const place = PLACES.find((p) => p.id === selected)
  const here = place ? missionsAt(place.id) : []

  return (
    <Screen nav>
      <TopBar title={t('tile.discover')} />
      <div className="flex flex-col gap-3 px-4 pb-32 short:pb-8">
        <BulgariaMap label={t('map.label')} markers={markers} onSelect={setSelected} />
        <p className="text-center text-sm font-semibold text-muted">{t('map.zoomTip')}</p>
        {!place && <TimelineLink />}

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
                {place.img ? (
                  <m.img
                    src={img(place.img)}
                    alt=""
                    initial={{ scale: 0.5, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={bouncy}
                    className="pop-3d size-[min(5.5rem,22vw)] shrink-0 object-contain"
                  />
                ) : (
                  <span className="puck grid size-11 shrink-0 place-items-center rounded-full bg-sky text-ink [--edge:var(--color-sky-deep)]">
                    <PlaceGlyph icon={place.icon} className="size-6" />
                  </span>
                )}
                {l(place.name)}
              </h2>
              {here.length ? (
                <ul className="mt-4 flex flex-col gap-3">
                  {here.map((mission) =>
                    progress.status(mission) === 'locked' ? (
                      <li key={mission.id} className="flex items-start gap-3 rounded-[1.5rem] bg-sand/60 p-3">
                        <img src={img(ART.key)} alt="" className="size-10 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="leading-tight font-extrabold">{l(mission.title)}</p>
                          <UnlockInfo mission={mission} className="mt-1 text-sm" />
                        </div>
                      </li>
                    ) : (
                      <li key={mission.id}>
                        <Link to={`/mission/${mission.id}`} className="tap press flex items-center gap-3 rounded-full bg-cream py-1.5 pr-1.5 pl-5 font-extrabold">
                          <span className="min-w-0 flex-1 leading-tight">{l(mission.title)}</span>
                          {done[mission.id] && <Icon name="check" className="shrink-0 text-green-dark" />}
                          <span className="puck grid size-11 shrink-0 place-items-center rounded-full bg-coral text-coral-ink [--edge:var(--color-coral-deep)]" aria-hidden="true">
                            <Icon name="play" width="1.1em" height="1.1em" />
                          </span>
                        </Link>
                      </li>
                    ),
                  )}
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
