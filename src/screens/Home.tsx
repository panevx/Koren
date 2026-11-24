import { lazy, Suspense, useMemo } from 'react'
import { fitWords } from '../components/fit'
import { Link } from 'react-router'
import { BadgeArt } from '../components/BadgeArt'
import { HeroFigure, img, Logo } from '../components/Brand'
import { Meter } from '../components/ds'
import { Icon } from '../components/Icon'
import { BackWall } from '../components/Diorama'
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
import { useWide } from '../useWide'
import { ART } from '../world'

// v0.27: its own chunk — the hub's first download does not grow
const DailyCard = lazy(() => import('../components/DailyCard'))

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

  const wide = useWide()
  const progressPanel =
    missions && missions.length > 0 ? (
      <ProgressPanel played={played} badges={badges} total={missions.length} />
    ) : null

  return (
    <Screen nav wide atmosphere>
      <h1 className="sr-only">{t('nav.home')}</h1>

      {/* Top chrome: who is playing (a paper chip), the logo, the parents' gear. */}
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <Link
          to="/who"
          className="tap lift mat-paper edge-light relative flex max-w-[60%] min-w-0 items-center gap-2.5 rounded-full py-1 pr-4 pl-1"
          aria-label={`${t('profile.who')} ${name(profile, profiles.indexOf(profile))}`}
        >
          <span className="mat-ceramic grid size-11 shrink-0 place-items-center">
            <ProfileAvatar avatar={profile.avatar} outfit={profile.outfit} className="size-10 bg-transparent shadow-none" />
          </span>
          <span className="text-row truncate">{name(profile, profiles.indexOf(profile))}</span>
        </Link>
        <Logo size="sm" className="hidden h-9 min-[350px]:block wide:hidden" />
        <Link to="/parents" className="tap lift mat-paper edge-light relative grid shrink-0 place-items-center rounded-full text-green-dark" aria-label={t('parents.title')}>
          <Icon name="gear" />
        </Link>
      </div>

      <div className="px-4 pt-3 empty:hidden">
        <UpdateBanner />
      </div>

      {/* Bottom padding = the floating navigation + a gap + the safe area, so the last tile scrolls fully clear of it. */}
      <div className="flex flex-col px-4 pb-[calc(var(--tap)+3.5rem+env(safe-area-inset-bottom))] short:pb-8 wide:pb-10">
        {/* 1 + 2. The diorama: a layered back wall (sky → far mountains → clouds → hills), Koren and Raya standing in
            front of the hills on the slab, a bush in front of them. The slab carries the next mission (and on a
            computer the progress too — one object, not three cards). */}
        <section className="relative mt-group [--wall-h:min(12.5rem,52vw)] short:[--wall-h:10rem] wide:[--wall-h:12rem]">
          <BackWall className="relative mx-3 h-[var(--wall-h)] rounded-t-[1.75rem]" />

          <div className="plinth edge-light @container relative z-10 -mt-3 rounded-[var(--radius-stage-v2)] px-card pt-6 pb-4 text-white wide:px-6 wide:pt-7 wide:pb-6">
            <span className="plinth-top" aria-hidden="true" />
            {/* Side by side only when the SLAB is wide enough (a container query, not the screen): on a 1024 px tablet
                with a big system font the plaque goes under the mission instead of squeezing its words. */}
            <div className="flex flex-col gap-5 @min-[38rem]:grid @min-[38rem]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] @min-[38rem]:items-start @min-[38rem]:gap-6">
              {missions ? (
                missions.length ? (
                  <SlabMission next={next} missions={missions} done={profile.done} />
                ) : (
                  <NoMissions />
                )
              ) : (
                <div className="min-h-[10rem]">
                  {failed && (
                    <div className="flex flex-col items-center gap-3 pt-4 text-center">
                      <p role="status" className="text-row">{t('home.loadFailed')}</p>
                      <Button variant="secondary" onClick={() => window.location.reload()}>{t('home.reload')}</Button>
                    </div>
                  )}
                </div>
              )}
              {/* Computer: the progress plaque stands on the slab, beside the mission. */}
              {wide && progressPanel}
            </div>
          </div>

          {/* The actors: in front of the hills, feet on the slab's top face, a bush in front of them. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[var(--wall-h)]">
            <m.p
              initial={{ opacity: 0, scale: 0.88, x: -8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ ...bouncy, delay: 0.35 }}
              className="mat-paper edge-light absolute top-3 left-6 w-max max-w-[50%] origin-bottom-left rounded-[1.125rem] rounded-bl-[0.375rem] px-3.5 py-2 text-[length:min(1rem,4.2vw)] leading-snug font-extrabold wide:top-5 wide:left-8 wide:max-w-[min(40%,17rem)]"
              data-fit-label
            >
              {t(`home.greeting.${level}`)}
            </m.p>
            <div className="absolute right-[7%] bottom-[-0.35rem] flex items-end wide:right-[9%]" aria-hidden="true">
              <m.div initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...bouncy, delay: 0.1 }} className="relative">
                <span className="ground absolute -bottom-1 left-1/2 h-3.5 w-[95%] -translate-x-1/2" />
                <HeroFigure hero="raya" className="anim-bob relative h-[min(8.25rem,34vw)] short:h-[7rem] wide:h-[10.5rem]" />
              </m.div>
              <m.div initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...bouncy, delay: 0.2 }} className="relative -ml-3">
                <span className="ground absolute -bottom-1 left-1/2 h-3.5 w-[95%] -translate-x-1/2" />
                <HeroFigure hero="koren" className="anim-bob-late relative h-[min(8.75rem,36vw)] short:h-[7.5rem] wide:h-[11rem]" />
              </m.div>
              {/* Foreground: a bush beside Koren's boots — the nearest layer, in front of the actors. */}
              <span className="relative -ml-4 mb-[-0.15rem] w-[min(3.25rem,13vw)] shrink-0 wide:w-[4.25rem]">
                <span className="ground absolute -bottom-1 left-1/2 h-3 w-full -translate-x-1/2" />
                <img src={img(ART.bush)} alt="" className="relative w-full" />
              </span>
            </div>
          </div>
        </section>

        {/* Testers' switch on (demo build only): say so, so nobody forgets it before a presentation. */}
        {testing && (
          <Link to="/parents" className="btn-satin tint-coral mx-auto mt-section block w-max max-w-full rounded-full px-3 py-1 text-sm font-black text-coral-ink">
            {t('tester.chip')}
          </Link>
        )}

        {/* v0.27: the day's adventure and the week's stamp — loaded after the first screen (the start download stays small). */}
        <Suspense fallback={<div className="mt-section min-h-[11rem]" />}>
          <div className="mt-section">
            <DailyCard profile={profile} />
          </div>
        </Suspense>

        {/* 3. Phone: the progress panel under the diorama (on a computer it stands on the slab). */}
        {!wide && progressPanel && <div className="mt-section">{progressPanel}</div>}

        {/* 4. Worlds to explore: satin tiles, each its own colour, each object on its own little stage. */}
        <section aria-labelledby="worlds" className="mt-section flex flex-col gap-group">
          <h2 id="worlds" className="text-headline px-1">
            {t('home.worlds')}
          </h2>
          <m.ul variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-group wide:grid-cols-4 wide:gap-4">
            {WORLDS.map((w) => (
              <m.li key={w.id} variants={settle}>
                <World world={w} missions={missions} done={profile.done} showDesc={level === 'guard'} />
              </m.li>
            ))}
          </m.ul>
        </section>
      </div>
    </Screen>
  )
}

