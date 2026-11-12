import type { CSSProperties } from 'react'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { useAge, useProfiles } from '../store/profiles'
import { LEVELS, LEVEL_DEFAULT_AGE, MAX_AGE, MIN_AGE, ageToLevel, type Level } from '../theme/levels'
import { Icon } from './Icon'
import { LevelIcon } from './SectionIcon'
import { Card } from './ui'

/** Each level has its own colour, so the three choices never look like the same card three times. */
const TINT: Record<Level, string> = { small: 'bg-gold-soft', young: 'bg-sky-soft', guard: 'bg-coral-soft' }

/** Slider 4–14 plus the three level cards. Both edit the age of the child who is playing. */
export function AgePicker() {
  const t = useT()
  const age = useAge()
  const setAge = useProfiles((s) => s.setAge)
  const current = ageToLevel(age)
  const fill = ((age - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100
  const ticks = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i)

  return (
    <div className="flex flex-col gap-4">
      <Card className="px-5 pt-5 pb-4">
        <div className="flex justify-center">
          {/* The number hops every time the slider moves. */}
          <m.span
            key={age}
            initial={{ scale: 0.8, y: 4 }}
            animate={{ scale: 1, y: 0 }}
            transition={bouncy}
            className="rounded-full bg-[var(--accent)] px-6 py-1.5 text-2xl font-black text-[var(--accent-ink)]"
          >
            {t('age.years', { n: age })}
          </m.span>
        </div>
        <input
          type="range"
          className="age-range mt-2"
          min={MIN_AGE}
          max={MAX_AGE}
          step={1}
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          aria-label={t('age.sliderLabel')}
          aria-valuetext={t('age.years', { n: age })}
          style={{ '--fill': `${fill}%` } as CSSProperties}
        />
        <div className="flex justify-between px-[12px] text-xs font-extrabold text-muted" aria-hidden="true">
          {ticks.map((n) => (
            <span key={n} className={n === age ? 'scale-125 text-ink' : undefined}>
              {n}
            </span>
          ))}
        </div>
      </Card>

      <div role="radiogroup" aria-label={t('age.subtitle')} className="flex flex-col gap-3">
        {LEVELS.map((level) => {
          const selected = level === current
          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                if (!selected) setAge(LEVEL_DEFAULT_AGE[level])
              }}
              className={`tap press rounded-level flex items-center gap-4 p-3 text-left ${
                selected ? 'bg-green-soft shadow-soft ring-[3px] ring-green' : 'bg-white shadow-soft'
              }`}
            >
              <span className={`grid size-[min(4rem,16vw)] shrink-0 place-items-center rounded-full ${TINT[level]}`}>
                <LevelIcon level={level} className="pop-3d size-[82%]" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-lg leading-tight font-black">{t(`level.${level}.range`)}</span>
                <span className="text-[length:min(0.875rem,4vw)] font-bold text-muted">{t(`level.${level}.name`)}</span>
              </span>
              <span className="grid size-8 shrink-0 place-items-center" aria-hidden="true">
                {selected ? (
                  <m.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={bouncy}
                    className="grid size-8 place-items-center rounded-full bg-green text-white"
                  >
                    <Icon name="check" width="1.1em" height="1.1em" />
                  </m.span>
                ) : (
                  <span className="size-6 rounded-full bg-sand" />
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
