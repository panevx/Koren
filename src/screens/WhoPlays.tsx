import { Link, useNavigate } from 'react-router'
import { ProfileAvatar, useProfileName } from '../components/ProfileAvatar'
import { Screen, TopBar } from '../components/ui'
import { MISSIONS } from '../content/missions'
import { useT } from '../i18n/useT'
import { useProfiles } from '../store/profiles'

/** "Who is playing?" — children switch between their own profiles. Adding or deleting needs a parent. */
export function WhoPlays() {
  const t = useT()
  const navigate = useNavigate()
  const name = useProfileName()
  const { profiles, activeId, setActive } = useProfiles()
  return (
    <Screen>
      <TopBar title={t('profile.who')} />
      <div className="flex flex-col gap-3 px-4 pb-8">
        <ul className="flex flex-col gap-3">
          {profiles.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  setActive(p.id)
                  navigate('/home')
                }}
                aria-pressed={p.id === activeId}
                className={`tap rounded-level flex w-full items-center gap-4 border-[3px] bg-white p-3 text-left shadow-sm ${
                  p.id === activeId ? 'border-green' : 'border-sand hover:border-green'
                }`}
              >
                <ProfileAvatar avatar={p.avatar} className="size-[min(4rem,16vw)]" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-xl font-black">{name(p, i)}</span>
                  {p.id === activeId && <span className="text-xs font-black text-green uppercase">{t('profile.playing')}</span>}
                  <span className="text-sm font-semibold text-muted">
                    {t('age.years', { n: p.age })} · {t('profile.badges', { n: p.badges.length, total: MISSIONS.length })}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <Link to="/parents" className="mt-2 text-center text-sm font-semibold text-muted underline">
          {t('profile.whoHint')}
        </Link>
      </div>
    </Screen>
  )
}
