import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { BadgeArt } from '../components/BadgeArt'
import { Avatar, img } from '../components/Brand'
import { Icon } from '../components/Icon'
import { Button, Screen } from '../components/ui'
import { missionById, pickLevel } from '../content/missions'
import type { Mission as MissionData, StoryLine } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { GameView } from '../games'
import { Quiz } from '../games/Quiz'
import type { TKey } from '../i18n'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { play } from '../sound'
import { BREAK_AFTER, useAge, useProfiles } from '../store/profiles'
import { ageToLevel, type Level } from '../theme/levels'

type Phase = 'story' | 'game' | 'check' | 'badge'

export function Mission() {
  const { id } = useParams()
  const mission = missionById(id)
  const age = useAge()
  if (!mission) return <Navigate to="/missions" replace />
  // The level is fixed when the mission starts, so changing age mid-game cannot reshuffle it.
  return <MissionRun key={mission.id} mission={mission} childLevel={ageToLevel(age)} />
}

function MissionRun({ mission, childLevel }: { mission: MissionData; childLevel: Level }) {
  const t = useT()
  const l = useLocalized()
  const navigate = useNavigate()
  const [{ level, content }] = useState(() => pickLevel(mission, childLevel))
  const phases = useMemo<Phase[]>(
    () => ['story', 'game', ...(content.check.length ? (['check'] as const) : []), 'badge'],
    [content],
  )
  const [phase, setPhase] = useState<Phase>('story')
  const next = () => setPhase(phases[phases.indexOf(phase) + 1] ?? 'badge')
  const exit = () => navigate('/missions')

  return (
    <Screen>
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-cream px-4 pt-4 pb-3">
        <button
          type="button"
          onClick={exit}
          className="tap press flex shrink-0 items-center gap-1 rounded-full bg-white pr-4 pl-3 font-extrabold text-ink shadow-soft"
        >
          <Icon name="close" />
          {t('mission.exit')}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-green-dark">{l(mission.title)}</p>
          <PhaseDots phases={phases} current={phase} />
        </div>
      </header>

      <div className="flex flex-1 flex-col px-4 pb-6">
        {mission.draft && (
          <p className="mb-3 self-center rounded-full bg-sand px-3 py-1 text-center text-xs font-bold text-ink">{t('missions.draft')}</p>
        )}
        {/* Each phase slides in like a new page. */}
        <m.div key={phase} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} className="flex flex-1 flex-col">
          {phase === 'story' && <Story lines={content.story} onDone={next} />}
          {phase === 'game' && <GameView game={content.game} onDone={next} />}
          {phase === 'check' && <Quiz questions={content.check} title={t('check.title')} onDone={next} />}
          {phase === 'badge' && <Badge mission={mission} level={level} />}
        </m.div>
      </div>
    </Screen>
  )
}

function PhaseDots({ phases, current }: { phases: Phase[]; current: Phase }) {
  const t = useT()
  const at = phases.indexOf(current)
  return (
    <div className="mt-1.5 flex items-center gap-1.5" aria-label={t('mission.progress', { n: at + 1, total: phases.length })} role="img">
      {phases.map((p, i) => (
        <span key={p} title={t(`mission.phase.${p}` as TKey)} className="h-2.5 flex-1 overflow-hidden rounded-full bg-sand">
          <span
            className={`block h-full origin-left rounded-full transition-transform duration-500 ease-out ${i < at ? 'bg-green' : 'bg-coral'} ${
              i <= at ? 'scale-x-100' : 'scale-x-0'
            }`}
          />
        </span>
      ))}
    </div>
  )
}

function Story({ lines, onDone }: { lines: StoryLine[]; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const [i, setI] = useState(0)
  const line = lines[i]!
  const last = i === lines.length - 1
  const fromRight = line.hero === 'raya'
  return (
    <div className="flex flex-1 flex-col gap-3">
      <p className="text-center text-sm font-bold text-muted">{t('mission.progress', { n: i + 1, total: lines.length })}</p>
      <div className="relative flex flex-1 flex-col">
        <m.p
          key={i}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          aria-live="polite"
          className={`relative z-10 rounded-[1.75rem] bg-white px-5 py-4 text-xl leading-snug font-bold shadow-soft ${
            fromRight ? 'rounded-br-md' : 'rounded-bl-md'
          }`}
        >
          {l(line)}
        </m.p>
        {line.img && <img src={img(line.img)} alt="" className="rounded-level mt-3 w-full object-cover shadow-soft" />}
        {/* The hero walks in from their side and stands on a soft "stage". */}
        <div className={`relative mt-3 flex ${fromRight ? 'justify-end pr-3' : 'justify-start pl-3'}`}>
          <span className="absolute bottom-0 h-[70%] w-[62%] rounded-[45%] bg-sky-soft" aria-hidden="true" />
          <span className="absolute bottom-1 h-4 w-[38%] rounded-[50%] bg-ink/15 blur-[3px]" aria-hidden="true" />
          <m.img
            key={`${i}-${line.hero}-${line.pose}`}
            src={img(`poses/${line.hero}-${line.pose}.webp`)}
            alt=""
            initial={{ opacity: 0, x: fromRight ? 70 : -70, rotate: fromRight ? 8 : -8 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={bouncy}
            className="relative h-[34dvh] max-h-80 w-auto object-contain"
          />
        </div>
      </div>
      <div className="flex gap-3">
        {i > 0 && (
          <Button variant="secondary" className="px-5" onClick={() => setI(i - 1)} aria-label={t('mission.prev')}>
            <Icon name="back" />
          </Button>
        )}
        <Button variant="accent" className="flex-1" onClick={() => (last ? onDone() : setI(i + 1))}>
          {t('mission.next')}
          <Icon name="chevron" />
        </Button>
      </div>
    </div>
  )
}

/** Confetti pieces flying out from behind the badge (fixed pattern — no randomness, no re-render jitter). */
const CONFETTI = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2 + (i % 3) * 0.3
  const dist = 105 + (i % 4) * 24
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist - 24,
    rotate: (i % 2 ? 1 : -1) * (140 + i * 22),
    color: ['bg-coral', 'bg-gold', 'bg-sky', 'bg-green', 'bg-mint'][i % 5]!,
    shape: i % 3 === 0 ? 'h-3.5 w-1.5 rounded-sm' : i % 3 === 1 ? 'size-2.5 rounded-full' : 'size-2.5 rounded-sm',
  }
})

