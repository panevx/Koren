import { detailImage } from './detailImage'
import type { CSSProperties, ReactNode } from 'react'
import type { SceneId } from '../content/schema'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { useAge, useProfiles } from '../store/profiles'
import { LEVELS, LEVEL_DEFAULT_AGE, MAX_AGE, MIN_AGE, ageToLevel, type Level } from '../theme/levels'
import { MODE_ART } from '../world'
import { img } from './Brand'
import { fitWords } from './fit'
import { Icon } from './Icon'
import { SceneBackdrop } from './Scene'
import { LevelIcon } from './SectionIcon'

/**
 * v0.26: the three age modes are three different worlds, not three rows of one list —
 * a flower meadow (pictures and play), the mountains (journeys and maps), a fortress at sunset (history and reasons).
 * Each has its own hero, its emblem on a pedestal and one thing far away. Phone: three landscape strips, the chosen one
 * opens and tells what awaits. Wide screen: three portals side by side.
 */
const WORLD: Record<Level, { scene: SceneId; pedestal: string }> = {
  small: { scene: 'meadow', pedestal: 'tint-gold' },
  young: { scene: 'mountain', pedestal: 'tint-sky' },
  guard: { scene: 'castle', pedestal: 'tint-coral' },
}

/** The three modes plus the exact age (a slider 4–14). Both edit the age of the child who is playing. */
/** `action`: shown beside the exact-age ruler (the computer puts "Next" there, so the whole step fits on one screen). */
export function AgePicker({ action }: { action?: ReactNode }) {
  const t = useT()
  const age = useAge()
  const setAge = useProfiles((s) => s.setAge)
  const current = ageToLevel(age)
  const fill = ((age - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100
  const ticks = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i)

  return (
    <div className="flex flex-col gap-4 wide:gap-6">
      <div role="radiogroup" aria-label={t('age.subtitle')} className="grid gap-3 wide:grid-cols-3 wide:gap-5">
        {LEVELS.map((level) => (
          <ModeWorld key={level} level={level} selected={level === current} onPick={() => setAge(LEVEL_DEFAULT_AGE[level])} />
        ))}
      </div>

      {/* The exact age: a ruler under the worlds — the number hops whenever the slider moves. */}
      <div className="flex items-center gap-5 wide:mx-auto wide:w-full wide:max-w-4xl">
      <div className="mat-paper edge-light min-w-0 flex-1 rounded-[1.75rem] px-5 pt-3 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="text-eyebrow text-muted">{t('age.exact')}</span>
          <m.span
            key={age}
            initial={{ scale: 0.8, y: 4 }}
            animate={{ scale: 1, y: 0 }}
            transition={bouncy}
            className="fill-satin tint-green rounded-full px-4 py-1 text-xl font-black whitespace-nowrap text-white"
          >
            {t('age.years', { n: age })}
          </m.span>
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
        <div className="flex justify-between px-[12px] text-[length:min(0.75rem,3.1vw)] font-extrabold text-muted" aria-hidden="true">
          {ticks.map((n) => (
            <span key={n} className={n === age ? 'scale-125 text-ink' : undefined}>
              {n}
            </span>
          ))}
        </div>
      </div>
      {action}
      </div>
    </div>
  )
}

function ModeWorld({ level, selected, onPick }: { level: Level; selected: boolean; onPick: () => void }) {
  const t = useT()
  const art = MODE_ART[level]
  const world = WORLD[level]
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => {
        if (!selected) onPick()
      }}
      className={`lift group relative isolate flex min-h-[min(7.25rem,31vw)] overflow-hidden rounded-[1.75rem] text-left transition-[transform,box-shadow] wide:min-h-0 wide:flex-col ${
        selected ? 'outline-[3px] outline-offset-[3px] outline-green-dark [box-shadow:var(--elev-4)]' : '[box-shadow:var(--elev-2)]'
      }`}
    >
      {/* the world: a code-drawn landscape (0 KB). Not chosen → a little quieter (never dimmer text: the text is on paper). */}
      <SceneBackdrop scene={world.scene} quiet className={`absolute inset-0 -z-10 size-full transition-[filter] duration-500 ${selected ? '' : 'saturate-[0.7]'}`} />
      <span className="rim-over pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden="true" />

      {/* The picture: the far object, the emblem on its pedestal, the hero standing on the grass. */}
      <span className="relative order-2 w-[40%] shrink-0 wide:order-1 wide:h-[clamp(8.5rem,22vh,15rem)] wide:w-full" aria-hidden="true">
        <img
          src={img(art.far)} {...detailImage(art.far, '(min-width: 1024px) 145px, 64px')}
          alt=""
          className={`absolute object-contain opacity-90 ${
            level === 'guard' ? 'top-[14%] right-[8%] w-[40%]' : level === 'young' ? 'top-[6%] right-[6%] w-[24%] anim-float' : 'top-[10%] right-[10%] w-[20%] anim-float'
          }`}
        />
        <span className={`pedestal absolute bottom-[9%] left-[4%] h-[11%] w-[34%] ${world.pedestal}`} />
        <LevelIcon level={level} className="pop-3d absolute bottom-[13%] left-[6%] w-[30%]" />
        <span className="ground absolute bottom-[3%] left-[52%] h-[9%] w-[44%] -translate-x-1/2" />
        <img
          src={img(art.hero)} {...detailImage(art.hero, '(min-width: 1024px) 165px, min(35vw, 130px)')}
          alt=""
          decoding="async"
          className={`pop-3d absolute bottom-[5%] left-[52%] h-[88%] w-[96%] -translate-x-1/2 object-contain object-bottom transition-transform duration-500 ease-[var(--ease-spring)] ${
            selected ? 'scale-105' : 'scale-95'
          }`}
        />
      </span>

      {/* The plaque: what this world is called and — when chosen — what awaits there. */}
      <span className="mat-paper edge-light relative order-1 m-2 mr-0 flex min-w-0 flex-1 flex-col justify-center gap-0.5 rounded-[1.25rem] px-3.5 py-2.5 [container-type:inline-size] wide:order-2 wide:m-3 wide:mt-0 wide:flex-none">
        <span className="flex items-center justify-between gap-2">
          <span className="text-eyebrow min-w-0 text-muted">{t(`level.${level}.range`)}</span>
          {/* the radio dot: a recess, or a satin green coin with the tick */}
          <span className="grid size-7 shrink-0 place-items-center" aria-hidden="true">
            {selected ? (
              <m.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={bouncy} className="btn-satin tint-green grid size-7 place-items-center rounded-full text-white">
                <Icon name="check" width="1em" height="1em" />
              </m.span>
            ) : (
              <span className="well size-6 rounded-full" />
            )}
          </span>
        </span>
        {/* sized by its longest word against the plaque: „пътешественици“ must not break on a 320 px phone */}
        <span className="text-heading" style={fitWords(t(`level.${level}.name`), 'min(1.25rem, 5.4vw)', 0.7)}>
          {t(`level.${level}.name`)}
        </span>
        <span className={`text-meta mt-0.5 text-muted hyphens-manual ${selected ? '' : 'hidden wide:block'}`} data-fit-label>{t(`level.${level}.about`)}</span>
      </span>
    </button>
  )
}
