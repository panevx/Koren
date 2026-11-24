import { useState } from 'react'
import { Link } from 'react-router'
import { Avatar, img } from '../components/Brand'
import { Screen, TopBar } from '../components/ui'
import { PRACTICE_SIZE, addDays, dueToday, reviewKey } from '../content/habits'
import { MISSIONS, missionById } from '../content/missions'
import type { Question } from '../content/schema'
import { localDay } from '../content/shop'
import { useLocalized } from '../content/useLocalized'
import { Quiz } from '../games/Quiz'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { play } from '../sound'
import { saveProfileChange, useActiveProfile, useProfiles, type Profile } from '../store/profiles'
import { ART } from '../world'

type Item = { key: string; question: Question; mission: string }

/** The question behind a key („mission|level|where|index“), if the mission still has it. */
function questionOf(key: string): Item | null {
  const [id, level, where, at] = key.split('|')
  const content = missionById(id ?? '')?.levels[level as 'small']
  if (!content) return null
  const list = where === 'check' ? content.check : where === 'game' ? content.game : where === 'extra' ? content.extra : undefined
  const questions = Array.isArray(list) ? list : list?.type === 'quiz' ? list.questions : undefined
  const question = questions?.[Number(at)]
  return question ? { key, question, mission: id! } : null
}

/** A number from text — the same every time (so the day's practice does not change on reload). */
const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7)

/**
 * Today's practice: first the questions that came back (missed 1, 3 or 7 days ago), then — so there is always something —
 * questions from missions the child has played, at the level it played them, different each day.
 */
export function practiceFor(profile: Pick<Profile, 'done' | 'review'>, today = localDay()): Item[] {
  const items = dueToday(profile.review, today).map(questionOf).filter((x): x is Item => x !== null).slice(0, PRACTICE_SIZE)
  const taken = new Set(items.map((x) => x.key))
  const pool: string[] = []
  for (const [id, done] of Object.entries(profile.done)) {
    const check = MISSIONS.find((x) => x.id === id)?.levels[done.level]?.check ?? []
    check.forEach((_, i) => pool.push(reviewKey(id, done.level, 'check', i)))
  }
  pool.sort((a, b) => hash(today + a) - hash(today + b))
  for (const key of pool) {
    if (items.length >= PRACTICE_SIZE) break
    if (taken.has(key)) continue
    const item = questionOf(key)
    if (item && !items.some((x) => x.mission === item.mission)) items.push(item)
  }
  return items
}

/** v0.27: practice — five quick questions, the missed ones first. Counts as the day's adventure. */
export function Practice() {
  const t = useT()
  const l = useLocalized()
  const profile = useActiveProfile()
  const noteAnswers = useProfiles((s) => s.noteAnswers)
  const practiced = useProfiles((s) => s.practiced)
  const [items] = useState(() => practiceFor(profile))
  const [dayWasNew] = useState(() => !profile.days.includes(localDay()))
  const [index, setIndex] = useState(0)
  const [right, setRight] = useState(0)
  const [finished, setFinished] = useState(false)
  // how many questions come back tomorrow (the ones missed just now and the ones already waiting for tomorrow)
  const back = Object.values(profile.review).filter((r) => r.due === addDays(localDay(), 1)).length

  if (!items.length) {
    return (
      <Screen nav>
        <TopBar title={t('practice.title')} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <Avatar hero="raya" mood="thoughtful" className="size-24" />
          <p className="text-lg font-bold">{t('practice.empty')}</p>
          <Link to="/missions" className="btn-satin tint-green tap flex items-center rounded-full px-6 text-xl font-black text-white">
            {t('practice.toPath')}
          </Link>
        </div>
      </Screen>
    )
  }

  if (finished) {
    return (
      <Screen nav>
        <TopBar title={t('practice.title')} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <m.div initial={{ scale: 0.5, y: 20 }} animate={{ scale: 1, y: 0 }} transition={bouncy}>
            <Avatar hero="koren" mood="laughter" className="size-28" />
          </m.div>
          <h2 className="text-headline text-green-dark">{t('practice.done')}</h2>
          <p className="text-lg font-bold">{t('practice.score', { n: right, total: items.length })}</p>
          {dayWasNew && (
            <p className="fill-satin tint-gold edge-light flex items-center gap-2 rounded-full px-4 py-1.5 font-black text-ink">
              <img src={img(ART.coin)} alt="" className="size-7" />
              {t('practice.day')}
            </p>
          )}
          {back > 0 && <p className="font-semibold text-muted">{t('practice.tomorrow', { n: back })}</p>}
          <Link to="/home" className="btn-satin tint-green tap mt-2 flex items-center rounded-full px-6 text-xl font-black text-white">
            {t('badge.home')}
          </Link>
        </div>
      </Screen>
    )
  }

  const current = items[index]!
  return (
    <Screen>
      <TopBar title={t('practice.title')} />
      <div className="flex flex-1 flex-col gap-3 px-4 pb-8">
        <p className="text-center text-sm font-extrabold text-muted">{t('practice.from', { name: l(missionById(current.mission)!.title) })}</p>
        <Quiz
          questions={items.map((x) => x.question)}
          onIndex={setIndex}
          onAnswer={(i, ok) => {
            if (ok) setRight((n) => n + 1)
            saveProfileChange(() => noteAnswers([{ key: items[i]!.key, right: ok }], true))
          }}
          onDone={() => {
            saveProfileChange(() => practiced())
            play('badge')
            setFinished(true)
          }}
        />
      </div>
    </Screen>
  )
}
