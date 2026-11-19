import { earnedCount } from '../content/badges'
import { Link, useNavigate } from 'react-router'
import { HeroFigure } from '../components/Brand'
import { Meter } from '../components/ds'
import { fitWords } from '../components/fit'
import { Icon } from '../components/Icon'
import { ProfileAvatar, useProfileName } from '../components/ProfileAvatar'
import { Screen, TopBar } from '../components/ui'
import { MISSIONS } from '../content/missions'
import { forLevel } from '../content/forLevel'
import { ageToLevel } from '../theme/levels'
import { useT } from '../i18n/useT'
import { bouncy, m, rise, stagger } from '../motion'
import { useProfiles } from '../store/profiles'

/** Each child has a colour of their own: the satin ring their sign sits in. */
const TINTS = ['tint-gold', 'tint-sky', 'tint-coral'] as const

/**
 * "Who is playing?" — v0.26: Koren and Raya meet the children at the door; each child is a traveller's card whose
 * sign stands on a pedestal and rises out of the card (it crosses the card's edge, so the card reads as a shelf).
 * The child who is playing now has a green rim and the "Playing now" chip. Adding or deleting needs a parent.
 */
export function WhoPlays() {
  const t = useT()
  const navigate = useNavigate()
  const name = useProfileName()
  const { profiles, activeId, setActive } = useProfiles()
  return (
    <Screen wide>
      <TopBar title={t('profile.who')} />
      <div className="flex flex-col gap-5 px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] wide:mx-auto wide:w-full wide:max-w-4xl">
        {/* The welcome: the two heroes either side of a greeting — a welcoming committee, not a decoration strip. */}
        <div className="flex items-end justify-center gap-1" aria-hidden="true">
          <m.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...bouncy, delay: 0.05 }} className="relative shrink-0">
            <span className="ground absolute -bottom-1 left-1/2 h-3 w-[95%] -translate-x-1/2" />
            <HeroFigure hero="koren" className="anim-bob relative h-[min(9.5rem,36vw)] short:h-[5.5rem] wide:h-[10rem]" />
          </m.div>
          <m.p
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ ...bouncy, delay: 0.25 }}
            className="mat-paper edge-light relative mb-[min(5rem,19vw)] min-w-0 flex-1 rounded-[1.25rem] px-3.5 py-2.5 text-center text-[length:min(1.0625rem,4.4vw)] leading-snug font-extrabold wide:mb-24 wide:max-w-sm wide:flex-none wide:text-lg"
          >
            {t('profile.whoGreet')}
          </m.p>
          <m.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...bouncy, delay: 0.15 }} className="relative shrink-0">
            <span className="ground absolute -bottom-1 left-1/2 h-3 w-[95%] -translate-x-1/2" />
            <HeroFigure hero="raya" className="anim-bob-late relative h-[min(9.25rem,35vw)] short:h-[5.25rem] wide:h-[9.75rem]" />
          </m.div>
        </div>

        <m.ul
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-x-4 gap-y-3 [--sign:min(5.5rem,22vw)] wide:gap-y-[calc(var(--sign)*0.42+1rem)] wide:pt-[calc(var(--sign)*0.42)] wide:grid-cols-[repeat(auto-fit,minmax(14rem,16rem))] wide:justify-center wide:[--sign:7rem]"
        >
          {profiles.map((p, i) => {
            const active = p.id === activeId
            const visible = forLevel(MISSIONS, ageToLevel(p.age))
            const earned = earnedCount(p.badges, visible)
            return (
              <m.li key={p.id} variants={rise} className="flex">
                <button
                  type="button"
                  onClick={() => {
                    setActive(p.id)
                    navigate('/home')
                  }}
                  aria-pressed={active}
                  className={`lift mat-paper edge-light flex w-full items-center gap-3 rounded-[1.75rem] py-3 pr-3 pl-[calc(var(--sign)+1.5rem)] text-left wide:flex-col wide:items-stretch wide:px-5 wide:pt-[calc(var(--sign)*0.62)] wide:pb-5 wide:text-center wide:h-full ${
                    active ? 'outline-[3px] outline-offset-[3px] outline-green-dark' : ''
                  }`}
                >
                  {/* The sign on its pedestal, half out of the card. */}
                  <span
                    className="absolute top-1/2 left-3 grid size-[var(--sign)] -translate-y-1/2 place-items-center wide:top-0 wide:left-1/2 wide:-translate-x-1/2 wide:-translate-y-[42%]"
                    aria-hidden="true"
                  >
                    <span className={`pedestal absolute -bottom-[6%] left-1/2 h-[24%] w-[104%] -translate-x-1/2 ${TINTS[i % TINTS.length]}`} />
                    <span className={`mat mat-satin edge-light relative grid size-full place-items-center rounded-full ${TINTS[i % TINTS.length]}`}>
                      <ProfileAvatar avatar={p.avatar} outfit={p.outfit} className="size-[80%]" />
                    </span>
                  </span>

                  <span className="flex min-w-0 flex-1 flex-col gap-1 [container-type:inline-size] wide:mb-4 wide:flex-none wide:items-center">
                    {/* "Playing now": on a computer every card keeps the chip's row (invisible when not playing), so the names line up */}
                    {active ? (
                      <span className="self-start rounded-full bg-green-dark px-2.5 py-0.5 text-xs font-black whitespace-nowrap text-white uppercase shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_1px_1px_rgb(10_82_48/0.3)] wide:self-center">
                        {t('profile.playing')}
                      </span>
                    ) : (
                      <span className="hidden px-2.5 py-0.5 text-xs font-black wide:invisible wide:block" aria-hidden="true">
                        {t('profile.playing')}
                      </span>
                    )}
                    <span className="text-headline" style={fitWords(name(p, i), 'min(1.5rem, 6.4vw)', 0.64)}>
                      {name(p, i)}
                    </span>
                    {/* sized by its longest word against the card's text column („откриватели“ on a 280 px folded phone) */}
                    <span className="text-meta text-muted" style={fitWords(t(`level.${ageToLevel(p.age)}.name`), 'min(0.8125rem, 3.5vw)', 0.6)}>
                      {t('age.years', { n: p.age })} · {t(`level.${ageToLevel(p.age)}.name`)}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 wide:w-full">
                      <Meter value={earned} max={visible.length} tint={i % 3 === 2 ? 'tint-coral' : i % 3 === 1 ? 'tint-sky' : 'tint-gold'} className="min-w-[4rem] flex-1" />
                      <span className="text-meta shrink-0 text-muted">{t('profile.badges', { n: earned, total: visible.length })}</span>
                    </span>
                  </span>

                  {/* The way in: a satin coral pill on the computer, a round puck on the phone. */}
                  <span
                    className={`btn-satin edge-light grid size-[max(2.75rem,var(--tap))] shrink-0 place-items-center rounded-full wide:mt-auto wide:flex wide:justify-center wide:min-h-[var(--tap)] wide:w-full wide:gap-1.5 wide:text-xl wide:font-black ${active ? 'tint-green text-white' : 'tint-coral text-coral-ink'}`}
                    aria-hidden="true"
                  >
                    <span className="hidden wide:inline">{t('profile.go')}</span>
                    <Icon name="play" width="1.1em" height="1.1em" />
                  </span>
                </button>
              </m.li>
            )
          })}
        </m.ul>
        <Link to="/parents" className="tap press mx-auto flex items-center justify-center rounded-full px-4 py-2 text-center text-sm font-semibold text-muted underline">
          {t('profile.whoHint')}
        </Link>
      </div>
    </Screen>
  )
}
