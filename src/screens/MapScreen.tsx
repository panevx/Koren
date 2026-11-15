import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { img } from '../components/Brand'
import { CharacterMessage } from '../components/ds'
import { Icon } from '../components/Icon'
import { TimelineLink } from '../components/TimelineLink'
import { Screen, TopBar } from '../components/ui'
import { UnlockInfo } from '../components/UnlockInfo'
import { LAKES, NEIGHBOURS, PEAKS, PROVINCES, PROVINCE_FILL, RANGES, RIVERS, SEA, SOURCES, provinceAt } from '../content/layers'
import { PLACES, type MapPlace } from '../content/places'
import type { Mission } from '../content/schema'
import { useChildMissions } from '../content/useChildMissions'
import { useLocalized } from '../content/useLocalized'
import { useProgress } from '../content/useProgress'
import type { TKey } from '../i18n'
import { useT } from '../i18n/useT'
import { BulgariaMap, type MapLabel, type MapMarker } from '../map/BulgariaMap'
import { LAKE_ART, MODES, PEAK_ART, RIVER_ART } from '../map/art'
import { PlaceGlyph } from '../map/PlaceGlyph'
import { bouncy, m } from '../motion'
import { useActiveProfile } from '../store/profiles'
import { ART } from '../world'

type Mode = (typeof MODES)[number]['id']

type Selection = { kind: 'place' | 'province' | 'river' | 'lake' | 'peak' | 'neighbour'; id: string } | null

const placesFor = (mode: Mode, missions: readonly Mission[]): MapPlace[] => {
  const has = (p: MapPlace, ...tags: string[]) => p.tags.some((t) => tags.includes(t))
  const withMission = (p: MapPlace) => missions.some((x) => x.place === p.id)
  return PLACES.filter((p) => p.onMap).filter((p) =>
    mode === 'cities' ? has(p, 'city') : mode === 'tourism' ? has(p, 'ski', 'spa', 'cave') : mode === 'landmarks' ? has(p, 'history', 'nature') || withMission(p) : false,
  )
}

/**
 * "Discover Bulgaria": a relief map from real elevation data with seven modes —
 * landmarks (with missions) · cities · the 28 provinces · mountains and peaks · rivers and lakes · neighbours · tourism.
 * Everything tappable is a real button (keyboard, screen reader); provinces also have a list under the map.
 */
