import { Link, useNavigate } from 'react-router'
import { ProfileAvatar, useProfileName } from '../components/ProfileAvatar'
import { Screen, TopBar } from '../components/ui'
import { MISSIONS } from '../content/missions'
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
                className={`tap press flex w-full items-center gap-4 rounded-full bg-white p-2 pr-5 text-left ${
                  p.id === activeId ? 'shadow-float ring-4 ring-green' : 'shadow-soft'
                }`}
              >
                <span className={`grid size-[min(4.5rem,18vw)] shrink-0 place-items-center rounded-full ${TINTS[i % TINTS.length]}`}>
                  <ProfileAvatar avatar={p.avatar} className="size-[82%] shadow-none" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-xl leading-tight font-black">{name(p, i)}</span>
                  {p.id === activeId && (
                    <span className="self-start rounded-full bg-green-soft px-2.5 py-0.5 text-xs font-black text-green-dark uppercase">
                      {t('profile.playing')}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-muted">
                    {t('age.years', { n: p.age })} · {t('profile.badges', { n: p.badges.length, total: MISSIONS.length })}
                  </span>
                </span>
              </button>
            </m.li>
          ))}
        </m.ul>
        <Link to="/parents" className="mt-2 text-center text-sm font-semibold text-muted underline">
          {t('profile.whoHint')}
        </Link>
      </div>
    </Screen>
  )
}
