import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { BadgeArt } from '../components/BadgeArt'
import { img } from '../components/Brand'
import { ContentState } from '../components/ContentState'
import { Panel, ProgressBar } from '../components/ds'
import { Icon } from '../components/Icon'
import { MissionNode, stopArt } from '../components/MissionNode'
import { UnlockInfo } from '../components/UnlockInfo'
import { Screen, TopBar } from '../components/ui'
import { pickLevel } from '../content/missions'
import { MILESTONES, milestoneNeed, type MilestoneId } from '../content/progress'
import { pathChapters } from '../content/path'
import type { Mission } from '../content/schema'
import { useChildMissions } from '../content/useChildMissions'
import { useLocalized } from '../content/useLocalized'
import { useProgress } from '../content/useProgress'
import { useT } from '../i18n/useT'
import { m } from '../motion'
import { useAge } from '../store/profiles'
import { ageToLevel } from '../theme/levels'
import { ART, GAME_ART } from '../world'

/** Horizontal position (% of the column) of the n-th stop: a gentle serpentine. */
const XS = [26, 50, 74, 50]
const ROW = 10 // path units per row (the SVG is 100 × rows·ROW)

/**
 * Every chapter of the path is its own little land: a tinted ground and a few 3D things at the edges
 * (far from the stops, faded, never clickable — they set the scene, the stops stay the brightest thing).
 */
const LANDS: readonly { ground: string; deco: readonly [string, string, string] }[] = [
  { ground: 'from-[#e3f5e6] to-[#cdeed6]', deco: ['world/butterfly.webp', 'world/forest-bush.webp', 'world/bird.webp'] },
  { ground: 'from-[#d5efd9] to-[#b9e3c3]', deco: ['world/forest-bush.webp', 'world/mushroom.webp', 'world/butterfly.webp'] },
  { ground: 'from-[#f6ead2] to-[#eddcb8]', deco: ['world/old-scroll.webp', 'world/asparuh-shield.webp', 'world/medieval-book.webp'] },
  { ground: 'from-[#dcecf6] to-[#c9e2f1]', deco: ['world/mountain-peak.webp', 'world/river.webp', 'world/bird.webp'] },
  { ground: 'from-[#fbe6e2] to-[#f5d6d0]', deco: ['world/bulgarian-embroidery.webp', 'world/traditional-bread.webp', 'world/martenitsa-pizho-penda.webp'] },
  { ground: 'from-[#e2f3fb] to-[#cbe9f7]', deco: ['world/black-sea-lighthouse.webp', 'world/bird.webp', 'world/bridge.webp'] },
]

const REWARD_ART: Record<MilestoneId, string> = { bronze: ART.bronze, silver: ART.silver, gold: ART.gold, trophy: ART.trophy }

/**
 * "The adventure path": every mission is a stop on a winding road through the lands of the chapters.
 * Played stops are golden, open ones glow (the hot-air balloon waits at the next one), locked ones show a key
 * and — when tapped — exactly how they open. Each chapter's sign carries a chest that opens when the chapter is done.
 * The path scrolls to the child's next stop. On a computer a side panel shows progress, the next stop and the medals.
 */
