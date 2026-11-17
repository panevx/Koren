import { useMemo } from 'react'
import { fitWords } from '../components/fit'
import { Link } from 'react-router'
import { BadgeArt } from '../components/BadgeArt'
import { HeroFigure, img, Logo, Scenery } from '../components/Brand'
import { ProgressBar } from '../components/ds'
import { Icon } from '../components/Icon'
import { ProfileAvatar, useProfileName } from '../components/ProfileAvatar'
import { SectionIcon } from '../components/SectionIcon'
import { UpdateBanner } from '../components/UpdateBanner'
import { Button, Screen, roundButton, useTitle } from '../components/ui'
import { earnedCount } from '../content/badges'
import { forLevel } from '../content/forLevel'
import { byPathOrder, chapterOf } from '../content/pathOrder'
import type { Subject } from '../content/schema'
import type { MissionSummary } from '../content/missionSummary'
import { useLocalized } from '../content/useLocalized'
import { useMissions } from '../content/useMissions'
import { useProgress, useUnlockAll } from '../content/useProgress'
import type { TKey } from '../i18n'
import { useT } from '../i18n/useT'
import { bouncy, m, settle, stagger } from '../motion'
import { sectionById, type SectionId } from '../sections'
import { activeProfile, useProfiles } from '../store/profiles'
import { ageToLevel } from '../theme/levels'
import { ART } from '../world'

/** Rewards in the order they are won (same thresholds as src/content/progress.ts → MILESTONES, without loading it). */
const REWARDS: readonly { id: 'bronze' | 'silver' | 'gold' | 'trophy'; need: number | 'all'; art: string }[] = [
  { id: 'bronze', need: 3, art: ART.bronze },
  { id: 'silver', need: 6, art: ART.silver },
  { id: 'gold', need: 10, art: ART.gold },
  { id: 'trophy', need: 'all', art: ART.trophy },
]

/** The worlds of the hub: each its own colour, picture and the subject whose missions it counts. */
const WORLDS: readonly { id: SectionId; subject: Subject; stage: string; ink: string }[] = [
  { id: 'discover', subject: 'geography', stage: 'bg-stage-sky', ink: 'text-ink' },
  { id: 'history', subject: 'history', stage: 'bg-stage-gold', ink: 'text-ink' },
  { id: 'culture', subject: 'culture', stage: 'bg-stage-coral', ink: 'text-coral-ink' },
  { id: 'language', subject: 'language', stage: 'bg-white', ink: 'text-green-dark' },
]

/**
 * The hub — the first thing a child sees each day, so it is a scene, not a menu:
 * 1. Koren and Raya greet the child in front of the hills.
 * 2. The adventure card: the next stop with its picture, its chapter and one big "Continue" button.
 * 3. The next reward and how close it is.
 * 4. The worlds to explore, each with its own colour and progress.
 * Navigation (map, path, passport) lives in the navigation bar — the hub does not repeat it.
 * On a computer the scene and the adventure stand on the left, rewards and worlds on the right.
 */
