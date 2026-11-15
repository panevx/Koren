import { Link } from 'react-router'
import { BadgeArt } from '../components/BadgeArt'
import { MILESTONES, milestoneNeed, type MilestoneId } from '../content/progress'
import { ART } from '../world'
import { img } from '../components/Brand'
import { Icon } from '../components/Icon'
import { ProfileAvatar, useProfileName } from '../components/ProfileAvatar'
import { Screen, TopBar } from '../components/ui'
import { useChildMissions } from '../content/useChildMissions'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { bouncy, m, stagger } from '../motion'
import { activeProfile, useProfiles } from '../store/profiles'

/** "Traveller's passport": every badge — earned ones as gold medals, the rest as empty places. */
const REWARD_ART: Record<MilestoneId, string> = { bronze: ART.bronze, silver: ART.silver, gold: ART.gold, trophy: ART.trophy }

export function Passport() {
  const t = useT()
  const l = useLocalized()
  const name = useProfileName()
  const profiles = useProfiles((s) => s.profiles)
  const profile = useProfiles(activeProfile)
  const index = profiles.findIndex((p) => p.id === profile.id)
  const MISSIONS = useChildMissions()
  const earned = MISSIONS.filter((mission) => profile.badges.includes(mission.badge.id))
  const total = MISSIONS.length

  return (
    <Screen nav>
      <TopBar title={t('passport.title')} />
      <div className="flex flex-col gap-5 px-4 pb-32 short:pb-8 wide:pb-10">
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

        {/* Rewards for collecting badges: bronze, silver, gold, and the cup for all of them. */}
        <section aria-labelledby="rewards" className="rounded-[2rem] bg-white p-4 shadow-soft">
          <h2 id="rewards" className="mb-2 text-lg font-black">{t('reward.title')}</h2>
          <ul className="grid grid-cols-4 gap-2">
            {MILESTONES.map(({ id }) => {
              const need = milestoneNeed(id, MISSIONS)
              const got = earned.length >= need
              return (
                <li key={id} className="flex flex-col items-center gap-1 text-center [container-type:inline-size]">
                  <img src={img(REWARD_ART[id])} alt={t(`reward.${id}`)} className={`size-[min(4rem,17vw)] object-contain ${got ? 'pop-3d' : 'opacity-35 grayscale'}`} />
                  <span className={`text-[length:clamp(0.6rem,13cqw,0.8rem)] leading-tight font-extrabold ${got ? 'text-green-dark' : 'text-muted'}`}>
                    {got ? t(`reward.${id}.name`) : t('reward.need', { n: need - earned.length })}
                  </span>
                </li>
              )
            })}
          </ul>
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
                  <span className="relative">
                    <BadgeArt icon={mission.badge.icon} earned={has} lazy={i >= 4} className={`size-[min(6.75rem,28vw)] ${has ? 'pop-3d' : ''}`} />
                    {/* The passport stamp lands on each earned badge. */}
                    {has && (
                      <m.img
                        src={img(ART.stamp)}
                        alt=""
                        initial={{ scale: 2.2, opacity: 0, rotate: -30 }}
                        animate={{ scale: 1, opacity: 1, rotate: -12 }}
                        transition={{ ...bouncy, delay: 0.25 + i * 0.05 }}
                        className="absolute -right-2 -bottom-1 size-[38%]"
                      />
                    )}
                  </span>
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
