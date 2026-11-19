import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { Avatar, img } from '../components/Brand'
import { fitWords } from '../components/fit'
import { Icon } from '../components/Icon'
import { Screen, TopBar, roundButton } from '../components/ui'
import { placeById } from '../content/places'
import { EPOCHS, TIMELINE, hasState, type Epoch } from '../content/timeline'
import { useChildMissions } from '../content/useChildMissions'
import { useLocalized } from '../content/useLocalized'
import type { TKey } from '../i18n'
import { useT } from '../i18n/useT'
import { TimelineMap } from '../map/TimelineMap'
import { bouncy, m } from '../motion'
import { useAge } from '../store/profiles'
import { ageToLevel } from '../theme/levels'

/**
 * The great periods of Bulgarian history (by the usual school division). The road under the map is coloured by them,
 * and the chronicle page names the one the child is in. Only the start year decides — the epochs' own years never change.
 */
const ERAS = [
  { id: 'first', from: 681, color: '#F2BE3A' },
  { id: 'byz', from: 1018, color: '#B8AE9A' },
  { id: 'second', from: 1185, color: '#5DBBEA' },
  { id: 'ottoman', from: 1396, color: '#9A8C74' },
  { id: 'third', from: 1878, color: '#1E9A5C' },
] as const
const eraOf = (year: number) => [...ERAS].reverse().find((e) => year >= e.from)!

/**
 * Timeline v0.26 — a journey, not a slider: a year seal with its era, an old map on the table where the territory is a
 * raised plate, the road through the centuries (one milestone per epoch, coloured by era), and a chronicle page that
 * tells what happened (Raya narrates), with the capital's landmark, the people of the era and the mission.
 * The dashed line on the map is always today's border, so every epoch can be compared with now.
 */
