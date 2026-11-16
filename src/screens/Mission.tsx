import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router'
import { BadgeArt } from '../components/BadgeArt'
import { Avatar, img, Scenery } from '../components/Brand'
import { Icon } from '../components/Icon'
import { Button, Screen, useTitle } from '../components/ui'
import { missionById, pickLevel } from '../content/missions'
import { useChildMissions } from '../content/useChildMissions'
import { isUnlocked, reachedMilestones, unlockedIds, type MilestoneId } from '../content/progress'
import { earnedCount } from '../content/badges'
import { UnlockInfo } from '../components/UnlockInfo'
import { RewardModal } from '../components/RewardModal'
import { wallet } from '../content/rewards'
import { ART, GAME_ART } from '../world'
import type { Mission as MissionData, StoryLine } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { GameView } from '../games'
import { Quiz } from '../games/Quiz'
import type { TKey } from '../i18n'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { play } from '../sound'
import { BREAK_AFTER, activeProfile, useActiveProfile, useAge, useProfiles } from '../store/profiles'
import { ageToLevel, type Level } from '../theme/levels'

type Phase = 'story' | 'game' | 'check' | 'badge'

export function Mission() {
  const { id } = useParams()
  const mission = missionById(id)
  const age = useAge()
  const profile = useActiveProfile()
  const missions = useChildMissions()
  if (!mission) return <Navigate to="/missions" replace />
  if (!isUnlocked(mission, profile, missions)) return <Locked mission={mission} />
  // The level is fixed when the mission starts, so changing age mid-game cannot reshuffle it.
  return <MissionRun key={mission.id} mission={mission} childLevel={ageToLevel(age)} />
}