export function Adventure() {
  const t = useT()
  const l = useLocalized()
  const missions = useChildMissions()
  const progress = useProgress(missions)
  const chapters = pathChapters(missions)
  const ordered = chapters.flatMap((c) => c.missions)
  // the demo shows drafts: say so beside the progress, so played ≠ checked by a teacher (the family build has no drafts)
  const drafts = ordered.filter((m) => m.draft).length
  const next = progress.next(ordered)
  const played = ordered.filter((x) => progress.status(x) === 'done').length
  const [open, setOpen] = useState<Mission | null>(null)

  // One list of rows: a sign for each chapter, then its stops.
  type Row = { kind: 'sign'; chapter: number } | { kind: 'stop'; mission: Mission; x: number }
  const rows: Row[] = []
  const bands: { from: number; to: number }[] = []
  let k = 0
  chapters.forEach((c, ci) => {
    const from = rows.length
    rows.push({ kind: 'sign', chapter: ci })
    for (const mission of c.missions) rows.push({ kind: 'stop', mission, x: XS[k++ % XS.length]! })
    bands.push({ from, to: rows.length })
  })
  const points = rows.map((r, i) => [r.kind === 'stop' ? r.x : 50, i * ROW + ROW / 2] as const)
  const road = points.map(([x, y], i) => (i === 0 ? `M${x} ${y}` : `C${points[i - 1]![0]} ${y - ROW / 2} ${x} ${points[i - 1]![1] + ROW / 2} ${x} ${y}`)).join(' ')

  // Arrive at the child's next stop, not at the top of a long road.
  const scrolled = useRef(false)
  useEffect(() => {
    if (scrolled.current || !next) return
    scrolled.current = true
    const el = document.getElementById(`stop-${next.id}`)
    if (!el || el.getBoundingClientRect().bottom < window.innerHeight * 0.7) return
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView?.({ block: 'center', behavior: calm ? 'auto' : 'smooth' })
  }, [next])

  return (
    <Screen nav wide>
      <TopBar title={t('path.title')} />
      <div className="px-4 pb-32 short:pb-8 wide:grid wide:grid-cols-[minmax(0,1fr)_minmax(0,min(19rem,50%))] wide:items-start wide:gap-8 wide:pb-10">
        <div className="flex flex-col gap-3 wide:mx-auto wide:w-full wide:max-w-[30rem]">
          {ordered.length === 0 && (
            <p className="rounded-[var(--radius-card)] bg-gold-soft p-4 text-center font-bold">
              <span className="text-title block">{t('empty.title')}</span>
              {t('empty.text')}
            </p>
          )}
          {/* Progress: gems for played missions (on a computer it is in the side panel). */}
          {ordered.length > 0 && (
          <Link to="/collection" className="edge-light relative press flex items-center gap-3 rounded-full mat-paper py-2 pr-4 pl-2 wide:hidden">
            <img src={img(ART.gemGreen)} alt="" className="pop-3d size-11 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-extrabold">{t('path.progress', { done: played, total: ordered.length })}</span>
              <ProgressBar value={played} max={ordered.length} height="h-2.5" className="mt-1" />
              {drafts > 0 && <span className="mt-1.5 flex"><ContentState drafts={drafts} total={ordered.length} /></span>}
            </span>
            <Icon name="chevron" className="shrink-0 text-muted" />
          </Link>
          )}

          <div className="relative" style={{ height: `calc(${rows.length} * var(--path-row))` }}>
            {/* The lands of the chapters. */}
            {bands.map((b, ci) => {
              const land = LANDS[ci % LANDS.length]!
              return (
                <div
                  key={ci}
                  aria-hidden="true"
                  className={`absolute inset-x-[-0.5rem] overflow-hidden rounded-[2.5rem] bg-gradient-to-b ${land.ground}`}
                  style={{ top: `calc(${b.from} * var(--path-row) + 0.5rem)`, height: `calc(${b.to - b.from} * var(--path-row) - 1rem)` }}
                >
                  {land.deco.map((src, di) => (
                    <img
                      key={di}
                      src={img(src)}
                      alt=""
                      loading="lazy"
                      className={`kid-deco absolute size-[min(3.25rem,13vw)] object-contain opacity-60 ${di % 2 ? 'right-1 rotate-6' : 'left-1 -rotate-6'}`}
                      style={{ top: `${18 + di * 30}%` }}
                    />
                  ))}
                </div>
              )
            })}

            {/* The road */}
            <svg viewBox={`0 0 100 ${rows.length * ROW}`} preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true" focusable="false">
              <path d={road} fill="none" stroke="#d9c79c" strokeWidth={30} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <path d={road} fill="none" stroke="#f1e4c2" strokeWidth={24} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <path d={road} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="2 14" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>

            <ol className="relative" aria-label={t('path.title')}>
              {rows.map((r, i) =>
                r.kind === 'sign' ? (
                  <ChapterSign
                    key={`sign-${i}`}
                    title={l(chapters[r.chapter]!.title)}
                    done={chapters[r.chapter]!.missions.filter((x) => progress.status(x) === 'done').length}
                    total={chapters[r.chapter]!.missions.length}
                  />
                ) : (
                  <MissionNode
                    key={r.mission.id}
                    mission={r.mission}
                    x={r.x}
                    status={progress.status(r.mission)}
                    isNew={progress.isNew(r.mission)}
                    isNext={next?.id === r.mission.id}
                    onOpen={() => setOpen(r.mission)}
                  />
                ),
              )}
            </ol>
          </div>
        </div>

        {/* Computer: progress, the next stop and the medals stay in view while the road scrolls. */}
        {ordered.length > 0 && (
        <aside className="sticky top-4 hidden flex-col gap-4 wide:flex" aria-label={t('path.rewards')}>
          <section className="edge-light relative rounded-[var(--radius-card)] mat-paper p-4">
            <p className="font-black">{t('path.progress', { done: played, total: ordered.length })}</p>
            <ProgressBar value={played} max={ordered.length} icon={ART.gemGreen} className="mt-2" />
            {drafts > 0 && <span className="mt-2 flex"><ContentState drafts={drafts} total={ordered.length} /></span>}
          </section>
          {next && (
            <button
              type="button"
              onClick={() => setOpen(next)}
              className="press bg-stage-green flex items-center gap-3 rounded-[var(--radius-card)] p-3 text-left text-white shadow-stage"
            >
              <img src={img(stopArt(next, true).src)} alt="" className="pop-3d size-16 shrink-0 object-contain" />
              <span className="min-w-0 flex-1">
                <span className="text-label block text-white/90">{t('path.next')}</span>
                <span className="block text-lg leading-tight font-black">{l(next.title)}</span>
              </span>
            </button>
          )}
          <section className="edge-light relative rounded-[var(--radius-card)] mat-paper p-4">
            <h2 className="mb-2 font-black">{t('path.rewards')}</h2>
            <ul className="grid grid-cols-4 gap-1">
              {MILESTONES.map(({ id }) => {
                const got = progress.badges >= milestoneNeed(id, missions)
                return (
                  <li key={id} className="grid place-items-center">
                    <img src={img(REWARD_ART[id])} alt={t(`reward.${id}`)} className={`size-14 object-contain ${got ? 'pop-3d' : 'opacity-35 grayscale'}`} />
                  </li>
                )
              })}
            </ul>
          </section>
        </aside>
        )}
      </div>
      {open && <StopSheet mission={open} status={progress.status(open)} onClose={() => setOpen(null)} />}
    </Screen>
  )
}