export function Home() {
  const t = useT()
  const profiles = useProfiles((s) => s.profiles)
  const profile = useProfiles(activeProfile)
  const name = useProfileName()
  const level = ageToLevel(profile.age)
  const { missions: all, failed } = useMissions()
  // Missions for 4–6 year olds only appear for them.
  const missions = useMemo(() => (all ? forLevel(all, level) : null), [all, level])
  useTitle(t('nav.home'))
  const progress = useProgress(missions)
  const testing = useUnlockAll()
  const next = missions ? progress.next(byPathOrder(missions)) : undefined
  const played = missions?.filter((mission) => profile.done[mission.id]).length ?? 0
  const badges = missions ? earnedCount(profile.badges, missions) : 0

  return (
    <Screen nav wide>
      <h1 className="sr-only">{t('nav.home')}</h1>

      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <Link
          to="/who"
          className="tap press flex max-w-[70%] min-w-0 items-center gap-2 rounded-full bg-white py-1 pr-4 pl-1 shadow-soft"
          aria-label={`${t('profile.who')} ${name(profile, profiles.indexOf(profile))}`}
        >
          <ProfileAvatar avatar={profile.avatar} outfit={profile.outfit} className="size-11 bg-green-soft shadow-none" />
          <span className="truncate font-extrabold">{name(profile, profiles.indexOf(profile))}</span>
        </Link>
        <Link to="/parents" className={roundButton} aria-label={t('parents.title')}>
          <Icon name="gear" />
        </Link>
      </div>

      <div className="px-4 pt-3 empty:hidden">
        <UpdateBanner />
      </div>

      <div className="px-4 pb-32 short:pb-8 wide:grid wide:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] wide:items-start wide:gap-6 wide:pb-10">
        <div>
          {/* 1. Koren and Raya greet the child. */}
          <section className="relative mt-3 flow-root min-h-[min(12.5rem,54vw)] pb-4 short:min-h-[11rem] wide:min-h-[15rem]">
            <Scenery castle={false} className="absolute inset-0 rounded-[var(--radius-stage)] shadow-soft" />
            <div className="absolute top-3 left-3 rounded-full bg-white px-3.5 py-1.5 shadow-soft wide:hidden">
              <Logo size="sm" className="h-7" />
            </div>
            <m.p
              initial={{ opacity: 0, scale: 0.8, x: -12 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ ...bouncy, delay: 0.35 }}
              className="relative mt-[3.9rem] ml-3 w-max max-w-[52%] wide:mt-5 wide:max-w-[45%] origin-bottom-left rounded-[1.5rem] rounded-bl-md bg-white px-4 py-2.5 text-[length:min(1.0625rem,4.5vw)] leading-snug font-extrabold shadow-soft"
            >
              {t(`home.greeting.${level}`)}
            </m.p>
            <div className="absolute right-2 bottom-3 flex items-end" aria-hidden="true">
              <m.div initial={{ y: 36 }} animate={{ y: 0 }} transition={{ ...bouncy, delay: 0.1 }}>
                <HeroFigure hero="raya" className="anim-bob h-[min(8.25rem,33vw)] wide:h-[10.5rem]" />
              </m.div>
              <m.div initial={{ y: 36 }} animate={{ y: 0 }} transition={{ ...bouncy, delay: 0.2 }} className="-ml-3">
                <HeroFigure hero="koren" className="anim-bob-late h-[min(8.75rem,35vw)] wide:h-[11rem]" />
              </m.div>
            </div>
          </section>

          {/* 2. The adventure card. Its height is kept while the missions load, so nothing jumps. */}
          <div className="relative z-10 mt-3 min-h-[15rem]">
            {missions && (missions.length ? <AdventureCard next={next} missions={missions} done={profile.done} /> : <NoMissionsCard />)}
            {failed && (
              <div className="flex flex-col items-center gap-3 rounded-level bg-white p-5 text-center shadow-soft">
                <p role="status" className="font-bold">{t('home.loadFailed')}</p>
                <Button variant="accent" onClick={() => window.location.reload()}>{t('home.reload')}</Button>
              </div>
            )}
          </div>
          {/* Testers' switch on (demo build only): say so, so nobody forgets it before a presentation. */}
          {testing && (
            <Link to="/parents" className="mx-auto mt-3 block w-max max-w-full rounded-full bg-coral px-3 py-1 text-sm font-black text-coral-ink shadow-soft">
              {t('tester.chip')}
            </Link>
          )}

          {missions && missions.length > 0 && (
            <Link
              to="/missions"
              className="press mt-3 flex items-center gap-3 rounded-full bg-white py-1.5 pr-3 pl-2 shadow-soft"
            >
              <img src={img(ART.gemGreen)} alt="" className="pop-3d size-10 shrink-0 object-contain" />
              {/* The bar sits under the words (not beside them), so the title keeps the whole width on narrow phones. */}
              <span className="min-w-0 flex-1">
                <span className="block text-sm leading-tight font-black">{t('path.title')}</span>
                <span className="flex items-center gap-2">
                  <span className="shrink-0 text-xs font-bold text-muted">{t('missions.count', { done: played, total: missions.length })}</span>
                  <ProgressBar value={played} max={missions.length} height="h-2" className="min-w-8 flex-1" />
                </span>
              </span>
              <Icon name="chevron" className="shrink-0 text-muted" />
            </Link>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-5 wide:mt-3">
          {/* 3. The next reward. */}
          {missions && missions.length > 0 && <RewardStrip badges={badges} total={missions.length} />}

          {/* 4. Worlds to explore. */}
          <section aria-labelledby="worlds" className="flex flex-col gap-2.5">
            <h2 id="worlds" className="text-title px-1">
              {t('home.worlds')}
            </h2>
            <m.ul
              variants={stagger}
              initial="hidden"
              animate="show"
              className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pt-1 pb-3 [scrollbar-width:none] wide:mx-0 wide:grid wide:grid-cols-2 wide:overflow-visible wide:px-0"
            >
              {WORLDS.map((w) => (
                <m.li key={w.id} variants={settle} className="w-[min(10.5rem,42vw)] shrink-0 snap-start wide:w-auto">
                  <World world={w} missions={missions} done={profile.done} showDesc={level === 'guard'} />
                </m.li>
              ))}
            </m.ul>
          </section>
        </div>
      </div>
    </Screen>
  )
}

/**
 * No missions in this build yet (the families' build shows only missions a teacher has checked): say so honestly —
 * never "you played everything!" — and send the child to the map and the timeline, which work without missions.
 */
function NoMissionsCard() {
  const t = useT()
  return (
    <m.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={bouncy}>
      <Link to="/map" className="press bg-stage-green relative block overflow-hidden rounded-[var(--radius-stage)] p-4 pb-5 text-white shadow-stage">
        <span className="text-label inline-block rounded-full bg-green-deep/70 px-2.5 py-1 text-[length:min(0.75rem,3.2vw)] text-white">{t('empty.caption')}</span>
        <span className="text-title mt-1.5 block">{t('empty.title')}</span>
        <span className="mt-1.5 block text-sm leading-snug font-extrabold text-white/90">{t('empty.text')}</span>
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 font-black text-green-dark">
          {t('empty.map')}
          <Icon name="chevron" />
        </span>
      </Link>
    </m.div>
  )
}

/** The big card: what is next on the path, in which chapter, and one clear button. */
function AdventureCard({ next, missions, done }: { next: MissionSummary | undefined; missions: readonly MissionSummary[]; done: Record<string, unknown> }) {
  const t = useT()
  const l = useLocalized()
  const chapter = next ? chapterOf(next.id) : undefined
  // Chapter stops that this child can see (mini missions only for the youngest).
  const stops = chapter ? chapter.missions.filter((id) => missions.some((x) => x.id === id)) : []
  const doneInChapter = stops.filter((id) => done[id]).length

  return (
    <m.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={bouncy}>
      <Link
        to={next ? `/mission/${next.id}` : '/collection'}
        className="press bg-stage-green relative block overflow-hidden rounded-[var(--radius-stage)] p-4 pb-5 text-white shadow-stage"
      >
        <span className="kid-deco absolute -top-16 -right-12 size-44 rounded-full bg-white/10" aria-hidden="true" />
        <span className="kid-deco absolute -bottom-20 -left-14 size-48 rounded-full bg-black/10" aria-hidden="true" />

        <span className="relative flex items-center gap-3">
          {/* The picture of the stop on a glowing disc. */}
          <span className="relative grid size-[min(6.75rem,27vw)] shrink-0 place-items-center">
            <span className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_40%_35%,#fff6d0,#ffd35a_60%,#e2ab1e)] opacity-90 shadow-[0_0_0_6px_rgb(255_255_255/0.15)]" aria-hidden="true" />
            {next ? (
              <BadgeArt icon={next.badge.icon} className="anim-bob relative size-[86%]" />
            ) : (
              <img src={img(ART.trophy)} alt="" className="anim-bob pop-3d relative size-[86%] object-contain" />
            )}
          </span>
          <span className="min-w-0 flex-1 [container-type:inline-size]">
            <span className="text-label inline-block rounded-full bg-green-deep/70 px-2.5 py-1 text-[length:min(0.75rem,3.2vw)] text-white">
              {next ? t('home.next') : t('home.allDone.caption')}
            </span>
            <span className="text-title mt-1.5 line-clamp-3 block" data-fit-label style={fitWords(next ? l(next.title) : t('home.allDone'), 'min(1.5rem,6.4vw)')}>
              {next ? l(next.title) : t('home.allDone')}
            </span>
            {chapter && (
              <span className="mt-1.5 block text-sm leading-tight font-extrabold text-white/90">{t('home.chapter', { n: chapter.n, name: l(chapter.title) })}</span>
            )}
          </span>
        </span>

        {/* Chapter progress as stepping stones: a picture a 4-year-old can read. */}
        {stops.length > 1 && (
          <span className="relative mt-3 flex items-center gap-1.5" role="img" aria-label={t('home.chapterProgress', { done: doneInChapter, total: stops.length })}>
            {stops.map((id) => (
              <span
                key={id}
                className={`h-2.5 flex-1 rounded-full ${done[id] ? 'bg-gold' : id === next?.id ? 'bg-white' : 'bg-white/25'}`}
              />
            ))}
          </span>
        )}

        <span className="puck relative mt-4 flex min-h-[var(--tap)] items-center justify-center gap-2 rounded-full bg-coral px-5 text-center text-[length:min(1.125rem,4.9vw)] leading-tight font-black text-coral-ink [--edge:var(--color-coral-deep)]">
          <Icon name={next ? 'play' : 'star'} className="shrink-0" />
          {next ? t('home.continue') : t('home.toPassport')}
        </span>
      </Link>
    </m.div>
  )
}

/** How close the next medal is. All won → the cup. */
function RewardStrip({ badges, total }: { badges: number; total: number }) {
  const t = useT()
  const need = (r: (typeof REWARDS)[number]) => (r.need === 'all' ? total : Math.min(r.need, total))
  const nextReward = REWARDS.find((r) => badges < need(r))
  const prev = nextReward ? REWARDS[REWARDS.indexOf(nextReward) - 1] : undefined
  const from = prev ? need(prev) : 0
  return (
    <Link to="/collection" className="press bg-stage-gold relative flex items-center gap-3 overflow-hidden rounded-[var(--radius-card)] py-3 pr-3 pl-2 text-ink shadow-soft">
      <span className="relative grid size-[min(4.5rem,18vw)] shrink-0 place-items-center">
        <img src={img(ART.burst)} alt="" className="kid-deco anim-spin-slow absolute inset-0 size-full opacity-60" />
        <img src={img(nextReward?.art ?? ART.trophy)} alt="" className="pop-3d relative size-[80%] object-contain" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block leading-tight font-black">
          {nextReward ? t('home.nextReward', { name: t(`reward.${nextReward.id}.name` as TKey) }) : t('home.allRewards')}
        </span>
        <span className="mt-0.5 block text-sm font-bold">{t('passport.count', { n: badges, total })}</span>
        {nextReward && (
          <ProgressBar
            value={badges - from}
            max={need(nextReward) - from}
            tone="coral"
            track="bg-white/70"
            className="mt-1.5"
            height="h-2.5"
          />
        )}
      </span>
      <Icon name="chevron" className="shrink-0" />
    </Link>
  )
}

/** One world card: its colour, its big picture, its name — and how much of it the child has explored. */
function World({
  world,
  missions,
  done,
  showDesc,
}: {
  world: (typeof WORLDS)[number]
  missions: readonly MissionSummary[] | null
  done: Record<string, unknown>
  showDesc: boolean
}) {
  const t = useT()
  const section = sectionById(world.id)!
  const own = missions?.filter((x) => x.subject === world.subject) ?? []
  const finished = own.filter((x) => done[x.id]).length
  return (
    <Link
      to={section.path}
      className={`press relative flex h-full min-h-[min(13rem,52vw)] flex-col [container-type:inline-size] overflow-hidden rounded-[var(--radius-card)] p-3.5 shadow-soft ${world.stage} ${world.ink} wide:min-h-[11rem]`}
    >
      <span className="kid-deco absolute -right-8 -bottom-10 size-32 rounded-full bg-white/25" aria-hidden="true" />
      <span className="pointer-events-none relative -mx-1 -mt-1 grid flex-1 place-items-center" aria-hidden="true">
        <SectionIcon id={world.id} className="pop-3d size-[min(6.5rem,26vw)] wide:size-[6rem]" />
      </span>
      <span className="relative mt-1 block leading-tight font-black" data-fit-label style={fitWords(t(section.label), 'min(1.125rem,5vw)')}>
        {t(section.label)}
      </span>
      {showDesc && <span className="relative mt-0.5 block text-xs leading-snug font-bold">{t(section.desc)}</span>}
      {own.length > 0 && (
        <span className="relative mt-2 flex items-center gap-1.5 self-start rounded-full bg-white/80 px-2 py-0.5 text-xs font-black text-ink">
          <img src={img(ART.star)} alt="" className="size-4" />
          {t('home.worldProgress', { done: finished, total: own.length })}
        </span>
      )}
    </Link>
  )
}