/** A locked mission opened from a link: say kindly how it opens. Never a dead end. */
function Locked({ mission }: { mission: MissionData }) {
  const t = useT()
  const l = useLocalized()
  const navigate = useNavigate()
  useTitle(l(mission.title))
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-8 text-center">
        <m.img
          src={img(ART.key)}
          alt=""
          initial={{ rotate: -30, scale: 0.6 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={bouncy}
          className="pop-3d size-28"
        />
        <h1 className="text-2xl font-black">{l(mission.title)}</h1>
        <p className="rounded-full bg-sand px-4 py-1 text-sm font-extrabold">{t('unlock.locked')}</p>
        <div className="rounded-level flex w-full items-start gap-3 bg-white p-4 text-left shadow-soft">
          <Avatar hero="raya" mood="determination" className="size-14 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="mb-1 font-semibold text-muted">{t('unlock.lockedText')}</p>
            <UnlockInfo mission={mission} />
          </div>
        </div>
        <Button variant="accent" className="w-full" onClick={() => navigate('/missions')}>
          {t('unlock.toPath')}
        </Button>
      </div>
    </Screen>
  )
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
  useTitle(l(mission.title))
  const markSeen = useProfiles((s) => s.markSeen)
  useEffect(() => markSeen(mission.id), [markSeen, mission.id])
  // Each phase is its own history entry: the phone's "back" gesture goes one step back
  // (game → story) instead of throwing the child out of the mission.
  const location = useLocation()
  const saved = (location.state as { phase?: Phase } | null)?.phase
  const phase: Phase = saved && phases.includes(saved) ? saved : 'story'
  const next = () => {
    const to = phases[phases.indexOf(phase) + 1] ?? 'badge'
    // The badge replaces the last step, so "back" from the badge cannot replay the quiz and count it twice.
    navigate(location.pathname, { state: { phase: to }, replace: to === 'badge' })
  }
  // Leaving in the middle of a game asks once more ("tap again to leave") — no lost progress by accident.
  const [confirming, setConfirming] = useState(false)
  useEffect(() => {
    if (!confirming) return
    const timer = setTimeout(() => setConfirming(false), 4000)
    return () => clearTimeout(timer)
  }, [confirming])
  const exit = () => {
    if (phase === 'story' || phase === 'badge' || confirming) navigate('/missions')
    else setConfirming(true)
  }

  return (
    // Wide landscape screen: a wider column, so the story can sit beside the hero.
    <Screen className="side:max-w-3xl">
      <GameHeader
        title={l(mission.title)}
        phases={phases}
        phase={phase}
        game={content.game.type}
        exitLabel={confirming ? t('mission.exitConfirm') : t('mission.exit')}
        confirming={confirming}
        onExit={exit}
      />

      <div className="flex flex-1 flex-col px-4 pb-6">
        {mission.draft && (
          <p className="mb-3 self-center rounded-full bg-sand px-3 py-1 text-center text-xs font-bold text-ink short:mb-1">{t('missions.draft')}</p>
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

const PHASE_ART: Record<Exclude<Phase, 'game'>, string> = { story: ART.scroll, check: ART.orb, badge: ART.gold }

/**
 * The game header: a way out (asks twice in the middle of a game), the mission's name and the steps of the
 * mission as stepping stones with pictures — story, game, check, badge. Done steps are green, the current one
 * is lifted and glowing, a filled line runs between them.
 */
function GameHeader({
  title,
  phases,
  phase,
  game,
  exitLabel,
  confirming,
  onExit,
}: {
  title: string
  phases: Phase[]
  phase: Phase
  game: string
  exitLabel: string
  confirming: boolean
  onExit: () => void
}) {
  const t = useT()
  const at = phases.indexOf(phase)
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 bg-cream/95 px-4 pt-3 pb-2 backdrop-blur-sm short:pt-1.5 short:pb-1">
      <button
        type="button"
        onClick={onExit}
        className={`tap press flex shrink-0 items-center gap-1 rounded-full pr-4 pl-3 font-extrabold shadow-soft transition-colors ${
          confirming ? 'bg-coral text-coral-ink' : 'bg-white text-ink'
        }`}
      >
        <Icon name="close" />
        {exitLabel}
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm leading-tight font-black text-green-dark">{title}</p>
        <ol className="relative mt-1 flex items-center justify-between" aria-label={t('mission.progress', { n: at + 1, total: phases.length })} role="img">
          {/* the line between the stones, filled up to the current step */}
          <span className="absolute inset-x-3 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-sand" aria-hidden="true">
            <span
              className="block h-full origin-left rounded-full bg-green transition-transform duration-700 ease-[var(--ease-calm)]"
              style={{ transform: `scaleX(${phases.length > 1 ? at / (phases.length - 1) : 1})` }}
            />
          </span>
          {phases.map((p, i) => (
            <li
              key={p}
              title={t(`mission.phase.${p}` as TKey)}
              className={`relative grid size-8 place-items-center rounded-full transition-transform duration-500 ease-[var(--ease-spring)] ${
                i < at ? 'bg-green-soft ring-2 ring-green' : i === at ? 'scale-125 bg-white shadow-float ring-[3px] ring-coral' : 'bg-white ring-2 ring-sand'
              }`}
            >
              <img src={img(p === 'game' ? (GAME_ART[game] ?? ART.orb) : PHASE_ART[p])} alt="" className={`size-[78%] object-contain ${i > at ? 'opacity-40 grayscale' : ''}`} />
            </li>
          ))}
        </ol>
      </div>
    </header>
  )
}

/**
 * The story: Koren and Raya speak on a little stage — sky, hills, a fortress — the hero walking in from their side,
 * the speech bubble above them with its tail pointing down at the speaker. On a wide screen the bubble sits beside.
 */
function Story({ lines, onDone }: { lines: StoryLine[]; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const [i, setI] = useState(0)
  const line = lines[i]!
  const last = i === lines.length - 1
  const fromRight = line.hero === 'raya'
  return (
    <div className="flex flex-1 flex-col gap-3">
      <p className="sr-only">{t('mission.progress', { n: i + 1, total: lines.length })}</p>
      <div className="relative flex min-h-[min(27rem,62dvh)] flex-1 flex-col overflow-hidden rounded-[var(--radius-stage)] shadow-soft short:min-h-0 side:flex-row-reverse side:items-end">
        {/* The fortress of the backdrop would peek out behind a story object — it steps aside. */}
        <Scenery className="absolute inset-0" castle={!line.img} />
        {/* the speech bubble */}
        <m.p
          key={i}
          initial={{ opacity: 0, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={bouncy}
          aria-live="polite"
          className={`relative z-10 m-3 rounded-[1.75rem] bg-white px-5 py-4 text-[length:min(1.25rem,5.6vw)] leading-snug font-bold shadow-float side:mb-auto side:min-w-0 side:flex-1 ${
            fromRight ? 'origin-bottom-right rounded-br-md' : 'origin-bottom-left rounded-bl-md'
          }`}
        >
          {l(line)}
          {/* tail towards the speaker */}
          <span
            className={`absolute -bottom-2.5 size-6 rotate-45 rounded-[4px] bg-white side:hidden ${fromRight ? 'right-[22%]' : 'left-[22%]'}`}
            aria-hidden="true"
          />
        </m.p>
        {/* What the line is about (a 3D object from public/img) stands on the hill across from the speaker.
            Wide screens put the hero on the left (row-reverse), so there the object always stands on the right. */}
        {line.img && (
          <m.img
            key={`obj-${i}`}
            src={img(line.img)}
            alt=""
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ ...bouncy, delay: 0.15 }}
            className={`pop-3d absolute bottom-[7%] z-[1] max-h-[min(12rem,28dvh)] w-[44%] object-contain object-bottom short:bottom-[3%] short:max-h-[19dvh] short:w-[24%] side:right-[4%] side:left-auto side:w-[32%] ${fromRight ? 'left-[5%]' : 'right-[5%]'}`}
          />
        )}
        {/* the hero walks in from their side and stands on the hill */}
        <div className={`relative mt-auto flex px-4 side:mt-0 side:shrink-0 ${fromRight ? 'justify-end' : 'justify-start'}`}>
          <span className={`absolute bottom-2 h-4 w-[34%] rounded-[50%] bg-ink/20 blur-[3px] ${fromRight ? 'right-[8%]' : 'left-[8%]'}`} aria-hidden="true" />
          <m.img
            key={`${i}-${line.hero}-${line.pose}`}
            src={img(`poses/${line.hero}-${line.pose}.webp`)}
            alt=""
            initial={{ opacity: 0, x: fromRight ? 70 : -70, rotate: fromRight ? 8 : -8 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={bouncy}
            className="relative h-[min(17rem,36dvh)] w-auto object-contain short:h-[40dvh]"
          />
        </div>
        {/* which line we are on: small stones on the stage */}
        {lines.length > 1 && (
          <span className="absolute right-0 bottom-3 left-0 flex justify-center gap-1.5 side:hidden" aria-hidden="true">
            {lines.map((_, n) => (
              <span key={n} className={`size-2 rounded-full transition-transform duration-300 ${n === i ? 'scale-150 bg-white' : 'bg-white/60'}`} />
            ))}
          </span>
        )}
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
  const profile = useActiveProfile()
  const missions = useChildMissions()
  // What was open and which rewards were reached BEFORE this badge — the difference is celebrated below.
  const [before] = useState(() => {
    const p = activeProfile(useProfiles.getState())
    const w = wallet(p, missions)
    return { open: unlockedIds(p, missions), rewards: reachedMilestones(earnedCount(p.badges, missions), missions), coins: w.earnedCoins, pendars: w.earnedPendars }
  })
  // v0.22: what this badge brought to the purse (a replayed mission brings nothing new — and says nothing)
  const purse = wallet(profile, missions)
  const gotCoins = purse.earnedCoins - before.coins
  const gotPendars = purse.earnedPendars - before.pendars
  const opened = unlockedIds(profile, missions)
    .filter((id) => !before.open.includes(id))
    .map((id) => missionById(id)!)
  const rewards = reachedMilestones(earnedCount(profile.badges, missions), missions).filter((r) => !before.rewards.includes(r))
  // Count the mission exactly once, even if React runs the effect twice (StrictMode).
  const counted = useRef(false)
  useEffect(() => {
    if (counted.current) return
    counted.current = true
    complete(mission.id, level, mission.badge.id)
    play('badge')
  }, [complete, mission, level])
  const needsBreak = streak >= BREAK_AFTER
  // A new medal gets its own moment: the reward window opens once the badge has landed.
  const best = rewards[rewards.length - 1]
  const [shown, setShown] = useState<MilestoneId | null>(null)
  const [closed, setClosed] = useState(false)
  useEffect(() => {
    if (!best || closed) return
    const timer = setTimeout(() => setShown(best), 1300)
    return () => clearTimeout(timer)
  }, [best, closed])

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
      {(gotCoins > 0 || gotPendars > 0) && (
        <m.p
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...bouncy, delay: 0.9 }}
          className="flex items-center gap-2 rounded-full bg-gold-soft px-4 py-1.5 font-black text-ink"
        >
          <img src={img(ART.coin)} alt="" className="size-7" />
          {t('badge.coins', { n: gotCoins })}
          {gotPendars > 0 && (
            <>
              <img src={img(ART.pendar)} alt="" className="ml-1 size-7" />
              {t('badge.pendar', { n: gotPendars })}
            </>
          )}
        </m.p>
      )}
      {shown && !closed && (
        <RewardModal
          reward={shown}
          onClose={() => {
            setClosed(true)
            setShown(null)
          }}
        />
      )}

      {(opened.length > 0 || rewards.length > 0) && <Unlocked missions={opened} rewards={rewards} />}

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

const REWARD_ART: Record<MilestoneId, string> = { bronze: ART.bronze, silver: ART.silver, gold: ART.gold, trophy: ART.trophy }

/** After a badge: newly opened missions (with a key) and new medals, each popping in after the badge. */
function Unlocked({ missions, rewards }: { missions: MissionData[]; rewards: MilestoneId[] }) {
  const t = useT()
  const l = useLocalized()
  const navigate = useNavigate()
  return (
    <m.ul
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { delayChildren: 1.2, staggerChildren: 0.25 } } }}
      className="flex w-full flex-col gap-2.5"
      aria-live="polite"
    >
      {rewards.map((r) => (
        <m.li key={r} variants={{ hidden: { opacity: 0, scale: 0.6 }, show: { opacity: 1, scale: 1 } }} transition={bouncy}>
          <div className="rounded-level flex items-center gap-3 bg-gold-soft p-3 text-left shadow-soft">
            <img src={img(REWARD_ART[r])} alt="" className="pop-3d size-14 shrink-0 object-contain" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-black tracking-wide text-coral-dark uppercase">{t('reward.new')}</span>
              <span className="block font-extrabold">{t(`reward.${r}`)}</span>
            </span>
          </div>
        </m.li>
      ))}
      {missions.map((mission) => (
        <m.li key={mission.id} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} transition={bouncy}>
          <button
            type="button"
            onClick={() => navigate(`/mission/${mission.id}`)}
            className="tap press rounded-level flex w-full items-center gap-3 bg-sky-soft p-3 text-left shadow-soft"
          >
            <span className="relative grid size-14 shrink-0 place-items-center">
              <img src={img(ART.burst)} alt="" className="anim-spin-slow absolute inset-0 size-full" />
              <img src={img(ART.key)} alt="" className="relative size-9" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-black tracking-wide text-ink uppercase">{t('unlock.opened')}</span>
              <span className="block font-extrabold">{l(mission.title)}</span>
            </span>
            <Icon name="chevron" className="shrink-0" />
          </button>
        </m.li>
      ))}
    </m.ul>
  )
}