/** The wooden sign that opens a chapter, with its chest: closed with "2/5", open and golden when all are played. */
function ChapterSign({ title, done, total }: { title: string; done: number; total: number }) {
  const t = useT()
  const complete = done === total
  const say = complete ? t('path.chapterDone') : t('path.chapterLeft', { done, total })
  return (
    <li className="relative flex h-[var(--path-row)] items-center justify-center">
      <span className="relative grid w-[min(10rem,48vw)] place-items-center">
        <img src={img(ART.sign)} alt="" className="pop-3d w-full" />
        <span className="absolute top-[8%] flex h-[34%] w-[80%] items-center justify-center text-center text-[length:min(0.9rem,3.8vw)] leading-tight font-black text-[#4A2A12]" data-fit-label>
          {title}
        </span>
      </span>
      <span className={`absolute right-[3%] bottom-[12%] flex items-center gap-1 rounded-full py-0.5 pr-2.5 pl-0.5 text-xs font-black text-ink shadow-soft ${complete ? 'bg-gold' : 'bg-white'}`}>
        <m.img
          src={img(complete ? ART.chestOpen : ART.chestClosed)}
          alt=""
          initial={complete ? { scale: 0.5, rotate: -15 } : false}
          animate={{ scale: 1, rotate: 0 }}
          className="size-9 object-contain"
        />
        <span aria-hidden="true">
          {done}/{total}
        </span>
        <span className="sr-only">{say}</span>
      </span>
    </li>
  )
}

/** Details of a stop: what game awaits, and Play — or how it opens. */
function StopSheet({ mission, status, onClose }: { mission: Mission; status: 'locked' | 'open' | 'done'; onClose: () => void }) {
  const t = useT()
  const l = useLocalized()
  const level = ageToLevel(useAge())
  const game = pickLevel(mission, level).content.game.type
  const art = stopArt(mission, status !== 'locked')

  return (
    <Panel label={l(mission.title)} onClose={onClose}>
      <div className="flex items-center gap-3 pr-10">
        <span className="relative grid size-24 shrink-0 place-items-center">
          <span className={`absolute inset-[8%] rounded-full ${status === 'locked' ? 'bg-sand' : 'bg-gold-soft'}`} aria-hidden="true" />
          {art.badge ? (
            <BadgeArt icon={art.src} earned={status !== 'locked'} className="relative size-[88%]" />
          ) : (
            <m.img
              src={img(art.src)}
              alt=""
              initial={{ scale: 0.6, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              className={`pop-3d relative size-[92%] object-contain ${status === 'locked' ? 'opacity-50 grayscale' : ''}`}
            />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-label text-coral-dark">{t(`subject.${mission.subject}`)}</p>
          <h2 className="text-xl leading-tight font-black">{l(mission.title)}</h2>
          {status === 'done' && (
            <p className="flex items-center gap-1 text-sm font-bold text-green-dark">
              <Icon name="check" width="1em" height="1em" />
              {t('missions.done')}
            </p>
          )}
        </div>
      </div>
      <p className="flex items-center gap-2 rounded-full bg-cream py-1.5 pr-4 pl-1.5 font-extrabold">
        <img src={img(GAME_ART[game]!)} alt="" className="size-9 shrink-0" />
        <span className="min-w-0 flex-1">{t(`game.${game}`)}</span>
      </p>
      {status === 'locked' ? (
        <UnlockInfo mission={mission} className="rounded-[1.5rem] bg-sky-soft p-4" />
      ) : (
        <Link
          to={`/mission/${mission.id}`}
          data-autofocus
          className="btn-satin tint-coral edge-light tap flex items-center justify-center gap-2 rounded-full px-6 text-xl font-extrabold text-coral-ink"
        >
          <Icon name={status === 'done' ? 'refresh' : 'play'} />
          {status === 'done' ? t('path.replay') : t('path.play')}
        </Link>
      )}
    </Panel>
  )
}