/** No missions in this build yet: say so honestly and send the child to the map (it works without missions). */
function NoMissions() {
  const t = useT()
  return (
    <Link to="/map" className="group block rounded-[1.5rem] pt-2 outline-offset-4">
      <span className="text-eyebrow inline-block rounded-full bg-green-deep/75 px-2.5 py-1 text-white">{t('empty.caption')}</span>
      <span className="text-headline mt-2 block">{t('empty.title')}</span>
      <span className="text-meta mt-1.5 block font-extrabold text-white">{t('empty.text')}</span>
      <span className="btn-satin tint-paper mt-4 inline-flex min-h-[var(--tap)] items-center gap-1 rounded-full px-5 font-black text-green-dark">
        {t('empty.map')}
        <Icon name="chevron" />
      </span>
    </Link>
  )
}

/**
 * The mission on the slab: the medal standing on the top face and rising into the scene, what and where, the title
 * (the largest type on the screen), the chapter's stepping stones and one clear button. The whole block is one link.
 */
function SlabMission({ next, missions, done }: { next: MissionSummary | undefined; missions: readonly MissionSummary[]; done: Record<string, unknown> }) {
  const t = useT()
  const l = useLocalized()
  const chapter = next ? chapterOf(next.id) : undefined
  // Chapter stops that this child can see (mini missions only for the youngest).
  const stops = chapter ? chapter.missions.filter((id) => missions.some((x) => x.id === id)) : []
  const doneInChapter = stops.filter((id) => done[id]).length
  const title = next ? l(next.title) : t('home.allDone')

  return (
    <Link to={next ? `/mission/${next.id}` : '/collection'} className="slab-link group relative block rounded-[1.5rem] outline-offset-4">
      {/* The medal on a glazed gold disc, standing on the top face and rising out of the slab. */}
      <m.span
        initial={{ y: 14, scale: 0.88 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ ...bouncy, delay: 0.25 }}
        className="mat-ceramic-gold absolute -top-[min(3.25rem,13vw)] left-1 z-10 grid size-[min(5.5rem,22vw)] place-items-center wide:-top-[4.25rem] wide:size-[6.5rem]"
      >
        {next ? (
          <BadgeArt icon={next.badge.icon} className="relative size-[84%]" />
        ) : (
          <img src={img(ART.trophy)} alt="" className="pop-3d relative size-[84%] object-contain" />
        )}
      </m.span>

      {/* Next to the medal: what this is and where on the path. */}
      <span className="flex min-h-[min(2.5rem,10vw)] items-start gap-3 wide:min-h-[2.75rem]">
        <span className="w-[min(5.5rem,22vw)] shrink-0 wide:w-[6.5rem]" aria-hidden="true" />
        <span className="min-w-0 flex-1 [container-type:inline-size]">
          <span className="text-eyebrow inline-block max-w-full rounded-full bg-green-deep/70 px-2.5 py-1 text-[length:min(0.75rem,3.2vw,8cqw)] whitespace-nowrap text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_0_rgb(255_255_255/0.06)]">
            {next ? t('home.next') : t('home.allDone.caption')}
          </span>
          {chapter && <span className="text-meta mt-1 block font-extrabold text-white" data-fit-label>{t('home.chapter', { n: chapter.n, name: l(chapter.title) })}</span>}
        </span>
      </span>

      {/* The title — the largest type on the screen, the whole width of the slab. */}
      <span className="mt-2.5 block [container-type:inline-size]">
        <span
          className="line-clamp-3 block leading-[1.05] font-black tracking-[-0.02em] [text-shadow:0_1px_0_rgb(0_40_20/0.25)]"
          data-fit-label
          style={fitWords(title, 'min(1.875rem,7.8vw)', 0.66)}
        >
          {title}
        </span>
      </span>

      {/* Chapter progress as stepping stones set into the slab: gold = played, white = next, empty = still ahead. */}
      {stops.length > 1 && (
        <span className="well-on-tint relative mt-3 flex items-center gap-[3px] rounded-full p-[3px]" role="img" aria-label={t('home.chapterProgress', { done: doneInChapter, total: stops.length })}>
          {stops.map((id) => (
            <span
              key={id}
              className={`h-1.5 flex-1 rounded-full ${done[id] ? 'fill-satin tint-gold' : id === next?.id ? 'bg-white shadow-[0_0_6px_rgb(255_255_255/0.55)]' : 'bg-white/10'}`}
            />
          ))}
        </span>
      )}

      <span className="btn-satin tint-coral edge-light relative mt-3.5 flex min-h-[var(--tap)] items-center rounded-full px-3 text-coral-ink [container-type:inline-size]">
        {/* One line at every width: the size follows the button (≈ 19 em of icon + words), capped at 1.0625rem. */}
        <span className="flex w-full items-center justify-center gap-[0.55em] text-[length:min(1.0625rem,5.4cqw)] leading-tight font-black whitespace-nowrap">
          <span className="grid size-[1.9em] shrink-0 place-items-center rounded-full bg-coral-ink/10 shadow-[inset_0_1px_2px_rgb(74_20_16/0.2),0_1px_0_rgb(255_255_255/0.3)]">
            <Icon name={next ? 'play' : 'star'} className="size-[1.1em]" />
          </span>
          {next ? t('home.continue') : t('home.toPassport')}
        </span>
      </span>
    </Link>
  )
}

/** The path and the next medal — one quiet paper panel with two rows (a plaque on the slab on a computer). */
function ProgressPanel({ played, badges, total }: { played: number; badges: number; total: number }) {
  const t = useT()
  return (
    <div className="mat-paper edge-light relative overflow-hidden rounded-[var(--radius-panel)] text-ink">
      <ProgressRow to="/missions" art={ART.gemGreen} title={t('path.title')} meta={t('missions.count', { done: played, total })} value={played} max={total} tint="tint-green" />
      <span className="mx-4 block h-px bg-[rgb(var(--shade)/0.08)]" aria-hidden="true" />
      <RewardRow badges={badges} total={total} />
    </div>
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
      className={`lift mat mat-satin edge-light group flex h-full min-h-[min(11.5rem,47vw)] flex-col overflow-hidden rounded-[var(--radius-tile)] p-3 [container-type:inline-size] ${world.tint} ${world.ink} wide:min-h-[11rem]`}
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
