import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { BadgeArt } from '../components/BadgeArt'
import { img } from '../components/Brand'
import { Icon } from '../components/Icon'
import { UnlockInfo } from '../components/UnlockInfo'
import { Screen, TopBar } from '../components/ui'
import { MISSIONS, pickLevel } from '../content/missions'
import { pathChapters } from '../content/path'
import { placeById } from '../content/places'
import type { Mission } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useProgress } from '../content/useProgress'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { useAge } from '../store/profiles'
import { ageToLevel } from '../theme/levels'
import { ART, GAME_ART } from '../world'

/** Horizontal position (% of the column) of the n-th stop: a gentle serpentine. */
const XS = [26, 50, 74, 50]
const ROW = 10 // path units per row (the SVG is 100 × rows·ROW)

/** The picture of a stop: its landmark, the treasure chest for bonus missions, else its badge. */
function stopArt(mission: Mission, open: boolean): { src: string; badge: boolean } {
  if (mission.unlock?.badges) return { src: open ? ART.chestOpen : ART.chestClosed, badge: false }
  const place = placeById(mission.place)
  return place?.img ? { src: place.img, badge: false } : { src: mission.badge.icon, badge: true }
}

/**
 * "The adventure path": every mission is a stop on a winding road, grouped into chapters by wooden signs.
 * Played stops are golden, open ones glow (the hot-air balloon waits at the next one), locked ones show a key
 * and — when tapped — exactly how they open. Nothing is ever a dead end.
 */
