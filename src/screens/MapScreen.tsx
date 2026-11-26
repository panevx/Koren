import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { img } from '../components/Brand'
import { CharacterMessage } from '../components/ds'
import { fitWords } from '../components/fit'
import { Icon } from '../components/Icon'
import { TimelineLink } from '../components/TimelineLink'
import { Screen, TopBar } from '../components/ui'
import { UnlockInfo } from '../components/UnlockInfo'
import { LAKES, MAP_RANGES, PARKS_AND_PLAINS, NEIGHBOURS, PEAKS, PROVINCES, PROVINCE_FILL, RANGES, RIVERS, SEA, provinceAt } from '../content/layers'
import { PLACES, type MapPlace } from '../content/places'
import type { Mission } from '../content/schema'
import { useChildMissions } from '../content/useChildMissions'
import { useLocalized } from '../content/useLocalized'
import { useProgress } from '../content/useProgress'
import type { TKey } from '../i18n'
import { useT } from '../i18n/useT'
import { BulgariaMap, type MapLabel, type MapMarker } from '../map/BulgariaMap'
import { LANDSCAPE_ART, LAKE_ART, MODES, PEAK_ART, RIVER_ART } from '../map/art'
import { PlaceGlyph } from '../map/PlaceGlyph'
import { bouncy, m } from '../motion'
import { useActiveProfile } from '../store/profiles'
import { ART } from '../world'

type Mode = (typeof MODES)[number]['id']
type PlaceState = 'done' | 'open' | 'locked' | 'none'

/** v0.26 the dish a landmark stands in, by state; the small round marker of a place without a picture. */
const DISH: Record<PlaceState, string> = {
  done: 'mat-ceramic-gold',
  open: 'mat-ceramic outline-[3px] outline-coral',
  locked: 'well bg-sand',
  none: 'mat-ceramic',
}
const GLYPH: Record<PlaceState, string> = {
  done: 'mat-ceramic-gold text-ink',
  open: 'btn-satin tint-coral text-coral-ink',
  locked: 'well bg-sand text-muted',
  none: 'mat-ceramic text-green-dark',
}

type Selection = { kind: 'place' | 'province' | 'river' | 'lake' | 'peak' | 'landscape' | 'neighbour'; id: string } | null

const placesFor = (mode: Mode, missions: readonly Mission[]): MapPlace[] => {
  const has = (p: MapPlace, ...tags: string[]) => p.tags.some((t) => tags.includes(t))
  const withMission = (p: MapPlace) => missions.some((x) => x.place === p.id)
  // Landmarks: history and nature, plus a city with a mission. A resort or a spa with a mission (v0.16) stays in
  // "tourism" — on a small map for 4–6 year olds every extra marker crowds the others.
  return PLACES.filter((p) => p.onMap).filter((p) =>
    mode === 'cities' ? has(p, 'city') : mode === 'tourism' ? has(p, 'ski', 'spa', 'cave') : mode === 'landmarks' ? has(p, 'history', 'nature') || (withMission(p) && has(p, 'city')) : false,
  )
}

