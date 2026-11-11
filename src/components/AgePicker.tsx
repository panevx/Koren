import type { CSSProperties } from 'react'
import { useT } from '../i18n/useT'
import { useProfiles, useAge } from '../store/profiles'
import {
  LEVELS,
  LEVEL_DEFAULT_AGE,
  MAX_AGE,
  MIN_AGE,
  ageToLevel,
} from '../theme/levels'
import { LevelIcon } from './SectionIcon'

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
      <div className="rounded-level bg-white p-4 shadow-sm">
        <div className="flex justify-center">
          <span className="rounded-full bg-[var(--accent)] px-4 py-1 text-lg font-black text-[var(--accent-ink)]">
            {t('age.years', { n: age })}
          </span>
        </div>
        <input
          type="range"
          className="age-range mt-1"
          min={MIN_AGE}
          max={MAX_AGE}
          step={1}
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          aria-label={t('age.sliderLabel')}
          aria-valuetext={t('age.years', { n: age })}
          style={{ '--fill': `${fill}%` } as CSSProperties}
        />
        <div className="flex justify-between px-[10px] text-xs font-bold text-muted" aria-hidden="true">
          {ticks.map((n) => (
            <span key={n} className={n === age ? 'text-ink' : undefined}>
              {n}
            </span>
          ))}
        </div>
      </div>

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
              className={`tap rounded-level flex items-center gap-4 border-2 p-3 text-left transition ${
                selected
                  ? 'border-green bg-green text-white shadow-md'
                  : 'border-sand bg-white text-ink hover:border-green'
              }`}
            >
              <span className={`grid size-[min(3.5rem,14vw)] shrink-0 place-items-center rounded-2xl ${selected ? 'bg-white/15' : 'bg-cream'}`}>
                <LevelIcon level={level} className="size-[85%]" />
              </span>
              <span className="flex flex-1 flex-col">
                <span className="text-lg font-black">{t(`level.${level}.range`)}</span>
                <span className={`text-sm font-semibold ${selected ? 'text-white/90' : 'text-muted'}`}>
                  {t(`level.${level}.name`)}
                </span>
              </span>
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full border-2 ${
                  selected ? 'border-white' : 'border-sand'
                }`}
                aria-hidden="true"
              >
                {selected && <span className="size-3.5 rounded-full bg-white" />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
