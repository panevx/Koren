import { Link } from 'react-router'
import { BottomNav } from '../components/BottomNav'
import { img } from '../components/Brand'
import { Icon } from '../components/Icon'
import { ProfileAvatar, useProfileName } from '../components/ProfileAvatar'
import { Screen, TopBar } from '../components/ui'
import { MISSIONS } from '../content/missions'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { useProfiles, activeProfile } from '../store/profiles'

/** "Traveller's passport": every badge — earned ones in colour, the rest grey, each a way into its mission. */
export function Passport() {
  const t = useT()
  const l = useLocalized()
  const name = useProfileName()
  const profiles = useProfiles((s) => s.profiles)
  const profile = useProfiles(activeProfile)
  const index = profiles.findIndex((p) => p.id === profile.id)
  const earned = MISSIONS.filter((m) => profile.badges.includes(m.badge.id))
  const total = MISSIONS.length

  return (
    <Screen>
      <TopBar title={t('passport.title')} />
      <div className="flex flex-col gap-4 px-4 pb-28">
        <section className="rounded-level relative overflow-hidden bg-green p-4 text-white shadow-md">
          <div className="flex items-center gap-3">
            <ProfileAvatar avatar={profile.avatar} className="size-[min(4rem,15vw)]" />
            <p className="min-w-0 flex-1 text-xs font-black tracking-wide text-gold uppercase">{t('passport.title')}</p>
            <img src={img('logo/koren-white.svg')} alt="" className="h-[min(2.5rem,8vw)] w-auto shrink-0 opacity-90" />
          </div>
          <p className="mt-2 text-2xl leading-tight font-black">{name(profile, index)}</p>
          <div className="mt-2">
            <p className="mb-1 text-sm font-bold">{t('passport.count', { n: earned.length, total })}</p>
            <div className="h-3 overflow-hidden rounded-full bg-white/25" aria-hidden="true">
              <div className="h-full rounded-full bg-gold" style={{ width: `${total ? (earned.length / total) * 100 : 0}%` }} />
            </div>
          </div>
        </section>

        {earned.length === 0 && <p className="text-center font-bold text-muted">{t('passport.empty')}</p>}

        <ul className="grid grid-cols-2 gap-3">
          {MISSIONS.map((m) => {
            const has = profile.badges.includes(m.badge.id)
            return (
              <li key={m.id}>
                <Link
                  to={`/mission/${m.id}`}
                  className="rounded-level flex h-full flex-col items-center gap-2 border-2 border-sand bg-white p-3 text-center shadow-sm hover:border-green"
                  aria-label={`${l(m.title)} – ${has ? t('passport.earned') : t('passport.locked')}`}
                >
                  <span
                    className={`grid size-[min(6rem,26vw)] place-items-center rounded-full p-1.5 ${has ? 'bg-gold shadow-[0_4px_0_#d49a00]' : 'bg-sand'}`}
                  >
                    <span className="grid size-full place-items-center rounded-full border-4 border-white bg-cream">
                      <img src={img(m.badge.icon)} alt="" className={`size-[60%] object-contain ${has ? '' : 'opacity-40 grayscale'}`} />
                    </span>
                  </span>
                  <span className="text-sm leading-tight font-extrabold">{l(m.title)}</span>
                  <span className={`flex items-center gap-1 text-xs font-bold ${has ? 'text-green' : 'text-muted'}`}>
                    {has && <Icon name="check" width="1em" height="1em" />}
                    {has ? t('passport.earned') : t('passport.locked')}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
      <BottomNav />
    </Screen>
  )
}
