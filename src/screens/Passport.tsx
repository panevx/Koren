import { Link } from 'react-router'
import { BadgeArt } from '../components/BadgeArt'
import { img } from '../components/Brand'
import { Icon } from '../components/Icon'
import { ProfileAvatar, useProfileName } from '../components/ProfileAvatar'
import { Screen, TopBar } from '../components/ui'
import { MISSIONS } from '../content/missions'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { bouncy, m, stagger } from '../motion'
import { activeProfile, useProfiles } from '../store/profiles'

/** "Traveller's passport": every badge — earned ones as gold medals, the rest as empty places. */
export function Passport() {
  const t = useT()
  const l = useLocalized()
  const name = useProfileName()
  const profiles = useProfiles((s) => s.profiles)
  const profile = useProfiles(activeProfile)
  const index = profiles.findIndex((p) => p.id === profile.id)
  const earned = MISSIONS.filter((mission) => profile.badges.includes(mission.badge.id))
  const total = MISSIONS.length

  return (
    <Screen nav>
      <TopBar title={t('passport.title')} />
      <div className="flex flex-col gap-5 px-4 pb-32">
        {/* The passport cover */}
        <section className="relative overflow-hidden rounded-[2rem] bg-green-dark p-5 text-white shadow-float">
          <span className="absolute -top-16 -right-12 size-48 rounded-full bg-green" aria-hidden="true" />
          <span className="absolute -bottom-20 -left-10 size-44 rounded-full bg-green/60" aria-hidden="true" />
          <div className="relative flex items-center gap-3">
            <span className="grid size-[min(4.5rem,18vw)] shrink-0 place-items-center rounded-full bg-gold shadow-[inset_0_3px_0_rgb(255_255_255/0.5),0_5px_0_var(--color-gold-deep)]">
              <ProfileAvatar avatar={profile.avatar} className="size-[82%] shadow-none" />
            </span>
            <div className="min-w-0 flex-1">
              <img src={img('logo/koren-white.svg')} alt="" className="mb-1.5 h-6 w-auto" />
              <p className="text-[length:min(1.5rem,6vw)] leading-tight font-black">{name(profile, index)}</p>
            </div>
          </div>
          <div className="relative mt-4">
            <p className="mb-1.5 text-sm font-bold">{t('passport.count', { n: earned.length, total })}</p>
            <div className="h-3.5 overflow-hidden rounded-full bg-white/25" aria-hidden="true">
              <div className="h-full rounded-full bg-gold" style={{ width: `${total ? (earned.length / total) * 100 : 0}%` }} />
            </div>
          </div>
        </section>

        {earned.length === 0 && <p className="text-center font-bold text-muted">{t('passport.empty')}</p>}

        {/* Medals stand directly on the page — no boxes around them. */}
        <m.ul variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-x-3 gap-y-6">
          {MISSIONS.map((mission, i) => {
            const has = profile.badges.includes(mission.badge.id)
            return (
              <m.li key={mission.id} variants={{ hidden: { opacity: 0, scale: 0.6 }, show: { opacity: 1, scale: 1, transition: bouncy } }}>
                <Link
                  to={`/mission/${mission.id}`}
                  className="press flex h-full flex-col items-center gap-2 rounded-[2rem] px-1 text-center"
                >
                  <BadgeArt icon={mission.badge.icon} earned={has} lazy={i >= 4} className={`size-[min(6.75rem,28vw)] ${has ? 'pop-3d' : ''}`} />
                  <span className="text-sm leading-tight font-extrabold">{l(mission.title)}</span>
                  <span className={`flex items-center gap-1 text-xs font-bold ${has ? 'text-green-dark' : 'text-muted'}`}>
                    {has && <Icon name="check" width="1em" height="1em" />}
                    {has ? t('passport.earned') : t('passport.locked')}
                  </span>
                </Link>
              </m.li>
            )
          })}
        </m.ul>
      </div>
    </Screen>
  )
}
