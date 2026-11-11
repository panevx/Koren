import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
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
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-cream/95 px-3 pt-3 pb-2 backdrop-blur">
        <button
          type="button"
          onClick={exit}
          className="tap flex shrink-0 items-center gap-1 rounded-full border-2 border-sand bg-white px-3 font-extrabold text-ink hover:border-red"
        >
          <Icon name="close" />
          {t('mission.exit')}
        </button>
        <div className="flex-1">
          <p className="truncate text-sm font-black text-green-dark">{l(mission.title)}</p>
          <PhaseDots phases={phases} current={phase} />
        </div>
      </header>

      <div className="flex flex-1 flex-col px-4 pt-2 pb-6">
        {mission.draft && (
          <p className="mb-3 rounded-full bg-gold/25 px-3 py-1 text-center text-xs font-bold text-ink">
            {t('missions.draft')}
          </p>
        )}
        {phase === 'story' && <Story lines={content.story} onDone={next} />}
        {phase === 'game' && <GameView game={content.game} onDone={next} />}
        {phase === 'check' && <Quiz questions={content.check} title={t('check.title')} onDone={next} />}
        {phase === 'badge' && <Badge mission={mission} level={level} />}
      </div>
    </Screen>
  )
}

function PhaseDots({ phases, current }: { phases: Phase[]; current: Phase }) {
  const t = useT()
  const at = phases.indexOf(current)
  return (
    <div className="mt-1 flex items-center gap-1.5" aria-label={t('mission.progress', { n: at + 1, total: phases.length })} role="img">
      {phases.map((p, i) => (
        <span
          key={p}
          title={t(`mission.phase.${p}` as TKey)}
          className={`h-2 flex-1 rounded-full ${i < at ? 'bg-green' : i === at ? 'bg-[var(--accent)]' : 'bg-sand'}`}
        />
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
  return (
    <div className="flex flex-1 flex-col gap-3">
      <p className="text-center text-sm font-bold text-muted">{t('mission.progress', { n: i + 1, total: lines.length })}</p>
      <div className="relative flex flex-1 flex-col">
        <p
          key={i}
          aria-live="polite"
          className="rounded-level relative z-10 rounded-bl-sm border-2 border-sand bg-white px-4 py-4 text-xl leading-snug font-bold shadow-md"
        >
          {l(line)}
        </p>
        {line.img && <img src={img(line.img)} alt="" className="rounded-level mt-3 w-full object-cover" />}
        <img
          src={img(`poses/${line.hero}-${line.pose}.webp`)}
          alt=""
          className={`mt-2 h-[34dvh] max-h-80 w-auto object-contain drop-shadow-md ${line.hero === 'raya' ? 'self-end' : 'self-start'}`}
        />
      </div>
      <div className="flex gap-3">
        {i > 0 && (
          <Button variant="secondary" onClick={() => setI(i - 1)} aria-label={t('mission.prev')}>
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
    <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
      <h2 className="text-3xl font-black text-green-dark">{t('badge.title')}</h2>
      <div className="grid size-48 place-items-center rounded-full bg-gold p-3 shadow-[0_6px_0_#d49a00]">
        <div className="grid size-full place-items-center rounded-full border-4 border-white bg-cream">
          <img src={img(mission.badge.icon)} alt="" className="size-28 object-contain" />
        </div>
      </div>
      <p className="text-xl font-extrabold">{l(mission.title)}</p>

      {needsBreak ? (
        // After 3 missions in a row Koren and Raya suggest a pause — a suggestion, never a lock.
        <section className="rounded-level flex w-full flex-col gap-3 border-2 border-sky bg-sky/15 p-4" aria-live="polite">
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
          <div className="flex -space-x-3" aria-hidden="true">
            <Avatar hero="raya" mood="laughter" className="size-16" />
            <Avatar hero="koren" mood="laughter" className="size-16" />
          </div>
          <div className="flex w-full flex-col gap-3">
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