function Badge({ mission, level }: { mission: MissionData; level: Level }) {
  const t = useT()
  const l = useLocalized()
  const navigate = useNavigate()
  const complete = useProfiles((s) => s.complete)
  const takeBreak = useProfiles((s) => s.takeBreak)
  const streak = useProfiles((s) => s.streak)
  // Count the mission exactly once, even if React runs the effect twice (StrictMode).
  const counted = useRef(false)
  useEffect(() => {
    if (counted.current) return
    counted.current = true
    complete(mission.id, level, mission.badge.id)
    play('badge')
  }, [complete, mission, level])
  const needsBreak = streak >= BREAK_AFTER

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <m.h2 initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-black text-green-dark">
        {t('badge.title')}
      </m.h2>

      {/* The reward: slowly turning rays, confetti, and the badge dropping in with a bounce. */}
      <div className="relative grid size-56 place-items-center" aria-hidden="true">
        <div
          className="anim-spin-slow absolute inset-0 rounded-full"
          style={{
            background: 'repeating-conic-gradient(from 0deg, var(--color-gold) 0 12deg, transparent 12deg 24deg)',
            WebkitMaskImage: 'radial-gradient(circle, #000 34%, transparent 70%)',
            maskImage: 'radial-gradient(circle, #000 34%, transparent 70%)',
            opacity: 0.55,
          }}
        />
        {CONFETTI.map((c, i) => (
          <m.span
            key={i}
            className={`absolute ${c.color} ${c.shape}`}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{ x: c.x, y: [0, c.y, c.y + 70], scale: [0, 1, 0.9], opacity: [0, 1, 0], rotate: c.rotate }}
            transition={{ duration: 1.4, delay: 0.3 + i * 0.012, ease: 'easeOut' }}
          />
        ))}
        <m.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 11, delay: 0.12 }}
          className="relative grid size-44 place-items-center overflow-hidden rounded-full shadow-[0_26px_34px_-14px_rgb(28_43_35/0.5)]"
        >
          <BadgeArt icon={mission.badge.icon} className="size-full" />
          {/* one glint of light across the medal */}
          <m.span
            className="absolute inset-y-0 w-10 -skew-x-12 bg-white/55"
            initial={{ x: -160 }}
            animate={{ x: 160 }}
            transition={{ duration: 0.7, delay: 0.75, ease: 'easeInOut' }}
          />
        </m.div>
      </div>

      <p className="text-xl font-extrabold">{l(mission.title)}</p>

      {needsBreak ? (
        // After 3 missions in a row Koren and Raya suggest a pause — a suggestion, never a lock.
        <section className="flex w-full flex-col gap-3 rounded-[2rem] bg-sky-soft p-5" aria-live="polite">
          <div className="flex items-center justify-center -space-x-3" aria-hidden="true">
            <Avatar hero="raya" mood="joy" className="size-14" />
            <Avatar hero="koren" mood="joy" className="size-14" />
          </div>
          <h3 className="text-xl font-black">{t('break.title')}</h3>
          <p className="font-semibold">{t('break.text', { n: streak })}</p>
          <Button
            variant="accent"
            onClick={() => {
              takeBreak()
              navigate('/home')
            }}
          >
            {t('break.rest')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              takeBreak()
              navigate('/missions')
            }}
          >
            {t('break.more')}
          </Button>
        </section>
      ) : (
        <>
          {/* Koren and Raya jump for joy. */}
          <div className="flex -space-x-3" aria-hidden="true">
            {(['raya', 'koren'] as const).map((hero, i) => (
              <m.div
                key={hero}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: [30, -16, 0, -8, 0] }}
                transition={{ duration: 0.9, delay: 0.5 + i * 0.12, ease: 'easeOut' }}
              >
                <Avatar hero={hero} mood="laughter" className="size-16" />
              </m.div>
            ))}
          </div>
          <div className="flex w-full flex-col gap-3.5">
            <Button variant="primary" onClick={() => navigate('/missions')}>
              {t('badge.more')}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/home')}>
              <Icon name="home" />
              {t('badge.home')}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