export function Adventure() {
  const t = useT()
  const l = useLocalized()
  const progress = useProgress(MISSIONS)
  const chapters = pathChapters(MISSIONS)
  const ordered = chapters.flatMap((c) => c.missions)
  const next = progress.next(ordered)
  const played = ordered.filter((x) => progress.status(x) === 'done').length
  const [open, setOpen] = useState<Mission | null>(null)

  // One list of rows: a sign for each chapter, then its stops.
  type Row = { kind: 'sign'; title: string } | { kind: 'stop'; mission: Mission; x: number }
  const rows: Row[] = []
  let k = 0
  for (const c of chapters) {
    rows.push({ kind: 'sign', title: l(c.title) })
    for (const mission of c.missions) rows.push({ kind: 'stop', mission, x: XS[k++ % XS.length]! })
  }
  const points = rows.map((r, i) => [r.kind === 'stop' ? r.x : 50, i * ROW + ROW / 2] as const)
  const road = points.map(([x, y], i) => (i === 0 ? `M${x} ${y}` : `C${points[i - 1]![0]} ${y - ROW / 2} ${x} ${points[i - 1]![1] + ROW / 2} ${x} ${y}`)).join(' ')

  return (
    <Screen nav>
      <TopBar title={t('path.title')} />
      <div className="flex flex-col gap-3 px-4 pb-32 short:pb-8">
        {/* Progress: gems for played missions */}
        <Link to="/collection" className="press flex items-center gap-3 rounded-full bg-white py-2 pr-4 pl-2 shadow-soft">
          <img src={img(ART.gemGreen)} alt="" className="pop-3d size-11 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-extrabold">{t('path.progress', { done: played, total: ordered.length })}</span>
            <span className="mt-1 block h-2.5 overflow-hidden rounded-full bg-sand" aria-hidden="true">
              <span className="block h-full rounded-full bg-green" style={{ width: `${(played / ordered.length) * 100}%` }} />
            </span>
          </span>
          <Icon name="chevron" className="shrink-0 text-muted" />
        </Link>

        <div className="relative" style={{ height: `calc(${rows.length} * var(--path-row))` }}>
          {/* The road */}
          <svg viewBox={`0 0 100 ${rows.length * ROW}`} preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true" focusable="false">
            <path d={road} fill="none" stroke="#EADBB4" strokeWidth={26} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path d={road} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="2 14" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>

          <ol className="relative" aria-label={t('path.title')}>
            {rows.map((r, i) =>
              r.kind === 'sign' ? (
                <li key={`sign-${i}`} className="relative flex h-[var(--path-row)] items-center justify-center">
                  <span className="relative grid w-[min(9rem,44vw)] place-items-center">
                    <img src={img(ART.sign)} alt="" className="pop-3d w-full" />
                    <span className="absolute top-[8%] flex h-[34%] w-[80%] items-center justify-center text-center text-[length:min(0.9rem,3.8vw)] leading-tight font-black text-[#4A2A12]">
                      {r.title}
                    </span>
                  </span>
                </li>
              ) : (
                <Stop
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
      {open && <StopSheet mission={open} status={progress.status(open)} onClose={() => setOpen(null)} />}
    </Screen>
  )
}

function Stop({
  mission,
  x,
  status,
  isNew,
  isNext,
  onOpen,
}: {
  mission: Mission
  x: number
  status: 'locked' | 'open' | 'done'
  isNew: boolean
  isNext: boolean
  onOpen: () => void
}) {
  const t = useT()
  const l = useLocalized()
  const art = stopArt(mission, status !== 'locked')
  const label = `${l(mission.title)} – ${status === 'done' ? t('missions.done') : status === 'locked' ? t('path.locked') : t('path.play')}`
  return (
    <li className="relative h-[var(--path-row)]">
      <div className="absolute top-1/2 flex w-[min(9.5rem,40vw)] -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${x}%` }}>
        <button
          type="button"
          onClick={onOpen}
          aria-label={label}
          className={`press relative grid size-[min(5.75rem,24vw)] place-items-center rounded-full shadow-float ${
            status === 'done' ? 'bg-gold-soft ring-4 ring-gold' : status === 'open' ? 'bg-white ring-4 ring-coral' : 'bg-sand'
          }`}
        >
          {isNext && <span className="anim-glow pointer-events-none absolute inset-[-14%] rounded-full bg-coral/25" aria-hidden="true" />}
          {art.badge ? (
            <BadgeArt icon={art.src} earned={status !== 'locked'} className="size-[86%]" />
          ) : (
            <img src={img(art.src)} alt="" className={`pop-3d size-[84%] object-contain ${status === 'locked' ? 'opacity-45 grayscale' : ''}`} />
          )}
          {status === 'locked' && <img src={img(ART.key)} alt="" className="absolute -right-1 -bottom-1 size-10 drop-shadow" />}
          {status === 'done' && (
            <span className="absolute -right-1 -bottom-1 grid size-9 place-items-center rounded-full bg-green-dark text-white ring-[3px] ring-white" aria-hidden="true">
              <Icon name="check" width="1.1em" height="1.1em" />
            </span>
          )}
          {isNew && (
            <m.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: -8 }}
              transition={bouncy}
              className="absolute -top-2 -left-3 rounded-full bg-coral px-2.5 py-0.5 text-xs font-black text-coral-ink shadow-soft"
              aria-hidden="true"
            >
              {t('unlock.new')}
            </m.span>
          )}
        </button>
        <span
          className={`mt-1.5 line-clamp-2 rounded-full px-2.5 py-0.5 text-center text-[length:min(0.85rem,3.6vw)] leading-tight font-extrabold ${
            status === 'locked' ? 'bg-white/70 text-muted' : 'bg-white text-ink shadow-soft'
          }`}
          aria-hidden="true"
        >
          {l(mission.title)}
        </span>
      </div>
      {isNext && (
        <img
          src={img(ART.balloon)}
          alt={t('path.here')}
          className="anim-float pointer-events-none absolute top-[4%] size-[min(4.5rem,19vw)]"
          style={{ left: `${x < 50 ? x + 22 : x - 38}%` }}
        />
      )}
    </li>
  )
}

/** Details of a stop: what games await, and Play — or how it opens. Closes with Esc or the × button. */
function StopSheet({ mission, status, onClose }: { mission: Mission; status: 'locked' | 'open' | 'done'; onClose: () => void }) {
  const t = useT()
  const l = useLocalized()
  const level = ageToLevel(useAge())
  const game = pickLevel(mission, level).content.game.type
  const art = stopArt(mission, status !== 'locked')
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/30 short:items-center" onClick={onClose}>
      <m.div
        role="dialog"
        aria-modal="true"
        aria-label={l(mission.title)}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={bouncy}
        onClick={(e) => e.stopPropagation()}
        className="relative m-3 flex w-full max-w-md flex-col gap-3 rounded-[2rem] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-float"
      >
        <button type="button" onClick={onClose} aria-label={t('path.close')} className="tap press absolute top-1 right-1 grid place-items-center rounded-full text-muted">
          <Icon name="close" />
        </button>
        <div className="flex items-center gap-3 pr-10">
          {art.badge ? (
            <BadgeArt icon={art.src} earned={status !== 'locked'} className="size-20 shrink-0" />
          ) : (
            <img src={img(art.src)} alt="" className={`pop-3d size-20 shrink-0 object-contain ${status === 'locked' ? 'opacity-50 grayscale' : ''}`} />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black tracking-wide text-coral-dark uppercase">{t(`subject.${mission.subject}`)}</p>
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
            autoFocus
            className="tap press puck flex items-center justify-center gap-2 rounded-full bg-coral px-6 text-xl font-extrabold text-coral-ink [--edge:var(--color-coral-deep)]"
          >
            <Icon name={status === 'done' ? 'refresh' : 'play'} />
            {status === 'done' ? t('path.replay') : t('path.play')}
          </Link>
        )}
      </m.div>
    </div>
  )
}
