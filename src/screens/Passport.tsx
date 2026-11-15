import { Link } from 'react-router'
import { BadgeArt } from '../components/BadgeArt'
import { img } from '../components/Brand'
import { ProgressBar } from '../components/ds'
import { Icon } from '../components/Icon'
import { ProfileAvatar, useProfileName } from '../components/ProfileAvatar'
import { Screen, TopBar } from '../components/ui'
import { MILESTONES, milestoneNeed, type MilestoneId } from '../content/progress'
import type { Mission } from '../content/schema'
import { useChildMissions } from '../content/useChildMissions'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { bouncy, m, stagger } from '../motion'
import { activeProfile, useProfiles } from '../store/profiles'
import { ART } from '../world'

const REWARD_ART: Record<MilestoneId, string> = { bronze: ART.bronze, silver: ART.silver, gold: ART.gold, trophy: ART.trophy }

/**
 * "Traveller's passport" — a collection to be proud of:
 * - the cover: the child's sign, name and three numbers (badges, medals, places);
 * - the reward track: bronze → silver → gold → cup on one line that fills up;
 * - earned badges, big and stamped; then the ones still to discover, smaller and faded.
 * On a computer the cover and the track stay on the left, the badges fill the right.
 */
export function Passport() {
  const t = useT()
  const name = useProfileName()
  const profiles = useProfiles((s) => s.profiles)
  const profile = useProfiles(activeProfile)
  const index = profiles.findIndex((p) => p.id === profile.id)
  const MISSIONS = useChildMissions()
  const earned = MISSIONS.filter((mission) => profile.badges.includes(mission.badge.id))
  const missing = MISSIONS.filter((mission) => !profile.badges.includes(mission.badge.id))
  const total = MISSIONS.length
  const medals = MILESTONES.filter(({ id }) => earned.length >= milestoneNeed(id, MISSIONS)).length
  const places = new Set(MISSIONS.filter((x) => profile.done[x.id] && x.place).map((x) => x.place)).size

  return (
    <Screen nav wide>
      <TopBar title={t('passport.title')} />
      <div className="flex flex-col gap-5 px-4 pb-32 short:pb-8 wide:grid wide:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] wide:items-start wide:gap-8 wide:pb-10">
        <div className="flex flex-col gap-5 wide:sticky wide:top-4">
          {/* The passport cover */}
          <section className="bg-stage-night relative overflow-hidden rounded-[var(--radius-stage)] p-5 text-white shadow-stage">
            <span className="absolute -top-16 -right-12 size-48 rounded-full bg-white/10" aria-hidden="true" />
            <img src={img('ornaments/right.png')} alt="" className="kid-deco absolute right-4 bottom-4 size-10 opacity-40" />
            <div className="relative flex items-center gap-3">
              <span className="grid size-[min(4.5rem,18vw)] shrink-0 place-items-center rounded-full bg-gold shadow-[inset_0_3px_0_rgb(255_255_255/0.5),0_5px_0_var(--color-gold-deep)]">
                <ProfileAvatar avatar={profile.avatar} className="size-[82%] shadow-none" />
              </span>
              <div className="min-w-0 flex-1">
                <img src={img('logo/koren-white.svg')} alt="" className="mb-1.5 h-6 w-auto" />
                <p className="text-title">{name(profile, index)}</p>
              </div>
            </div>
            <dl className="relative mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { n: earned.length, label: t('passport.stat.badges'), art: ART.stamp },
                { n: medals, label: t('passport.stat.rewards'), art: ART.gold },
                { n: places, label: t('passport.stat.places'), art: ART.gemBlue },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center rounded-[1.25rem] bg-white/10 px-1 py-2">
                  <img src={img(s.art)} alt="" className="pop-3d size-8 object-contain" />
                  <dt className="order-last text-xs font-bold text-white/85">{s.label}</dt>
                  <dd className="text-2xl leading-none font-black">{s.n}</dd>
                </div>
              ))}
            </dl>
            <div className="relative mt-4">
              <p className="mb-1.5 text-sm font-bold">{t('passport.count', { n: earned.length, total })}</p>
              <ProgressBar value={earned.length} max={total} tone="gold" track="bg-white/20" height="h-3.5" />
            </div>
          </section>

          {/* The reward track: one line, four medals. */}
          <section aria-labelledby="rewards" className="rounded-[var(--radius-card)] bg-white p-4 shadow-soft">
            <h2 id="rewards" className="mb-3 text-lg font-black">
              {t('reward.title')}
            </h2>
            <div className="relative">
              <span className="absolute inset-x-[12.5%] top-[min(1.75rem,7.5vw)] h-2 overflow-hidden rounded-full bg-sand" aria-hidden="true">
                <m.span
                  className="block h-full origin-left rounded-full bg-gold"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: medals <= 1 ? 0 : (medals - 1) / (MILESTONES.length - 1) }}
                  transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.3 }}
                />
              </span>
              <ul className="relative grid grid-cols-4 gap-2">
                {MILESTONES.map(({ id }, i) => {
                  const need = milestoneNeed(id, MISSIONS)
                  const got = earned.length >= need
                  return (
                    <li key={id} className="flex flex-col items-center gap-1 text-center [container-type:inline-size]">
                      <m.span
                        initial={got ? { scale: 0.4, rotate: -20 } : false}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ ...bouncy, delay: 0.3 + i * 0.12 }}
                        className={`grid size-[min(3.5rem,15vw)] place-items-center rounded-full ${got ? 'bg-gold-soft ring-[3px] ring-gold' : 'bg-cream ring-2 ring-sand'}`}
                      >
                        <img src={img(REWARD_ART[id])} alt={t(`reward.${id}`)} className={`size-[86%] object-contain ${got ? 'pop-3d' : 'opacity-40 grayscale'}`} />
                      </m.span>
                      <span className={`text-[length:clamp(0.6rem,13cqw,0.8rem)] leading-tight font-extrabold ${got ? 'text-green-dark' : 'text-muted'}`}>
                        {got ? t(`reward.${id}.name`) : t('reward.need', { n: need - earned.length })}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-5">
          {earned.length === 0 ? (
            <p className="rounded-[var(--radius-card)] bg-gold-soft p-4 text-center font-bold">{t('passport.empty')}</p>
          ) : (
            <section aria-labelledby="earned" className="flex flex-col gap-3">
              <h2 id="earned" className="text-title px-1">
                {t('passport.earnedTitle')}
              </h2>
              <m.ul variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-x-3 gap-y-5 wide:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]">
                {earned.map((mission, i) => (
                  <BadgeItem key={mission.id} mission={mission} has i={i} />
                ))}
              </m.ul>
            </section>
          )}

          {missing.length > 0 && (
            <section aria-labelledby="to-find" className="flex flex-col gap-3">
              <h2 id="to-find" className="text-title px-1">
                {t('passport.toFind')}
              </h2>
              <ul className="grid grid-cols-3 gap-x-2 gap-y-4 wide:grid-cols-[repeat(auto-fill,minmax(7rem,1fr))]">
                {missing.map((mission, i) => (
                  <BadgeItem key={mission.id} mission={mission} has={false} i={i} />
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </Screen>
  )
}

/** One badge: earned = big, golden, stamped; not yet = small and faded. Both open their mission. */
function BadgeItem({ mission, has, i }: { mission: Mission; has: boolean; i: number }) {
  const t = useT()
  const l = useLocalized()
  const body = (
    <Link to={`/mission/${mission.id}`} className="press flex h-full flex-col items-center gap-1.5 rounded-[2rem] px-1 text-center">
      <span className="relative">
        <BadgeArt
          icon={mission.badge.icon}
          earned={has}
          lazy={i >= 4}
          className={has ? 'pop-3d size-[min(6.75rem,28vw)] wide:size-28' : 'size-[min(4.75rem,20vw)] opacity-80 wide:size-20'}
        />
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
      <span className={`leading-tight font-extrabold ${has ? 'text-sm' : 'text-xs text-muted'}`}>{l(mission.title)}</span>
      <span className={`flex items-center gap-1 text-xs font-bold ${has ? 'text-green-dark' : 'sr-only'}`}>
        {has && <Icon name="check" width="1em" height="1em" />}
        {has ? t('passport.earned') : t('passport.locked')}
      </span>
    </Link>
  )
  return has ? (
    <m.li variants={{ hidden: { opacity: 0, scale: 0.6 }, show: { opacity: 1, scale: 1, transition: bouncy } }}>{body}</m.li>
  ) : (
    <li>{body}</li>
  )
}