/**
 * "Discover Bulgaria": a relief map from real elevation data with illustrated modes —
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
  const stateOf = (placeId: string): PlaceState => {
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
        // v0.26: a little 3D landmark standing in a glazed dish (gold when played, a coral rim when open, a grey recess
        // when locked), with a soft shadow on the land under it — the dish's centre is the exact spot.
        <span data-state={state} className={`relative grid size-full place-items-center transition-transform duration-500 ease-[var(--ease-spring)] ${active ? '-translate-y-1 scale-[1.3]' : ''}`}>
          {active && <span className="anim-glow pointer-events-none absolute size-16 rounded-full bg-gold/60" aria-hidden="true" />}
          <span className="ground absolute top-[62%] left-1/2 h-[26%] w-[86%] -translate-x-1/2" aria-hidden="true" />
          {p.img ? (
            <span className={`relative grid size-10 place-items-center rounded-full ${DISH[state]} ${active ? 'outline-[3px] outline-ink' : ''}`}>
              <img src={img(p.img)} alt="" className={`pop-3d absolute bottom-[10%] left-1/2 size-[112%] max-w-none -translate-x-1/2 object-contain ${state === 'locked' ? 'opacity-55 grayscale' : ''}`} />
            </span>
          ) : (
            <span className={`relative grid size-7 place-items-center rounded-full ${GLYPH[state]} ${active ? 'outline-[3px] outline-ink' : ''}`}>
              <PlaceGlyph icon={p.icon} className="size-4" />
            </span>
          )}
          {/* new (open, never opened): one small coral bead on the dish's rim — quiet, but it stands out from "open" */}
          {fresh && state !== 'locked' && <span className="btn-satin tint-coral absolute top-0.5 -right-0.5 size-3 rounded-full" aria-hidden="true" />}
          {state === 'locked' && <img src={img(ART.key)} alt="" className="pop-3d absolute -right-1.5 -bottom-0.5 size-5" />}
          {state === 'done' && (
            <span className="btn-satin tint-green absolute -right-1 -bottom-0.5 grid size-[1.125rem] place-items-center rounded-full text-white">
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
  } else if (mode === 'mountains' || mode === 'landscapes') {
    const features = mode === 'mountains' ? MAP_RANGES : PARKS_AND_PLAINS
    markers = features.map((r) => ({
      id: r.id, x: r.at[0], y: r.at[1], label: l(r.name), className: 'w-max min-w-12',
      content: <span className={`mat-paper edge-light flex flex-col items-center rounded-xl px-1.5 pb-1 ${isSel('landscape', r.id) ? 'outline-2 outline-ink' : ''}`}>
        <img src={img(LANDSCAPE_ART[r.id]!)} alt="" className="size-9 object-contain" />
        <span className="text-[0.7rem] leading-none font-black">{l(r.name)}</span>
      </span>,
    }))
    if (mode === 'mountains') markers.push(...PEAKS.map((p) => ({
      id: p.id,
      x: p.x,
      y: p.y,
      label: `${l(p.name)}, ${t('map.peak.height', { n: p.height })}`,
      className: 'size-14',
      content: (
        <span className={`relative grid size-full place-items-center transition-transform duration-300 ${isSel('peak', p.id) ? 'scale-125' : ''}`}>
          <span className="ground absolute top-[62%] left-1/2 h-[26%] w-[86%] -translate-x-1/2" aria-hidden="true" />
          <span className={`mat-ceramic relative grid size-10 place-items-center rounded-full ${isSel('peak', p.id) ? 'outline-[3px] outline-ink' : ''}`}>
            <img src={img(PEAK_ART[p.id] ?? 'world/mountain-peak.webp')} alt="" className="pop-3d absolute bottom-[10%] left-1/2 size-[112%] max-w-none -translate-x-1/2 object-contain" />
          </span>
        </span>
      ),
    })))
    onSelect = (id) => setSel({ kind: features.some((r) => r.id === id) ? 'landscape' : 'peak', id })
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
      <div className="@container/page">
      {/* v0.26 composition. Phone: the mode dock (all eight modes in view — no hidden sideways scroll), the map on its table,
          then the guide or what was tapped. Computer: the map large on the left; the dock and the panel in a column on the right. */}
      <div className="flex flex-col gap-4 px-4 pb-3 short:pb-8 cols:grid cols:grid-cols-[minmax(0,1fr)_15.5rem] cols:items-start cols:gap-x-6 cols:pb-10">
        <div className="order-2 flex flex-col gap-3 cols:order-none cols:col-start-1 cols:row-start-1">
          <BulgariaMap
            label={t('map.label')}
            relief
            markers={markers}
            labels={labels}
            layer={layer}
            onSelect={onSelect}
            onMapTap={onMapTap}
            footer={(mode === 'landmarks' || mode === 'cities' || mode === 'tourism') && <Legend />}
          />

          {mode === 'provinces' && (
            <details className="edge-light relative rounded-[var(--radius-card)] mat-paper px-4 py-2">
              <summary className="tap flex cursor-pointer items-center font-extrabold">{t('map.provinces.list')} (28)</summary>
              <ul className="flex flex-wrap gap-1.5 pb-2">
                {[...PROVINCES].sort((a, b) => l(a.name).localeCompare(l(b.name))).map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      aria-pressed={isSel('province', p.id)}
                      onClick={() => setSel({ kind: 'province', id: p.id })}
                      className={`press min-h-11 rounded-full px-3 text-sm font-bold ${isSel('province', p.id) ? 'bg-ink text-white' : 'well'}`}
                    >
                      {l(p.name)}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}

        </div>

        <div className="contents cols:sticky cols:top-4 cols:col-start-2 cols:row-start-1 cols:flex cols:flex-col cols:gap-4">
          {/* The dock: eight modes as tiles with their 3D picture — the chosen one is gold satin and lifted. */}
          <div role="group" aria-label={t('map.mode.label')} className="order-1 grid grid-cols-4 gap-2 cols:order-none cols:grid-cols-2">
            {MODES.map((md) => {
              const on = mode === md.id
              const short = t(`map.modeShort.${md.id}` as TKey)
              const full = t(`map.mode.${md.id}` as TKey)
              return (
                <button
                  key={md.id}
                  type="button"
                  aria-pressed={on}
                  // the full name for screen readers; it always contains the visible short word (label in name)
                  aria-label={full.toLowerCase().includes(short.toLowerCase()) ? full : `${short} – ${full}`}
                  onClick={() => switchMode(md.id)}
                  className={`press edge-light flex min-h-[4.75rem] min-w-0 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-1 pt-1.5 pb-1.5 transition-[translate] duration-300 cols:min-h-[3.25rem] cols:flex-row cols:justify-start cols:gap-1.5 cols:px-1.5 cols:text-left ${
                    on ? 'mat mat-satin tint-gold -translate-y-0.5 text-ink' : 'mat-paper text-ink'
                  }`}
                >
                  <img src={img(md.art)} alt="" className={`pop-3d size-[min(2.5rem,10vw)] shrink-0 object-contain cols:size-9 transition-transform duration-500 ease-[var(--ease-spring)] ${on ? 'scale-110' : ''}`} />
                  {/* the label measures its own box (container units): full tile width on a phone, beside the picture on a computer */}
                  <span className="block w-full min-w-0 text-center [container-type:inline-size] cols:w-auto cols:flex-1 cols:text-left">
                    <span className="block leading-tight font-extrabold" style={fitWords(short, 'min(0.8125rem, 3.5vw)', 0.64)}>
                      {short}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="order-3 flex flex-col gap-3 cols:order-none">
            {!sel && (
              <CharacterMessage hero="koren" mood="determination">
                {/* a sentence: a long word moves whole to the next line instead of getting a hyphen */}
                <p className="font-extrabold hyphens-manual">
                  {mode === 'provinces' ? t('map.provinces.count') + ' ' + t('map.pick.provinces') : mode === 'landmarks' || mode === 'cities' ? t('map.pick') : t(`map.pick.${mode}` as TKey)}
                </p>
              </CharacterMessage>
            )}
            <Link to="/topic/geography" className="tap mat-paper edge-light flex items-center justify-between gap-2 rounded-[1.25rem] px-4 font-extrabold">
              {t('subject.geography')}
              <Icon name="chevron" />
            </Link>
            {!sel && mode === 'landmarks' && <TimelineLink />}
            {sel && <InfoPanel key={`${sel.kind}:${sel.id}`} sel={sel} onClose={() => setSel(null)} missionsAt={missionsAt} />}
          </div>
        </div>
      </div>
      </div>
    </Screen>
  )
}

/** The legend under the map, in the same dishes the markers stand in. */
function Legend() {
  const t = useT()
  return (
    <ul className="flex flex-wrap items-center gap-1.5 text-[length:min(0.8125rem,3.5vw)] font-extrabold">
      <li className="flex items-center gap-1.5 rounded-full py-1 pr-2 pl-1">
        <span className="mat-ceramic-gold size-5" aria-hidden="true" />
        {t('map.legend.done')}
      </li>
      <li className="flex items-center gap-1.5 rounded-full py-1 pr-2 pl-1">
        <span className="mat-ceramic size-5 outline-[2.5px] outline-coral" aria-hidden="true" />
        {t('map.legend.open')}
      </li>
      <li className="flex items-center gap-1.5 rounded-full py-1 pr-2 pl-1">
        <img src={img(ART.key)} alt="" className="size-5" />
        {t('map.legend.locked')}
      </li>
      <li className="flex items-center gap-1.5 rounded-full py-1 pr-2 pl-1">
        <span className="btn-satin tint-coral size-3 rounded-full" aria-hidden="true" />
        {t('unlock.new')}
      </li>
    </ul>
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
  } else if (sel.kind === 'landscape') {
    const feature = [...MAP_RANGES, ...PARKS_AND_PLAINS].find((r) => r.id === sel.id)!
    title = l(feature.name)
    art = LANDSCAPE_ART[feature.id]
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

  // On a phone the panel opens under the map: bring it into view (the page's scroll padding keeps it clear of the nav).
  const panel = useRef<HTMLElement>(null)
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const el = panel.current
    // only when the panel's top is out of sight (a phone): beside the map (computer) the page never jumps
    if (el && el.getBoundingClientRect().top > window.innerHeight - 96) el.scrollIntoView?.({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' })
  }, [])

  return (
    <m.section
      ref={panel}
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={bouncy}
      aria-live="polite"
      className="relative overflow-hidden rounded-[var(--radius-stage)] bg-white shadow-stage"
    >
      <div className={`${tone} relative flex min-h-20 items-end gap-3 px-4 pt-4 pb-3 [container-type:inline-size]`}>
        {art && (
          <m.img
            src={img(art)}
            alt=""
            initial={{ scale: 0.4, y: 20, rotate: -10 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            transition={bouncy}
            className="pop-3d -mb-1 size-[min(6.5rem,26vw)] shrink-0 object-contain wide:size-[3.25rem]"
          />
        )}
        {/* sized by its longest word against the header (a narrow column beside the map on a computer) */}
        <h2 className="text-title min-w-0 flex-1 pr-10 pb-1 text-ink" style={fitWords(title, 'min(1.75rem, 7vw)', 0.66)}>
          {title}
        </h2>
        <button type="button" onClick={onClose} aria-label={t('map.close')} className="tap press absolute top-1 right-1 grid place-items-center rounded-full text-ink">
          <Icon name="close" />
        </button>
      </div>
      <div className="flex flex-col gap-1 p-4 empty:hidden">
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
                <span className="btn-satin tint-coral edge-light grid size-11 shrink-0 place-items-center rounded-full text-coral-ink" aria-hidden="true">
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