export function Timeline() {
  const t = useT()
  const l = useLocalized()
  const level = ageToLevel(useAge())
  const [index, setIndex] = useState(0)
  const epoch = EPOCHS[index]!
  const last = EPOCHS.length - 1
  const capital = placeById(epoch.capital)
  const go = (i: number) => setIndex(Math.min(last, Math.max(0, i)))
  const yearLabel = t('timeline.year', { year: epoch.year })
  const era = eraOf(epoch.year)
  // the mission link only for a mission this child can see (drafts are hidden in the family build)
  const missions = useChildMissions()
  const mission = missions.some((x) => x.id === epoch.mission) ? epoch.mission : undefined
  const title = l(epoch.title)

  return (
    <Screen nav wide>
      <TopBar title={t('timeline.title')} />
      <div className="@container/page">
      <div className="flex flex-col gap-4 px-4 pb-[calc(var(--tap)+4rem+env(safe-area-inset-bottom))] short:pb-8 cols:grid cols:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] cols:items-start cols:gap-x-7 cols:gap-y-4 cols:pb-10 cols:[&>*]:col-start-2">
        {/* 1. The year seal between "earlier" and "later" (the era is named on the chronicle page) */}
        <div className="flex items-center gap-3">
          {/* aria-disabled (not disabled): at the first/last year the button keeps keyboard focus instead of dropping it. */}
          <button type="button" onClick={() => go(index - 1)} aria-disabled={index === 0} aria-label={t('timeline.prev')} className={`${roundButton} aria-disabled:opacity-40`}>
            <Icon name="back" />
          </button>
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1 [container-type:inline-size]">
            <m.p
              key={epoch.id}
              initial={{ scale: 0.8, y: 6, rotate: -3 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              transition={bouncy}
              className="btn-satin tint-coral edge-light w-fit rounded-full px-6 py-1 text-[length:min(2.25rem,9vw,22cqw)] leading-tight font-black whitespace-nowrap text-coral-ink"
            >
              {yearLabel}
            </m.p>
          </div>
          <button type="button" onClick={() => go(index + 1)} aria-disabled={index === last} aria-label={t('timeline.next')} className={`${roundButton} aria-disabled:opacity-40`}>
            <Icon name="chevron" />
          </button>
        </div>

        {/* 2. The map on the table (two sheets under it) + the road through the centuries. Wide: the left column, in view. */}
        <div className="flex flex-col gap-4 cols:sticky cols:top-4 cols:col-start-1! cols:row-span-3 cols:row-start-1">
          <div className="relative">
            <span className="mat-paper absolute inset-x-5 -bottom-2.5 h-10 rounded-b-[1.75rem] opacity-80" aria-hidden="true" />
            <span className="mat-paper absolute inset-x-2.5 -bottom-1.5 h-10 rounded-b-[1.9rem]" aria-hidden="true" />
            <div className="relative">
              <TimelineMap epoch={epoch} label={`${t('timeline.mapLabel')} – ${yearLabel}`} />
            </div>
          </div>
          <Road index={index} onChange={go} label={`${yearLabel} – ${title}`} />
        </div>

        {/* 3. The chronicle page: what happened, told by Raya, in words for the child's age */}
        <m.article
          key={epoch.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          className="mat-paper edge-light relative flex flex-col gap-3 rounded-[1.75rem] p-4 pt-3.5 wide:p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1 [container-type:inline-size]">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: era.color }} aria-hidden="true" />
                <span className="text-eyebrow text-muted">{t(`timeline.era.${era.id}` as TKey)}</span>
              </span>
              <h2 className="text-headline" aria-live="polite" style={fitWords(title, 'min(1.5rem, 6.4vw)', 0.62)}>
                {title}
              </h2>
            </div>
            <Avatar hero="raya" mood={hasState(epoch) ? 'joy' : 'thoughtful'} className="size-[min(3.5rem,14vw)]" />
          </div>
          <p className="text-lg leading-snug font-bold">{l(epoch.text[level])}</p>

          {capital && <Capital epoch={epoch} />}

          {/* v0.18: the people of the era, and the mission about it */}
          {epoch.people && (
            <div className="flex flex-col gap-2">
              <h3 className="text-eyebrow text-muted">{t('timeline.people')}</h3>
              <ul className="flex flex-wrap gap-3">
                {epoch.people.map((p) => (
                  <li key={p.img} className="flex min-w-0 items-center gap-2.5">
                    <span className="relative grid shrink-0 place-items-center pb-1">
                      <span className="pedestal-gold absolute bottom-0 left-1/2 h-[24%] w-[96%] -translate-x-1/2" aria-hidden="true" />
                      <img src={img(p.img)} alt="" className="mat-ceramic relative size-[min(4rem,16vw)] object-contain p-0.5" />
                    </span>
                    <span className="text-row min-w-0">{l(p)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {mission && (
            <Link to={`/mission/${mission}`} className="btn-satin tint-green edge-light tap flex items-center justify-center gap-1.5 self-start rounded-full px-5 text-xl font-black text-white">
              <span className="[overflow-wrap:break-word]">{t('timeline.toMission')}</span>
              <Icon name="chevron" width="0.9em" height="0.9em" />
            </Link>
          )}
        </m.article>

        {/* Legend + the honest note */}
        <div className="flex flex-col gap-2">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm font-bold text-muted">
            <li className="flex items-center gap-1.5">
              <span className="size-4 rounded-[0.3rem] bg-[linear-gradient(180deg,#ff8a80,#f45e55)] shadow-[0_2px_0_#b8382f]" aria-hidden="true" />
              {t('timeline.then')}
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-0 w-6 border-t-[3px] border-dashed border-green-deep" aria-hidden="true" />
              {t('timeline.today')}
            </li>
            {epoch.shape.planned && (
              <li className="flex items-center gap-1.5">
                <span className="h-0 w-6 border-t-[3px] border-dotted border-coral-dark" aria-hidden="true" />
                {t('timeline.planned')}
              </li>
            )}
          </ul>
          <p className="text-center text-xs font-semibold text-muted">
            {t('timeline.schematic')}
            {TIMELINE.draft && ` ${t('missions.draft')}.`}
          </p>
        </div>
      </div>
      </div>
    </Screen>
  )
}

/** The capital: its landmark on a ceramic disc (when the place has a picture) and its name. */
function Capital({ epoch }: { epoch: Epoch }) {
  const t = useT()
  const l = useLocalized()
  const capital = placeById(epoch.capital)!
  return (
    <p className="well flex items-center gap-3 rounded-[1.25rem] py-2 pr-4 pl-2">
      <span className="mat-ceramic grid size-[min(3.25rem,13vw)] shrink-0 place-items-center" aria-hidden="true">
        {capital.img ? <img src={img(capital.img)} alt="" className="size-[84%] object-contain" /> : <Icon name="star" className="text-gold-dark" />}
      </span>
      <span className="text-row min-w-0 text-green-dark">{t('timeline.capital', { name: l(capital.name) })}</span>
    </p>
  )
}

/**
 * The road through the centuries: the real range input (drag, tap, keyboard, screen reader) lies over a drawn road —
 * one coloured stretch per epoch (by era), a milestone at each epoch; behind the child the road is bright, ahead it is
 * pale. The milestones sit exactly under the knob's centre: 19 px + f × (width − 38 px) — the knob is 38 px wide.
 */
function Road({ index, onChange, label }: { index: number; onChange: (i: number) => void; label: string }) {
  const t = useT()
  const last = EPOCHS.length - 1
  const at = (i: number) => `calc(19px + ${i / last} * (100% - 38px))`
  return (
    <div className="mat-paper edge-light rounded-[1.75rem] px-4 pt-3 pb-2.5">
      <p className="text-eyebrow text-muted">{t('timeline.road')}</p>
      <div className="relative">
        <span className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2" aria-hidden="true">
          <span className="well absolute top-1/2 h-3.5 -translate-y-1/2 rounded-full" style={{ left: at(0), right: '19px' }} />
          {EPOCHS.slice(0, last).map((e, i) => (
            <span
              key={e.id}
              className="absolute top-1/2 h-3.5 -translate-y-1/2 transition-opacity duration-300 first:rounded-l-full"
              style={{
                left: at(i),
                width: `calc((100% - 38px) / ${last})`,
                background: `linear-gradient(180deg, rgb(255 255 255 / 0.45), transparent 60%), ${eraOf(e.year).color}`,
                opacity: i < index ? 1 : 0.28,
                borderRadius: i === last - 1 ? '0 999px 999px 0' : undefined,
              }}
            />
          ))}
          {EPOCHS.map((e, i) => (
            <span
              key={e.id}
              className={`absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${i <= index ? 'mat-ceramic-gold' : 'bg-white shadow-[0_0_0_1.5px_rgb(52_44_24/0.14)]'}`}
              style={{ left: at(i) }}
            />
          ))}
        </span>
        <input
          type="range"
          className="age-range road-range relative"
          min={0}
          max={last}
          step={1}
          value={index}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={t('timeline.slider')}
          aria-valuetext={label}
          style={{ '--fill': `${(index / last) * 100}%` } as CSSProperties}
        />
      </div>
      <div className="flex justify-between text-xs font-extrabold text-muted" aria-hidden="true">
        <span>{EPOCHS[0]!.year}</span>
        <span>{t('timeline.step', { n: index + 1, total: EPOCHS.length })}</span>
        <span>{EPOCHS[last]!.year}</span>
      </div>
    </div>
  )
}
