import { useState, type CSSProperties } from 'react'
import { Avatar } from '../components/Brand'
import { Icon } from '../components/Icon'
import { Card, Screen, TopBar, roundButton } from '../components/ui'
import { placeById } from '../content/places'
import { EPOCHS, TIMELINE, hasState } from '../content/timeline'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { TimelineMap } from '../map/TimelineMap'
import { bouncy, m } from '../motion'
import { useAge } from '../store/profiles'
import { ageToLevel } from '../theme/levels'

/**
 * Timeline: move the slider through the years and watch Bulgaria's borders change.
 * The dashed line is always today's border, so every epoch can be compared with now.
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

  return (
    <Screen nav>
      <TopBar title={t('timeline.title')} />
      <div className="flex flex-col gap-3 px-4 pb-32">
        {/* Year + title, with earlier / later buttons */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label={t('timeline.prev')} className={`${roundButton} disabled:opacity-40`}>
            <Icon name="back" />
          </button>
          <div className="min-w-0 flex-1">
            <m.p
              key={epoch.id}
              initial={{ scale: 0.8, y: 4 }}
              animate={{ scale: 1, y: 0 }}
              transition={bouncy}
              className="mx-auto w-fit rounded-full bg-coral px-5 py-1 text-[length:min(1.875rem,8vw)] font-black whitespace-nowrap text-coral-ink"
            >
              {yearLabel}
            </m.p>
          </div>
          <button type="button" onClick={() => go(index + 1)} disabled={index === last} aria-label={t('timeline.next')} className={`${roundButton} disabled:opacity-40`}>
            <Icon name="chevron" />
          </button>
        </div>

        <h2 className="-mt-1 text-center text-xl leading-tight font-black" aria-live="polite">
          {l(epoch.title)}
        </h2>

        <TimelineMap epoch={epoch} label={`${t('timeline.mapLabel')} – ${yearLabel}`} />

        {/* The slider: one stop per epoch */}
        <Card className="px-5 pt-1 pb-3">
          <input
            type="range"
            className="age-range"
            min={0}
            max={last}
            step={1}
            value={index}
            onChange={(e) => go(Number(e.target.value))}
            aria-label={t('timeline.slider')}
            aria-valuetext={`${yearLabel} – ${l(epoch.title)}`}
            style={{ '--fill': `${(index / last) * 100}%` } as CSSProperties}
          />
          <div className="flex justify-between text-xs font-extrabold text-muted" aria-hidden="true">
            <span>{EPOCHS[0]!.year}</span>
            <span>{t('timeline.step', { n: index + 1, total: EPOCHS.length })}</span>
            <span>{EPOCHS[last]!.year}</span>
          </div>
        </Card>

        {/* What happened — told by Raya, in words for the child's age */}
        <div className="flex items-start gap-3">
          <Avatar hero="raya" mood={hasState(epoch) ? 'joy' : 'thoughtful'} className="size-[min(3.5rem,14vw)]" />
          <m.div key={epoch.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="min-w-0 flex-1 rounded-[1.5rem] rounded-tl-md bg-white px-4 py-3 shadow-soft">
            <p className="text-lg leading-snug font-bold">{l(epoch.text[level])}</p>
            {capital && <p className="mt-1 text-sm font-extrabold text-green-dark">{t('timeline.capital', { name: l(capital.name) })}</p>}
          </m.div>
        </div>

        {/* Legend */}
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm font-bold text-muted">
          <li className="flex items-center gap-1.5">
            <span className="size-4 rounded-full bg-coral" aria-hidden="true" />
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
    </Screen>
  )
}
