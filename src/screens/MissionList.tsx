import { Link, useParams } from 'react-router'
import { BadgeArt } from '../components/BadgeArt'
import { img } from '../components/Brand'
import { Meter } from '../components/ds'
import { fitWords } from '../components/fit'
import { ContentState, DraftChip } from '../components/ContentState'
import { Icon } from '../components/Icon'
import { SceneBackdrop } from '../components/Scene'
import { TimelineLink } from '../components/TimelineLink'
import { Screen, TopBar } from '../components/ui'
import { missionsBySubject, pickLevel } from '../content/missions'
import type { Mission, SceneId, Subject } from '../content/schema'
import { useChildMissions } from '../content/useChildMissions'
import { useLocalized } from '../content/useLocalized'
import { useProgress } from '../content/useProgress'
import type { TKey } from '../i18n'
import { useT } from '../i18n/useT'
import { m, rise, stagger } from '../motion'
import { sectionById, sectionIcon, type SectionId } from '../sections'
import { useActiveProfile, useAge } from '../store/profiles'
import { ageToLevel } from '../theme/levels'
import { ART, GAME_ART } from '../world'
import { ComingSoon } from './ComingSoon'

/** Hub topics that map to a mission subject. */
const TOPIC_SUBJECT: Partial<Record<SectionId, Subject>> = {
  history: 'history',
  culture: 'culture',
  language: 'language',
}

/** Each subject has its own colour: the tinted disc behind the badge and the subject chip. */
export const SUBJECT_TINT: Record<Subject, string> = {
  history: 'bg-gold-soft',
  culture: 'bg-coral-soft',
  language: 'bg-green-soft',
  geography: 'bg-sky-soft',
}

/** v0.26: the land each subject's adventures start in (code-drawn, 0 KB) and the satin of its medallion. */
const SUBJECT_WORLD: Record<Subject, { scene: SceneId; tint: string }> = {
  history: { scene: 'castle', tint: 'tint-gold' },
  culture: { scene: 'village', tint: 'tint-coral' },
  language: { scene: 'meadow', tint: 'tint-sky' },
  geography: { scene: 'mountain', tint: 'tint-sky' },
}

/**
 * /topic/:id — one subject's missions, v0.26: not one list of identical rows but three kinds of thing.
 * Open missions are ADVENTURES (a little land with the medal waiting on its pedestal and the games inside);
 * played ones are MEDALS in a case (gold, with a tick); locked ones are pressed INTO the page (a recess, a key).
 * The path order is kept inside each group. A topic with no missions yet falls back to the "Coming soon" screen.
 */
