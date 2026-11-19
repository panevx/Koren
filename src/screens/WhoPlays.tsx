import { earnedCount } from '../content/badges'
import { Link, useNavigate } from 'react-router'
import { ProfileAvatar, useProfileName } from '../components/ProfileAvatar'
import { Screen, TopBar } from '../components/ui'
import { MISSIONS } from '../content/missions'
import { forLevel } from '../content/forLevel'
import { ageToLevel } from '../theme/levels'
import { useT } from '../i18n/useT'
import { m, rise, stagger } from '../motion'
import { useProfiles } from '../store/profiles'

/** A different colour behind each child's sign. */
const TINTS = ['bg-gold', 'bg-sky', 'bg-coral']

/** "Who is playing?" — children switch between their own profiles. Adding or deleting needs a parent. */
export function WhoPlays() {
  const t = useT()
  const navigate = useNavigate()
  const name = useProfileName()
  const { profiles, activeId, setActive } = useProfiles()
  return (
    <Screen>
      <TopBar title={t('profile.who')} />
      <div className="flex flex-col gap-4 px-4 pb-8">
        <m.ul variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-4">
          {profiles.map((p, i) => (
            <m.li key={p.id} variants={rise}>
              <button
                type="button"
                onClick={() => {
                  setActive(p.id)
                  navigate('/home')
                }}
                aria-pressed={p.id === activeId}
                className={`tap lift mat-paper edge-light flex w-full items-center gap-4 rounded-full p-2 pr-5 text-left ${
                  p.id === activeId ? 'outline-[3px] outline-offset-[3px] outline-green' : ''
                }`}
              >
                <span className={`grid size-[min(4.5rem,18vw)] shrink-0 place-items-center rounded-full shadow-[inset_0_-3px_6px_rgb(52_44_24/0.12),inset_0_2px_1px_rgb(255_255_255/0.8),0_1px_2px_rgb(52_44_24/0.14),0_8px_14px_-6px_rgb(52_44_24/0.28)] ${TINTS[i % TINTS.length]}`}>
                  <ProfileAvatar avatar={p.avatar} className="size-[82%] shadow-none" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-xl leading-tight font-black">{name(p, i)}</span>
                  {p.id === activeId && (
                    <span className="self-start rounded-full bg-green-dark px-2.5 py-0.5 text-xs font-black text-white uppercase shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_1px_1px_rgb(10_82_48/0.3)]">
                      {t('profile.playing')}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-muted">
                    {t('age.years', { n: p.age })} · {t('profile.badges', { n: earnedCount(p.badges, forLevel(MISSIONS, ageToLevel(p.age))), total: forLevel(MISSIONS, ageToLevel(p.age)).length })}
                  </span>
                </span>
              </button>
            </m.li>
          ))}
        </m.ul>
        <Link to="/parents" className="tap press mt-2 flex items-center justify-center rounded-full px-4 py-2 text-center text-sm font-semibold text-muted underline">
          {t('profile.whoHint')}
        </Link>
      </div>
    </Screen>
  )
}
