import { useMemo } from 'react'
import { fitWords } from '../components/fit'
import { Link } from 'react-router'
import { BadgeArt } from '../components/BadgeArt'
import { HeroFigure, img, Logo, Scenery } from '../components/Brand'
import { Meter } from '../components/ds'
import { Icon } from '../components/Icon'
import { ProfileAvatar, useProfileName } from '../components/ProfileAvatar'
import { SectionIcon } from '../components/SectionIcon'
import { UpdateBanner } from '../components/UpdateBanner'
import { Button, Screen, useTitle } from '../components/ui'
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
const WORLDS: readonly { id: SectionId; subject: Subject; tint: string; ink: string }[] = [
  { id: 'discover', subject: 'geography', tint: 'tint-sky', ink: 'text-ink' },
  { id: 'history', subject: 'history', tint: 'tint-gold', ink: 'text-ink' },
  { id: 'culture', subject: 'culture', tint: 'tint-coral', ink: 'text-coral-ink' },
  { id: 'language', subject: 'language', tint: 'tint-paper', ink: 'text-green-dark' },
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
    <Screen nav wide atmosphere>
      <h1 className="sr-only">{t('nav.home')}</h1>

      {/* Top chrome: who is playing (a paper chip), the logo, the parents' gear. */}
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <Link
          to="/who"
          className="tap lift mat-paper flex max-w-[60%] min-w-0 items-center gap-2.5 rounded-full py-1 pr-4 pl-1"
          aria-label={`${t('profile.who')} ${name(profile, profiles.indexOf(profile))}`}
        >
          <span className="mat-ceramic grid size-11 shrink-0 place-items-center">
            <ProfileAvatar avatar={profile.avatar} outfit={profile.outfit} className="size-10 bg-transparent shadow-none" />
          </span>
          <span className="text-row truncate">{name(profile, profiles.indexOf(profile))}</span>
        </Link>
        <Logo size="sm" className="hidden h-9 min-[350px]:block wide:hidden" />
        <Link to="/parents" className="tap lift mat-paper grid shrink-0 place-items-center rounded-full text-green-dark" aria-label={t('parents.title')}>
          <Icon name="gear" />
        </Link>
      </div>

      <div className="px-4 pt-3 empty:hidden">
        <UpdateBanner />
      </div>

      <div className="px-4 pb-32 short:pb-8 wide:grid wide:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] wide:items-start wide:gap-section wide:pb-10">
        <div>
          {/* 1 + 2. The diorama: the landscape is the back wall, the green slab in front of it is the floor.
              Koren and Raya stand ON the slab, the next mission's medal rises out of it into the scene. */}
          <section className="relative mt-group">
            <div className="backwall relative mx-3 h-[min(15rem,62vw)] overflow-hidden rounded-t-[1.75rem] short:h-[11rem] wide:h-[17rem]">
              <Scenery landscape className="rim-over absolute inset-0 rounded-t-[1.75rem]" />
            </div>

            {/* The floor slab (focal point). Its height is kept while the missions load, so nothing jumps. */}
            <div className="relative z-10 -mt-4">
              {missions ? (
                missions.length ? (
                  <AdventureCard next={next} missions={missions} done={profile.done} />
                ) : (
                  <NoMissionsCard />
                )
              ) : (
                <div className="plinth min-h-[13rem] rounded-[var(--radius-stage-v2)] p-card pt-10 text-white">
                  <span className="plinth-top" aria-hidden="true" />
                  {failed && (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <p role="status" className="text-row">{t('home.loadFailed')}</p>
                      <Button variant="secondary" onClick={() => window.location.reload()}>{t('home.reload')}</Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* The actors: in front of the back wall, feet on the slab's top face. */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[min(15rem,62vw)] short:h-[11rem] wide:h-[17rem]">
              <m.p
                initial={{ opacity: 0, scale: 0.85, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ ...bouncy, delay: 0.35 }}
                className="mat-paper absolute top-4 left-7 w-max max-w-[48%] origin-bottom-left rounded-[1.25rem] rounded-bl-[0.375rem] px-4 py-2.5 text-[length:min(1.0625rem,4.5vw)] leading-snug font-extrabold wide:max-w-[min(55%,17rem)]"
                data-fit-label
              >
                {t(`home.greeting.${level}`)}
              </m.p>
              <div className="absolute right-5 -bottom-1 flex items-end" aria-hidden="true">
                <m.div initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...bouncy, delay: 0.1 }} className="relative">
                  <span className="ground absolute -bottom-1 left-1/2 h-4 w-[95%] -translate-x-1/2" />
                  <HeroFigure hero="raya" className="anim-bob relative h-[min(9.75rem,39vw)] short:h-[8rem] wide:h-[12rem]" />
                </m.div>
                <m.div initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...bouncy, delay: 0.2 }} className="relative -ml-3">
                  <span className="ground absolute -bottom-1 left-1/2 h-4 w-[95%] -translate-x-1/2" />
                  <HeroFigure hero="koren" className="anim-bob-late relative h-[min(10.25rem,41vw)] short:h-[8.5rem] wide:h-[12.5rem]" />
                </m.div>
              </div>
            </div>
          </section>

          {/* Testers' switch on (demo build only): say so, so nobody forgets it before a presentation. */}
          {testing && (
            <Link to="/parents" className="btn-satin tint-coral mx-auto mt-group block w-max max-w-full rounded-full px-3 py-1 text-sm font-black text-coral-ink">
              {t('tester.chip')}
            </Link>
          )}
        </div>

        <div className="mt-section flex flex-col gap-section wide:mt-group">
          {/* 3. Progress: the path and the next medal — one quiet paper panel, two rows (not two more loud cards). */}
          {missions && missions.length > 0 && (
            <div className="mat-paper overflow-hidden rounded-[var(--radius-panel)]">
              <ProgressRow
                to="/missions"
                art={ART.gemGreen}
                title={t('path.title')}
                meta={t('missions.count', { done: played, total: missions.length })}
                value={played}
                max={missions.length}
                tint="tint-green"
              />
              <span className="mx-4 block h-px bg-[rgb(var(--shade)/0.08)]" aria-hidden="true" />
              <RewardRow badges={badges} total={missions.length} />
            </div>
          )}

          {/* 4. Worlds to explore: four satin tiles, each its own colour. A 2 × 2 grid — nothing hidden off-screen. */}
          <section aria-labelledby="worlds" className="flex flex-col gap-group">
            <h2 id="worlds" className="text-headline px-1">
              {t('home.worlds')}
            </h2>
            <m.ul variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-group">
              {WORLDS.map((w) => (
                <m.li key={w.id} variants={settle}>
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
    <m.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={bouncy}>
      <Link to="/map" className="plinth block rounded-[var(--radius-stage-v2)] p-card pt-9 pb-6 text-white">
        <span className="plinth-top" aria-hidden="true" />
        <span className="text-eyebrow inline-block rounded-full bg-green-deep/75 px-2.5 py-1 text-white">{t('empty.caption')}</span>
        <span className="text-headline mt-2 block">{t('empty.title')}</span>
        <span className="text-meta mt-1.5 block font-extrabold text-white">{t('empty.text')}</span>
        <span className="btn-satin tint-paper mt-4 inline-flex min-h-[var(--tap)] items-center gap-1 rounded-full px-5 font-black text-green-dark">
          {t('empty.map')}
          <Icon name="chevron" />
        </span>
      </Link>
    </m.div>
  )
}

/**
 * The floor slab of the diorama: what is next on the path, in which chapter, and one clear button.
 * The medal stands on the slab's top face and rises into the scene; the title gets the whole width (the biggest type on the screen).
 */
function AdventureCard({ next, missions, done }: { next: MissionSummary | undefined; missions: readonly MissionSummary[]; done: Record<string, unknown> }) {
  const t = useT()
  const l = useLocalized()
  const chapter = next ? chapterOf(next.id) : undefined
  // Chapter stops that this child can see (mini missions only for the youngest).
  const stops = chapter ? chapter.missions.filter((id) => missions.some((x) => x.id === id)) : []
  const doneInChapter = stops.filter((id) => done[id]).length
  const title = next ? l(next.title) : t('home.allDone')

  return (
    <m.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={bouncy}>
      <Link to={next ? `/mission/${next.id}` : '/collection'} className="plinth group block rounded-[var(--radius-stage-v2)] px-card pt-8 pb-5 text-white">
        <span className="plinth-top" aria-hidden="true" />

        {/* The medal on a glazed gold disc, standing on the top face and rising out of the slab. */}
        <m.span
          initial={{ y: 18, scale: 0.85 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ ...bouncy, delay: 0.25 }}
          className="mat-ceramic-gold absolute -top-[min(3.5rem,14vw)] left-5 grid size-[min(6.75rem,27vw)] place-items-center"
        >
          {next ? (
            <BadgeArt icon={next.badge.icon} className="relative size-[84%]" />
          ) : (
            <img src={img(ART.trophy)} alt="" className="pop-3d relative size-[84%] object-contain" />
          )}
        </m.span>

        {/* Next to the medal: what this is and where on the path. */}
        <span className="flex min-h-[min(3.25rem,13vw)] items-start gap-3">
          <span className="w-[min(6.75rem,27vw)] shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 pt-0.5 [container-type:inline-size]">
            <span className="text-eyebrow inline-block max-w-full rounded-full bg-green-deep/75 px-2.5 py-1 text-[length:min(0.75rem,3.2vw,8cqw)] whitespace-nowrap text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]">
              {next ? t('home.next') : t('home.allDone.caption')}
            </span>
            {chapter && <span className="text-meta mt-1.5 block font-extrabold text-white">{t('home.chapter', { n: chapter.n, name: l(chapter.title) })}</span>}
          </span>
        </span>

        {/* The title — the largest type on the screen, the whole width of the slab. */}
        <span className="mt-3 block [container-type:inline-size]">
          <span
            className="line-clamp-3 block leading-[1.04] font-black tracking-[-0.018em] [text-shadow:0_1px_1px_rgb(0_40_20/0.3)]"
            data-fit-label
            style={fitWords(title, 'min(2.125rem,8.8vw)', 0.66)}
          >
            {title}
          </span>
        </span>

        {/* Chapter progress as stepping stones set into the slab: gold = played, white = next, empty = still ahead. */}
        {stops.length > 1 && (
          <span className="well-on-tint relative mt-4 flex items-center gap-[3px] rounded-full p-[3px]" role="img" aria-label={t('home.chapterProgress', { done: doneInChapter, total: stops.length })}>
            {stops.map((id) => (
              <span
                key={id}
                className={`h-2 flex-1 rounded-full ${
                  done[id] ? 'fill-satin tint-gold' : id === next?.id ? 'bg-white shadow-[0_0_8px_rgb(255_255_255/0.6)]' : 'bg-white/10'
                }`}
              />
            ))}
          </span>
        )}

        <span className="btn-satin tint-coral relative mt-4 flex min-h-[var(--tap)] items-center rounded-full px-3 text-coral-ink [container-type:inline-size]">
          {/* One line at every width: the size follows the button (≈ 19 em of icon + words), capped at 1.0625rem. */}
          <span className="flex w-full items-center justify-center gap-[0.55em] text-[length:min(1.0625rem,5.4cqw)] leading-tight font-black whitespace-nowrap">
            <span className="grid size-[1.9em] shrink-0 place-items-center rounded-full bg-coral-ink/10 shadow-[inset_0_1px_2px_rgb(74_20_16/0.2)]">
              <Icon name={next ? 'play' : 'star'} className="size-[1.1em]" />
            </span>
            {next ? t('home.continue') : t('home.toPassport')}
          </span>
        </span>
      </Link>
    </m.div>
  )
}

/** One row of the progress panel: a 3D object on a ceramic disc, a title, a meta line and a satin meter. */
function ProgressRow({
  to,
  art,
  title,
  meta,
  value,
  max,
  tint,
}: {
  to: string
  art: string
  title: string
  meta: string
  value?: number
  max?: number
  tint: 'tint-green' | 'tint-gold' | 'tint-coral'
}) {
  return (
    <Link to={to} className="group flex items-center gap-3 px-3 py-3 transition-colors duration-[var(--dur-std)] hover:bg-[rgb(var(--shade)/0.025)] active:bg-[rgb(var(--shade)/0.05)]">
      <span className="mat-ceramic grid size-[min(3.25rem,14vw)] shrink-0 place-items-center transition-transform duration-[var(--dur-std)] ease-[var(--ease-tactile)] group-active:scale-95">
        <img src={img(art)} alt="" className="pop-3d size-[72%] object-contain" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-row block" data-fit-label>{title}</span>
        <span className="text-meta mt-0.5 block text-muted">{meta}</span>
        {max !== undefined && value !== undefined && <Meter value={value} max={max} tint={tint} className="mt-2" />}
      </span>
      <Icon name="chevron" className="shrink-0 text-muted transition-transform duration-[var(--dur-std)] group-hover:translate-x-0.5" />
    </Link>
  )
}

/** How close the next medal is. All won → the cup. */
function RewardRow({ badges, total }: { badges: number; total: number }) {
  const t = useT()
  const need = (r: (typeof REWARDS)[number]) => (r.need === 'all' ? total : Math.min(r.need, total))
  const nextReward = REWARDS.find((r) => badges < need(r))
  const prev = nextReward ? REWARDS[REWARDS.indexOf(nextReward) - 1] : undefined
  const from = prev ? need(prev) : 0
  return (
    <ProgressRow
      to="/collection"
      art={nextReward?.art ?? ART.trophy}
      title={nextReward ? t('home.nextReward', { name: t(`reward.${nextReward.id}.name` as TKey) }) : t('home.allRewards')}
      meta={t('passport.count', { n: badges, total })}
      value={nextReward ? badges - from : undefined}
      max={nextReward ? need(nextReward) - from : undefined}
      tint="tint-gold"
    />
  )
}

/** One world tile: satin in its own colour, its 3D object standing on a soft ground shadow, its name and progress. */
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
      className={`lift mat mat-satin group flex h-full min-h-[min(11.5rem,47vw)] flex-col overflow-hidden rounded-[var(--radius-tile)] p-3 [container-type:inline-size] ${world.tint} ${world.ink} wide:min-h-[11rem]`}
    >
      <span className="pointer-events-none relative grid flex-1 place-items-center pt-1" aria-hidden="true">
        <span className="pedestal absolute bottom-[2%] left-1/2 h-[22%] w-[72%] -translate-x-1/2" />
        <SectionIcon
          id={world.id}
          className="pop-3d relative -mb-[4%] size-[min(5.75rem,24vw)] transition-transform duration-[var(--dur-space)] ease-[var(--ease-tactile)] group-hover:-translate-y-1 group-hover:scale-[1.03] wide:size-[5.5rem]"
        />
      </span>
      <span className="relative mt-1.5 block leading-tight font-black tracking-[-0.005em]" data-fit-label style={fitWords(t(section.label), 'min(1.0625rem,4.6vw)')}>
        {t(section.label)}
      </span>
      {showDesc && <span className="text-meta relative mt-0.5 block text-xs">{t(section.desc)}</span>}
      {own.length > 0 && (
        <span className="relative mt-2 flex items-center gap-1 self-start rounded-full bg-white/80 px-2 py-0.5 text-xs font-black text-ink shadow-[inset_0_1px_0_#fff,0_1px_2px_rgb(var(--shade)/0.12)]">
          <img src={img(ART.star)} alt="" className="size-4" />
          {t('home.worldProgress', { done: finished, total: own.length })}
        </span>
      )}
    </Link>
  )
}