export function MissionList({ topic }: { topic?: boolean }) {
  const t = useT()
  const params = useParams()
  const done = useActiveProfile().done
  const visible = useChildMissions()
  const progress = useProgress(visible)

  const section = topic ? sectionById(params.id) : sectionById('missions')
  const subject = topic && section ? TOPIC_SUBJECT[section.id] : undefined
  if (topic && !subject) return <ComingSoon />
  const missions = missionsBySubject(subject).filter((m) => visible.includes(m))
  if (missions.length === 0) return topic ? <ComingSoon /> : <ComingSoon section="missions" />

  const played = missions.filter((mission) => done[mission.id])
  const locked = missions.filter((mission) => !done[mission.id] && progress.status(mission) === 'locked')
  const open = missions.filter((mission) => !done[mission.id] && progress.status(mission) !== 'locked')
  const world = SUBJECT_WORLD[subject ?? missions[0]!.subject]
  // Every mission here still waits for the teacher (the demo build): say it ONCE on the banner, not on every card.
  const drafts = missions.filter((mission) => mission.draft).length
  const allDraft = drafts === missions.length
  const draftChip = !allDraft

  return (
    <Screen nav wide>
      <TopBar title={section ? t(section.label) : t('missions.title')} />
      <div className="@container/page">
      <div className="flex flex-col gap-section px-4 pb-[calc(var(--tap)+4rem+env(safe-area-inset-bottom))] short:pb-8 wide:pb-10">
        {/* The topic's banner: its 3D picture in a satin medallion, how far the child has come. */}
        <div className="flex flex-col gap-3 cols:grid cols:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] cols:items-center cols:gap-5">
          <div className="mat-paper edge-light flex items-center gap-4 rounded-[1.75rem] p-3 pr-5">
            <span className={`mat mat-satin edge-light grid size-[min(4.75rem,19vw)] shrink-0 place-items-center rounded-full ${world.tint}`} aria-hidden="true">
              {section && <img src={img(sectionIcon(section.id))} alt="" className="pop-3d size-[86%] object-contain" />}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              {/* Two different things, two different looks: the CHILD's progress (green meter) and the state of the CONTENT
                  (a teacher's check) — so "2 of 22 played" never reads as if the progress itself were a draft. */}
              <span className="flex flex-col gap-1.5">
                <span className="text-eyebrow text-muted">{t('topic.progress')}</span>
                <span className="text-row">{t('missions.count', { done: played.length, total: missions.length })}</span>
                <Meter value={played.length} max={missions.length} tint="tint-green" className="h-2.5" />
              </span>
              <ContentState drafts={drafts} total={missions.length} />
            </span>
          </div>
          {subject === 'history' && <TimelineLink />}
        </div>

        {open.length > 0 && (
          <section aria-labelledby="topic-open" className="flex flex-col gap-3">
            <h2 id="topic-open" className="text-headline px-1">{t('topic.open')}</h2>
            <m.ul variants={stagger} initial="hidden" animate="show" className="grid gap-3 cols:grid-cols-[repeat(auto-fill,minmax(min(19rem,100%),1fr))]">
              {open.map((mission, i) => (
                <m.li key={mission.id} variants={rise} className={`flex ${i === 0 ? 'cols:col-span-2' : ''}`}>
                  {i === 0 ? (
                    <Adventure mission={mission} scene={world.scene} fresh={progress.isNew(mission)} lazy={false} draftChip={draftChip} />
                  ) : (
                    <Compact mission={mission} scene={world.scene} fresh={progress.isNew(mission)} lazy={i >= 6} draftChip={draftChip} />
                  )}
                </m.li>
              ))}
            </m.ul>
          </section>
        )}

        {played.length > 0 && (
          <section aria-labelledby="topic-played" className="flex flex-col gap-3">
            <h2 id="topic-played" className="text-headline px-1">{t('topic.played')}</h2>
            <ul className="grid grid-cols-2 gap-3 cols:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))]">
              {played.map((mission, i) => (
                <li key={mission.id} className="flex">
                  <Medal mission={mission} lazy={i >= 6} draftChip={draftChip} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {locked.length > 0 && (
          <section aria-labelledby="topic-ahead" className="flex flex-col gap-3">
            <div className="px-1">
              <h2 id="topic-ahead" className="text-headline">{t('topic.ahead')}</h2>
              <p className="text-meta mt-1 text-muted">{t('topic.aheadHint')}</p>
            </div>
            <ul className="grid gap-2.5 cols:grid-cols-[repeat(auto-fill,minmax(min(19rem,100%),1fr))]">
              {locked.map((mission) => (
                <li key={mission.id} className="flex">
                  <Locked mission={mission} draftChip={draftChip} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      </div>
    </Screen>
  )
}

/** Chips every card can carry: new, draft. */
function Flags({ mission, fresh, draftChip }: { mission: Mission; fresh?: boolean; draftChip: boolean }) {
  const t = useT()
  const draft = draftChip && mission.draft
  if (!fresh && !draft) return null
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {fresh && <span className="btn-satin tint-coral rounded-full px-2.5 py-0.5 text-xs font-black whitespace-nowrap text-coral-ink">{t('unlock.new')}</span>}
      {draft && <DraftChip />}
    </span>
  )
}

/** The next mission on the path: the big adventure card — a little land with the medal waiting on its pedestal and the games inside on glass chips. */
function Adventure({ mission, scene, fresh, lazy, draftChip }: { mission: Mission; scene: SceneId; fresh: boolean; lazy: boolean; draftChip: boolean }) {
  const t = useT()
  const l = useLocalized()
  const games = useGames(mission)
  const title = l(mission.title)
  return (
    <Link to={`/mission/${mission.id}`} className="lift mat-paper edge-light flex w-full flex-col overflow-hidden rounded-[1.75rem] cols:flex-row">
      <span className="relative block h-[min(9.5rem,40vw)] min-h-[min(8rem,34vw)] overflow-hidden rounded-t-[inherit] cols:h-auto cols:min-h-[12rem] cols:w-1/2 cols:rounded-tr-none cols:rounded-l-[inherit]" aria-hidden="true">
        <SceneBackdrop scene={scene} quiet className="absolute inset-0 size-full" />
        <span className="rim-over absolute inset-0" />
        <span className="pedestal-gold absolute bottom-[10%] left-[8%] h-[13%] w-[36%] cols:w-[50%]" />
        <BadgeArt icon={mission.badge.icon} lazy={lazy} className="pop-3d absolute bottom-[15%] left-[11%] size-[min(6.5rem,28vw)] cols:size-[8rem]" />
        <span className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {games.map((g) => (
            <span key={g} className="mat-glass grid size-[min(2.75rem,11vw)] place-items-center rounded-full">
              <img src={img(GAME_ART[g]!)} alt="" className="size-[72%] object-contain" />
            </span>
          ))}
        </span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-2 p-4 pt-3 [container-type:inline-size] cols:justify-center cols:p-6">
        <span className="text-eyebrow text-green-dark">{t('path.next')}</span>
        <Flags mission={mission} fresh={fresh} draftChip={draftChip} />
        <span className="text-headline" style={fitWords(title, 'min(1.75rem, 7vw)', 0.62)}>
          {title}
        </span>
        <span className="sr-only">{games.map((g) => t(`game.${g}` as TKey)).join(', ')}</span>
        <span className="btn-satin tint-coral edge-light mt-auto flex min-h-[var(--tap)] items-center justify-center gap-2 self-start rounded-full px-6 text-lg font-extrabold text-coral-ink" aria-hidden="true">
          <Icon name="play" width="1em" height="1em" />
          {t('missions.play')}
        </span>
      </span>
    </Link>
  )
}

/** The game types inside a mission at the child's level (the main game, then the challenge round). */
function useGames(mission: Mission) {
  const level = ageToLevel(useAge())
  const { content } = pickLevel(mission, level)
  return [...new Set([content.game.type, ...(content.extra ? [content.extra.type] : [])])]
}

/**
 * Every other open mission: one compact row — the medal in a small window onto the land, the title, the games as
 * small pictures, the play puck. "New" is a coral bead on the window (the word is read out to screen readers).
 */
function Compact({ mission, scene, fresh, lazy, draftChip }: { mission: Mission; scene: SceneId; fresh: boolean; lazy: boolean; draftChip: boolean }) {
  const t = useT()
  const l = useLocalized()
  const games = useGames(mission)
  const title = l(mission.title)
  return (
    <Link to={`/mission/${mission.id}`} className="lift mat-paper edge-light flex w-full items-center gap-3 rounded-[1.5rem] p-2 pr-3">
      <span className="relative block size-[min(4.75rem,20vw)] shrink-0 overflow-hidden rounded-[1.125rem]" aria-hidden="true">
        <SceneBackdrop scene={scene} quiet className="absolute inset-0 size-full" />
        <span className="rim-over absolute inset-0" />
        <span className="pedestal-gold absolute bottom-[8%] left-1/2 h-[14%] w-[72%] -translate-x-1/2" />
        <BadgeArt icon={mission.badge.icon} lazy={lazy} className="pop-3d absolute bottom-[13%] left-1/2 size-[66%] -translate-x-1/2" />
      </span>
      {fresh && <span className="btn-satin tint-coral absolute top-1.5 left-1.5 size-3.5 rounded-full" aria-hidden="true" />}
      <span className="flex min-w-0 flex-1 flex-col gap-1 [container-type:inline-size]">
        <span className="text-row" style={fitWords(title, 'min(1.0625rem, 4.5vw)', 0.72)}>
          {title}
        </span>
        {fresh && <span className="sr-only">{t('unlock.new')}</span>}
        <span className="flex flex-wrap items-center gap-1.5">
          {games.map((g) => (
            <img key={g} src={img(GAME_ART[g]!)} alt="" className="size-6 object-contain" aria-hidden="true" />
          ))}
          <span className="sr-only">{games.map((g) => t(`game.${g}` as TKey)).join(', ')}</span>
          {draftChip && mission.draft && <DraftChip />}
        </span>
      </span>
      <span className="btn-satin tint-coral edge-light grid size-[max(2.75rem,var(--tap))] shrink-0 place-items-center rounded-full text-coral-ink" aria-hidden="true">
        <Icon name="play" width="1.05em" height="1.05em" />
      </span>
    </Link>
  )
}

/** A played mission: its medal in colour on a gold pedestal, with a tick. */
function Medal({ mission, lazy, draftChip }: { mission: Mission; lazy: boolean; draftChip: boolean }) {
  const t = useT()
  const l = useLocalized()
  const title = l(mission.title)
  return (
    <Link to={`/mission/${mission.id}`} className="lift mat-paper edge-light flex w-full flex-col items-center gap-2 rounded-[1.5rem] px-3 pt-4 pb-3 text-center [container-type:inline-size]">
      <span className="relative grid place-items-center px-2 pb-1" aria-hidden="true">
        <span className="pedestal-gold absolute bottom-0 left-1/2 h-[22%] w-[92%] -translate-x-1/2" />
        <BadgeArt icon={mission.badge.icon} lazy={lazy} className="pop-3d relative size-[min(5rem,42cqw)]" />
        <span className="btn-satin tint-green absolute -right-1 bottom-1 grid size-7 place-items-center rounded-full text-white">
          <Icon name="check" width="0.95em" height="0.95em" />
        </span>
      </span>
      <span className="text-row" style={fitWords(title, 'min(1rem, 4.3vw)', 0.64)}>
        {title}
      </span>
      <Flags mission={mission} draftChip={draftChip} />
      <span className="text-meta mt-auto flex items-center gap-1 text-green-dark">
        <Icon name="refresh" width="1em" height="1em" />
        {t('path.replay')}
      </span>
    </Link>
  )
}

/** A locked mission: pressed into the page — a recess, the medal still grey, a key. It still opens (and explains how). */
function Locked({ mission, draftChip }: { mission: Mission; draftChip: boolean }) {
  const t = useT()
  const l = useLocalized()
  return (
    <Link to={`/mission/${mission.id}`} className="press well flex w-full items-center gap-3 rounded-[1.5rem] py-2.5 pr-4 pl-2.5">
      <span className="relative grid size-[min(3.5rem,14vw)] shrink-0 place-items-center" aria-hidden="true">
        <BadgeArt icon={mission.badge.icon} earned={false} className="size-full" />
        <img src={img(ART.key)} alt="" className="pop-3d absolute -right-1.5 -bottom-1 size-[55%] object-contain" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-row">{l(mission.title)}</span>
        <span className="text-meta flex flex-wrap items-center gap-1.5 text-muted">
          {t('path.locked')}
          {draftChip && mission.draft && <DraftChip />}
        </span>
      </span>
    </Link>
  )
}