export function MapScreen() {
  const t = useT()
  const l = useLocalized()
  const missions = useChildMissions()
  const progress = useProgress(missions)
  const [mode, setMode] = useState<Mode>('landmarks')
  const [sel, setSel] = useState<Selection>(null)

  const missionsAt = (placeId: string) => missions.filter((x) => x.place === placeId)
  /** done (gold) · open (glows) · locked (grey, with a key) · none (no mission here yet). */
  const stateOf = (placeId: string) => {
    const here = missionsAt(placeId).map(progress.status)
    return here.includes('done') ? 'done' : here.includes('open') ? 'open' : here.length ? 'locked' : 'none'
  }
  const isSel = (kind: NonNullable<Selection>['kind'], id: string) => sel?.kind === kind && sel.id === id
  const choose = (kind: NonNullable<Selection>['kind']) => (id: string) => setSel({ kind, id })

  const placeMarker = (p: MapPlace): MapMarker => {
    const state = stateOf(p.id)
    const active = isSel('place', p.id)
    const fresh = missionsAt(p.id).some(progress.isNew)
    return {
      id: p.id,
      x: p.x,
      y: p.y,
      label: l(p.name),
      className: p.img ? 'size-14' : 'size-12',
      content: (
        <span data-state={state} className={`relative grid place-items-center transition-transform duration-500 ease-[var(--ease-spring)] ${active ? '-translate-y-1 scale-[1.35]' : ''}`}>
          {fresh && <img src={img(ART.burst)} alt="" className="anim-spin-slow pointer-events-none absolute size-16 max-w-none opacity-80" />}
          {active && <span className="anim-glow pointer-events-none absolute size-16 rounded-full bg-gold/60" aria-hidden="true" />}
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
  }

  /** A name chip that is a button (rivers, lakes, neighbours). */
  const chip = (id: string, x: number, y: number, text: string, active: boolean, tone: string): MapMarker => ({
    id,
    x,
    y,
    label: text,
    // w-max: near the edge the browser would narrow the button and the name would be measured too small
    className: 'min-h-11 min-w-11 w-max',
    leader: false, // a name, not an exact spot: no line to a "real place"
    content: (
      <span
        className={`rounded-full px-2.5 py-1 text-[0.8rem] leading-none font-black whitespace-nowrap shadow-soft transition-transform duration-300 ${active ? 'scale-110 bg-ink text-white' : tone}`}
      >
        {text}
      </span>
    ),
  })

  let markers: MapMarker[] = []
  let labels: MapLabel[] = []
  let layer: ReactNode = null
  let onSelect: (id: string) => void = choose('place')
  let onMapTap: ((x: number, y: number) => void) | undefined
  const labelCls = 'rounded-full bg-white/75 px-2 py-0.5 text-[0.7rem] font-black text-ink/80'

  if (mode === 'landmarks' || mode === 'cities' || mode === 'tourism') {
    markers = placesFor(mode, missions).map(placeMarker)
  } else if (mode === 'provinces') {
    layer = (
      <g>
        {PROVINCES.map((p) => (
          <path
            key={p.id}
            d={p.d}
            fillRule="evenodd"
            fill={PROVINCE_FILL[p.color % PROVINCE_FILL.length]}
            fillOpacity={isSel('province', p.id) ? 0.85 : 0.42}
            stroke={isSel('province', p.id) ? '#1c2b23' : '#ffffff'}
            strokeWidth={isSel('province', p.id) ? 3 : 1.5}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    )
    onMapTap = (x, y) => {
      const p = provinceAt(x, y)
      setSel(p ? { kind: 'province', id: p.id } : null)
    }
    const p = sel?.kind === 'province' ? PROVINCES.find((x) => x.id === sel.id) : undefined
    if (p) labels = [{ id: p.id, x: p.lx, y: p.ly, text: l(p.name), className: 'rounded-full bg-ink px-2.5 py-1 text-xs font-black text-white shadow-float' }]
  } else if (mode === 'mountains') {
    labels = RANGES.map((r) => ({ id: r.id, x: r.at[0], y: r.at[1], text: l(r.name), className: labelCls }))
    markers = PEAKS.map((p) => ({
      id: p.id,
      x: p.x,
      y: p.y,
      label: `${l(p.name)}, ${t('map.peak.height', { n: p.height })}`,
      className: 'size-14',
      content: (
        <span className={`relative grid size-12 place-items-center rounded-full bg-white/90 shadow-float ring-[3px] transition-transform duration-300 ${isSel('peak', p.id) ? 'scale-125 ring-ink' : 'ring-white'}`}>
          <img src={img(PEAK_ART[p.id] ?? 'world/mountain-peak.webp')} alt="" className="size-11 object-contain" />
        </span>
      ),
    }))
    onSelect = choose('peak')
  } else if (mode === 'rivers') {
    layer = (
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {RIVERS.map((r) => (
          <path key={r.id} d={r.d} stroke={isSel('river', r.id) ? '#ff655c' : '#3d9fd1'} strokeWidth={isSel('river', r.id) ? 5 : 3} vectorEffect="non-scaling-stroke" />
        ))}
        {LAKES.map((k) => (
          <path key={k.id} d={k.d} fill="#72c8f5" stroke={isSel('lake', k.id) ? '#ff655c' : '#3d9fd1'} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    )
    markers = [
      ...RIVERS.map((r) => chip(`river:${r.id}`, r.lx, r.ly, l(r.name), isSel('river', r.id), 'bg-sky-soft text-sky-dark')),
      ...LAKES.map((k) => chip(`lake:${k.id}`, k.lx, k.ly, l(k.name), isSel('lake', k.id), 'bg-white text-sky-dark')),
    ]
    onSelect = (id) => {
      const [kind, rid] = id.split(':') as ['river' | 'lake', string]
      setSel({ kind, id: rid })
    }
  } else if (mode === 'neighbours') {
    markers = NEIGHBOURS.map((n) => chip(n.id, n.at[0], n.at[1], l(n.name), isSel('neighbour', n.id), 'bg-white text-ink'))
    labels = [{ id: SEA.id, x: SEA.at[0], y: SEA.at[1], text: l(SEA.name).replace(' ', '\n'), className: 'text-center text-xs leading-tight font-black text-sky-dark/80 italic !whitespace-pre-line' }]
    onSelect = choose('neighbour')
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setSel(null)
  }

  return (
    <Screen nav wide>
      <TopBar title={t('tile.discover')} />
      <div className="flex flex-col gap-3 px-4 pb-32 short:pb-8 wide:grid wide:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] wide:items-start wide:gap-6 wide:pb-10">
        <div className="flex flex-col gap-3">
          {/* Modes: a row of pill buttons with 3D pictures (scrolls sideways on a phone). */}
          <div role="group" aria-label={t('map.mode.label')} className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] wide:mx-0 wide:flex-wrap wide:px-0">
            {MODES.map((md) => (
              <button
                key={md.id}
                type="button"
                aria-pressed={mode === md.id}
                onClick={() => switchMode(md.id)}
                className={`press flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-full py-1 pr-3.5 pl-1 text-sm font-extrabold shadow-soft ${
                  mode === md.id ? 'bg-green-dark text-white' : 'bg-white text-ink'
                }`}
              >
                <img src={img(md.art)} alt="" className="size-8 object-contain" />
                {t(`map.mode.${md.id}` as TKey)}
              </button>
            ))}
          </div>

          <BulgariaMap label={t('map.label')} relief markers={markers} labels={labels} layer={layer} onSelect={onSelect} onMapTap={onMapTap} />

          {(mode === 'landmarks' || mode === 'cities' || mode === 'tourism') && (
            <ul className="flex flex-wrap items-center justify-center gap-2 text-sm font-extrabold">
              <li className="flex items-center gap-1.5 rounded-full bg-white py-1 pr-3 pl-1 shadow-soft">
                <span className="size-5 rounded-full bg-gold-soft ring-[3px] ring-gold" aria-hidden="true" />
                {t('map.legend.done')}
              </li>
              <li className="flex items-center gap-1.5 rounded-full bg-white py-1 pr-3 pl-1 shadow-soft">
                <span className="size-5 rounded-full bg-white ring-[3px] ring-coral" aria-hidden="true" />
                {t('map.legend.open')}
              </li>
              <li className="flex items-center gap-1.5 rounded-full bg-white py-1 pr-3 pl-1 shadow-soft">
                <img src={img(ART.key)} alt="" className="size-5" />
                {t('map.legend.locked')}
              </li>
            </ul>
          )}

          {mode === 'provinces' && (
            <details className="rounded-[var(--radius-card)] bg-white px-4 py-2 shadow-soft">
              <summary className="tap flex cursor-pointer items-center font-extrabold">{t('map.provinces.list')} (28)</summary>
              <ul className="flex flex-wrap gap-1.5 pb-2">
                {[...PROVINCES].sort((a, b) => l(a.name).localeCompare(l(b.name))).map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      aria-pressed={isSel('province', p.id)}
                      onClick={() => setSel({ kind: 'province', id: p.id })}
                      className={`press min-h-11 rounded-full px-3 text-sm font-bold ${isSel('province', p.id) ? 'bg-ink text-white' : 'bg-cream'}`}
                    >
                      {l(p.name)}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <p className="text-center text-xs font-semibold text-muted">
            {t('map.sources')}
            {SOURCES.includes('OpenStreetMap') && <> · {t('map.sources.osm')}</>}
          </p>
        </div>

        <div className="flex flex-col gap-3 wide:sticky wide:top-4">
          {!sel && (
            <CharacterMessage hero="koren" mood="determination" className="wide:mt-1">
              <p className="font-extrabold">
                {mode === 'provinces' ? t('map.provinces.count') + ' ' + t('map.pick.provinces') : mode === 'landmarks' || mode === 'cities' ? t('map.pick') : t(`map.pick.${mode}` as TKey)}
              </p>
            </CharacterMessage>
          )}
          {!sel && mode === 'landmarks' && <TimelineLink />}
          {sel && <InfoPanel key={`${sel.kind}:${sel.id}`} sel={sel} onClose={() => setSel(null)} missionsAt={missionsAt} />}
        </div>
      </div>
    </Screen>
  )
}

/** The panel for whatever is selected: a place, a province, a river or lake, a peak, a neighbour. */
function InfoPanel({ sel, onClose, missionsAt }: { sel: NonNullable<Selection>; onClose: () => void; missionsAt: (placeId: string) => Mission[] }) {
  const t = useT()
  const l = useLocalized()
  let title = ''
  let art: string | undefined
  let tone = 'bg-stage-sky'
  let body: ReactNode = null
  let here: Mission[] = []

  if (sel.kind === 'place') {
    const p = PLACES.find((x) => x.id === sel.id)!
    title = l(p.name)
    art = p.img
    here = missionsAt(p.id)
    body = p.info && <p className="font-semibold">{l(p.info)}</p>
  } else if (sel.kind === 'province') {
    const p = PROVINCES.find((x) => x.id === sel.id)!
    title = l(p.name)
    tone = 'bg-stage-gold'
    const inside = PLACES.filter((x) => provinceAt(x.x, x.y)?.id === p.id)
    here = inside.flatMap((x) => missionsAt(x.id))
    body = (
      <>
        <p className="font-semibold">{t('map.province.centre', { name: l(p.centre) })}</p>
        {inside.length > 0 && (
          <>
            <h3 className="text-label mt-3 mb-1.5 text-muted">{t('map.province.places')}</h3>
            <ul className="flex flex-wrap gap-1.5">
              {inside.map((x) => (
                <li key={x.id} className="flex items-center gap-1.5 rounded-full bg-cream py-1 pr-3 pl-1 text-sm font-bold">
                  {x.img && <img src={img(x.img)} alt="" className="size-7 object-contain" />}
                  {l(x.name)}
                </li>
              ))}
            </ul>
          </>
        )}
      </>
    )
  } else if (sel.kind === 'river') {
    const r = RIVERS.find((x) => x.id === sel.id)!
    title = l(r.name)
    art = RIVER_ART
    body = <p className="font-semibold">{t('map.river.into', { name: l(r.into) })}</p>
  } else if (sel.kind === 'lake') {
    const k = LAKES.find((x) => x.id === sel.id)!
    title = l(k.name)
    art = LAKE_ART
    body = <p className="font-semibold">{t('map.lake')}</p>
  } else if (sel.kind === 'peak') {
    const p = PEAKS.find((x) => x.id === sel.id)!
    title = l(p.name)
    art = PEAK_ART[p.id]
    const range = RANGES.find((r) => r.id === p.range)
    here = missionsAt(p.id)
    body = (
      <>
        <p className="text-2xl font-black">{t('map.peak.height', { n: p.height })}</p>
        {range && <p className="font-semibold">{t('map.peak.range', { name: l(range.name) })}</p>}
      </>
    )
  } else {
    const n = NEIGHBOURS.find((x) => x.id === sel.id)!
    title = l(n.name)
    tone = 'bg-stage-coral'
    body = (
      <>
        <p className="text-label text-muted">{t('map.neighbour.kind')}</p>
        <p className="font-semibold">{t('map.neighbour.capital', { name: l(n.capital) })}</p>
      </>
    )
  }

  return (
    <m.section
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={bouncy}
      aria-live="polite"
      className="relative overflow-hidden rounded-[var(--radius-stage)] bg-white shadow-stage"
    >
      <div className={`${tone} relative flex min-h-20 items-end gap-3 px-4 pt-4 pb-3`}>
        {art && (
          <m.img
            src={img(art)}
            alt=""
            initial={{ scale: 0.4, y: 20, rotate: -10 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            transition={bouncy}
            className="pop-3d -mb-1 size-[min(6.5rem,26vw)] shrink-0 object-contain wide:size-[4.5rem]"
          />
        )}
        <h2 className="text-title min-w-0 flex-1 pr-10 pb-1 text-ink">{title}</h2>
        <button type="button" onClick={onClose} aria-label={t('map.close')} className="tap press absolute top-1 right-1 grid place-items-center rounded-full text-ink">
          <Icon name="close" />
        </button>
      </div>
      <div className="flex flex-col gap-1 p-4">
        {body}
        {here.length > 0 ? <MissionList missions={here} /> : (sel.kind === 'place' || sel.kind === 'peak') && <p className="mt-2 font-semibold text-muted">{t('map.noMission')}</p>}
      </div>
    </m.section>
  )
}

function MissionList({ missions }: { missions: Mission[] }) {
  const t = useT()
  const l = useLocalized()
  const done = useActiveProfile().done
  const progress = useProgress(useChildMissions())
  return (
    <>
      <h3 className="text-label mt-3 mb-1 text-muted">{t('map.missionsHere')}</h3>
      <ul className="flex flex-col gap-2.5">
        {missions.map((mission) =>
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
              <Link
                to={`/mission/${mission.id}`}
                className={`tap press flex items-center gap-3 rounded-full py-1.5 pr-1.5 pl-5 font-extrabold ${done[mission.id] ? 'bg-gold-soft' : 'bg-cream'}`}
              >
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
    </>
  )
}
