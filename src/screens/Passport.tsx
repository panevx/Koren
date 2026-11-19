import { Link } from 'react-router'
import { BadgeArt } from '../components/BadgeArt'
import { img } from '../components/Brand'
import { ProgressBar } from '../components/ds'
import { Icon } from '../components/Icon'
import { ProfileAvatar, useProfileName } from '../components/ProfileAvatar'
import { Screen, TopBar } from '../components/ui'
import { MILESTONES, milestoneNeed, type MilestoneId } from '../content/progress'
import { wallet } from '../content/rewards'
import type { Mission } from '../content/schema'
import { MISSIONS as ALL_MISSIONS } from '../content/missions'
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
      <div className="flex flex-col gap-5 px-4 pb-32 short:pb-8 wide:grid wide:grid-cols-[minmax(0,min(19rem,50%))_minmax(0,1fr)] wide:items-start wide:gap-8 wide:pb-10">
        <div className="flex flex-col gap-5 wide:sticky wide:top-4">
          {/* The passport cover */}
          {/* v0.26: a real passport — green leather with a spine on the left, a stitched seam, gold foil, recessed fields */}
          <section className="leather relative overflow-hidden rounded-[var(--radius-stage)] p-5 pl-7 text-white">
            <span className="leather-spine" aria-hidden="true" />
            <span className="leather-stitch" aria-hidden="true" />
            <img src={img("ornaments/right.png")} alt="" className="kid-deco absolute top-4 right-4 size-9 opacity-40" />
            <div className="relative flex items-center gap-3">
              <span className="mat-ceramic-gold grid size-[min(4.5rem,18vw)] shrink-0 place-items-center">
                <ProfileAvatar avatar={profile.avatar} outfit={profile.outfit} className="size-[82%] shadow-none" />
              </span>
              <div className="min-w-0 flex-1 [container-type:inline-size]">
                <img src={img('logo/koren-white.svg')} alt="" className="foil mb-1.5 h-6 w-auto" />
                <p className="text-title text-[length:min(1.5rem,6.4vw,13cqw)]">{name(profile, index)}</p>
              </div>
            </div>
            <dl className="relative mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { n: earned.length, label: t('passport.stat.badges'), art: ART.stamp },
                { n: medals, label: t('passport.stat.rewards'), art: ART.gold },
                { n: places, label: t('passport.stat.places'), art: ART.gemBlue },
              ].map((s) => (
                <div key={s.label} className="well-on-tint flex flex-col items-center rounded-[1.25rem] px-1 py-2 [container-type:inline-size]">
                  <img src={img(s.art)} alt="" className="pop-3d size-8 object-contain" />
                  <dt className="order-last text-[length:clamp(0.6rem,13cqw,0.75rem)] font-bold text-white/85">{s.label}</dt>
                  <dd className="text-2xl leading-none font-black">{s.n}</dd>
                </div>
              ))}
            </dl>
            <div className="relative mt-4">
              <p className="mb-1.5 text-sm font-bold">{t('passport.count', { n: earned.length, total })}</p>
              <ProgressBar value={earned.length} max={total} tone="gold" track="well-on-tint" height="h-3" />
            </div>
          </section>

          {/* v0.22: the fair stall — coins, days of adventure, folk costume for the sign */}
          <Link to="/shop" className="edge-light relative press tap flex items-center gap-2 rounded-[var(--radius-card)] mat-paper px-3 py-3 font-extrabold text-ink">
            <img src={img(ART.coins)} alt="" className="pop-3d size-[min(3rem,12vw)] shrink-0" />
            <span className="min-w-0 flex-1 leading-tight [container-type:inline-size]">
              <span className="block text-[length:min(1.125rem,5vw,16cqw)]">{t('shop.title')}</span>
            </span>
            <span className="flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 text-sm">
              <img src={img(ART.coin)} alt="" className="size-5" />
              {wallet(profile, ALL_MISSIONS).coins}
            </span>
          </Link>

          {/* v0.21: the Hall of Fame — people the child meets in the missions */}
          <Link to="/fame" className="press tap flex items-center gap-3 rounded-[var(--radius-card)] bg-stage-gold px-4 py-3 font-extrabold text-ink shadow-soft">
            <img src={img(ART.trophy)} alt="" className="pop-3d size-12 shrink-0" />
            <span className="min-w-0 flex-1 text-lg leading-tight">{t('fame.title')}</span>
            <Icon name="chevron" width="1em" height="1em" />
          </Link>

          {/* The reward track: one line, four medals. */}
          {/* No missions in this build yet: no medal track (it would say "0 of 0"). */}
          {MISSIONS.length > 0 && (
          <section aria-labelledby="rewards" className="edge-light relative rounded-[var(--radius-card)] mat-paper p-4">
            <h2 id="rewards" className="mb-3 text-lg font-black">
              {t('reward.title')}
            </h2>
            <div className="relative">
              <span className="well absolute inset-x-[12.5%] top-[min(1.75rem,7.5vw)] h-2 overflow-hidden rounded-full" aria-hidden="true">
                <m.span
                  className="fill-satin tint-gold block h-full origin-left rounded-full"
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
                        className={`grid size-[min(3.5rem,15vw)] place-items-center rounded-full ${got ? 'mat-ceramic-gold' : 'well'}`}
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
          )}
        </div>

        <div className="flex flex-col gap-5">
          {earned.length === 0 ? (
            <p className="fill-satin tint-gold edge-light rounded-[var(--radius-card)] p-4 text-center font-bold">{MISSIONS.length ? t('passport.empty') : t('empty.text')}</p>
          ) : (
            <section aria-labelledby="earned" className="flex flex-col gap-3">
              <h2 id="earned" className="text-headline px-1">
                {t('passport.earnedTitle')}
              </h2>
              <m.ul variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-x-3 gap-y-5 wide:grid-cols-[repeat(auto-fill,minmax(min(9rem,100%),1fr))]">
                {earned.map((mission, i) => (
                  <BadgeItem key={mission.id} mission={mission} has i={i} />
                ))}
              </m.ul>
            </section>
          )}

          {missing.length > 0 && (
            <section aria-labelledby="to-find" className="flex flex-col gap-3">
              <h2 id="to-find" className="text-headline px-1">
                {t('passport.toFind')}
              </h2>
              <ul className="grid grid-cols-3 gap-x-2 gap-y-4 wide:grid-cols-[repeat(auto-fill,minmax(min(7rem,100%),1fr))]">
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
    <Link to={`/mission/${mission.id}`} className="press flex h-full flex-col items-center gap-1.5 rounded-[2rem] px-1 text-center [container-type:inline-size]">
      {/* earned: the badge stands proud with its stamp; not yet: an empty socket pressed into the page */}
      <span className={`relative ${has ? '' : 'well rounded-full p-[6%]'}`}>
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
      <span className={`w-full leading-tight font-extrabold ${has ? 'text-[length:clamp(0.5rem,10.5cqw,0.875rem)]' : 'text-[length:clamp(0.42rem,10.5cqw,0.75rem)] text-muted'}`}>{l(mission.title)}</span>
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
