import { beforeEach, describe, expect, it } from 'vitest'
import { COINS_PER_WEEK, REVIEW_DAYS, addDays, answer, dueToday, mondayOf, reviewKey, stampedWeeks, thisWeek } from '../src/content/habits'
import { MISSIONS } from '../src/content/missions'
import { COINS_PER_DAY, wallet } from '../src/content/rewards'
import { GIFT_EVERY, SHOP } from '../src/content/shop'
import { activeProfile, sanitizeProfile, useProfiles, withGift, type Profile } from '../src/store/profiles'
import { useSettings } from '../src/store/settings'
import { practiceFor } from '../src/screens/Practice'

beforeEach(() => {
  localStorage.clear()
  useSettings.getState().reset()
  useProfiles.getState().reset()
})

describe('the week (v0.27) — 3 days of 7, a missed day breaks nothing', () => {
  it('weeks start on Monday, across months and years', () => {
    expect(mondayOf('2026-11-24')).toBe('2026-11-23') // Tuesday
    expect(mondayOf('2026-11-29')).toBe('2026-11-23') // Sunday
    expect(mondayOf('2026-11-23')).toBe('2026-11-23')
    expect(mondayOf('2027-01-01')).toBe('2026-12-28')
    expect(addDays('2026-03-28', 2)).toBe('2026-03-30') // over the summer-time change
  })

  it('three days in a week earn the stamp — any three, not in a row', () => {
    const w = thisWeek(['2026-11-23', '2026-11-25'], '2026-11-26')
    expect(w.count).toBe(2)
    expect(w.stamped).toBe(false)
    expect(w.doneToday).toBe(false)
    expect(w.week.map((d) => d.future)).toEqual([false, false, false, false, true, true, true])
    expect(thisWeek(['2026-11-23', '2026-11-25', '2026-11-29'], '2026-11-29').stamped).toBe(true)
    expect(stampedWeeks(['2026-11-02', '2026-11-04', '2026-11-08', '2026-11-23', '2026-11-24', '2026-11-25', '2026-12-01'])).toBe(2)
  })

  it('a stamped week brings coins to the purse (calculated, never stored)', () => {
    const days = ['2026-11-23', '2026-11-24', '2026-11-25']
    expect(wallet({ done: {}, days, owned: [] }, MISSIONS).coins).toBe(3 * COINS_PER_DAY + COINS_PER_WEEK)
    expect(wallet({ done: {}, days: days.slice(0, 2), owned: [] }, MISSIONS).coins).toBe(2 * COINS_PER_DAY)
  })
})

describe('practice from mistakes (v0.27) — back after 1, 3 and 7 days', () => {
  const key = reviewKey('hist-01-asparuh', 'young', 'check', 0)

  it('a mistake comes back tomorrow; right answers in practice move it on until it is learned', () => {
    let r = answer({}, key, false, false, '2026-11-24')
    expect(r[key]).toEqual({ box: 0, due: '2026-11-25' })
    expect(dueToday(r, '2026-11-24')).toEqual([])
    expect(dueToday(r, '2026-11-25')).toEqual([key])
    r = answer(r, key, true, true, '2026-11-25')
    expect(r[key]).toEqual({ box: 1, due: addDays('2026-11-25', REVIEW_DAYS[1]) })
    r = answer(r, key, true, true, '2026-11-28')
    expect(r[key]).toEqual({ box: 2, due: addDays('2026-11-28', REVIEW_DAYS[2]) })
    r = answer(r, key, true, true, '2026-12-05')
    expect(r[key]).toBeUndefined()
  })

  it('a right answer in a mission changes nothing; a mistake in practice starts again', () => {
    const r = { [key]: { box: 2, due: '2026-12-01' } }
    expect(answer(r, key, true, false, '2026-11-24')).toBe(r)
    expect(answer(r, key, false, true, '2026-12-01')[key]).toEqual({ box: 0, due: '2026-12-02' })
  })

  it('the store keeps first-try answers; a practice makes the day count', () => {
    useProfiles.getState().noteAnswers([{ key, right: false }], false)
    expect(Object.keys(activeProfile(useProfiles.getState()).review)).toEqual([key])
    useProfiles.getState().practiced()
    expect(activeProfile(useProfiles.getState()).days).toHaveLength(1)
    useProfiles.getState().practiced()
    expect(activeProfile(useProfiles.getState()).days).toHaveLength(1)
  })

  it('practice: the missed questions first, then questions from played missions, one per mission, the same all day', () => {
    const played = MISSIONS.filter((m) => m.levels.young?.check.length).slice(0, 8)
    const done = Object.fromEntries(played.map((m) => [m.id, { level: 'young' as const, at: '2026-11-20' }]))
    const missed = reviewKey(played[3]!.id, 'young', 'check', 2)
    const items = practiceFor({ done, review: { [missed]: { box: 0, due: '2026-11-24' } } }, '2026-11-24')
    expect(items).toHaveLength(5)
    expect(items[0]!.key).toBe(missed)
    expect(items[0]!.question).toBe(played[3]!.levels.young!.check[2])
    expect(new Set(items.slice(1).map((x) => x.mission)).size).toBe(4)
    expect(practiceFor({ done, review: {} }, '2026-11-24').map((x) => x.key)).toEqual(practiceFor({ done, review: {} }, '2026-11-24').map((x) => x.key))
    expect(practiceFor({ done: {}, review: {} }, '2026-11-24')).toEqual([])
    // a question that no longer exists is skipped, never shown broken
    expect(practiceFor({ done: {}, review: { 'gone|young|check|0': { box: 0, due: '2026-11-01' } } }, '2026-11-24')).toEqual([])
  })

  it('old profiles load without the new fields; broken entries are dropped', () => {
    const p = sanitizeProfile({ id: 'x', review: { a: { box: 1, due: '2026-11-24' }, b: { box: 9, due: 'x' } }, gifts: { kalpak: 'm', nope: 'm' } })!
    expect(p.review).toEqual({ a: { box: 1, due: '2026-11-24' } })
    expect(p.gifts).toEqual({ kalpak: 'm' })
    expect(sanitizeProfile({ id: 'y' })!.review).toEqual({})
  })
})

describe("Koren's surprise (v0.27) — every 4th new mission, never bought, never random", () => {
  const base = (): Profile => ({ id: 'p', nickname: '', age: 8, avatar: 'bear', done: {}, badges: [], seen: [], days: [], owned: [], outfit: {}, review: {}, gifts: {} })
  const play = (p: Profile, id: string) => withGift({ ...p, done: { ...p.done, [id]: { level: 'young', at: '2026-11-24' } } }, p, id)

  it('the 4th and 8th new mission bring the next stall things; a replay brings nothing', () => {
    let p = base()
    for (let i = 1; i <= GIFT_EVERY * 2; i++) {
      p = play(p, `m${i}`)
      if (i < GIFT_EVERY) expect(p.owned).toEqual([])
    }
    const coinItems = SHOP.filter((i) => i.currency === 'coin')
    expect(p.owned).toEqual([coinItems[0]!.id, coinItems[1]!.id])
    expect(p.gifts).toEqual({ [coinItems[0]!.id]: `m${GIFT_EVERY}`, [coinItems[1]!.id]: `m${GIFT_EVERY * 2}` })
    expect(play(p, 'm1')).toEqual({ ...p, done: { ...p.done, m1: { level: 'young', at: '2026-11-24' } } })
  })

  it('a gift is owned but costs nothing from the purse', () => {
    const gift = SHOP[0]!
    const days = ['2026-11-24']
    const paid = wallet({ done: {}, days, owned: [gift.id] }, MISSIONS).coins
    const free = wallet({ done: {}, days, owned: [gift.id], gifts: { [gift.id]: 'm4' } }, MISSIONS).coins
    expect(free).toBe(COINS_PER_DAY)
    expect(paid).toBe(0)
  })

  it('the store gives it when the 4th mission is completed', () => {
    const ids = MISSIONS.slice(0, GIFT_EVERY).map((m) => m.id)
    for (const id of ids) useProfiles.getState().complete(id, 'young', MISSIONS.find((m) => m.id === id)!.badge.id)
    const p = activeProfile(useProfiles.getState())
    expect(Object.values(p.gifts)).toEqual([ids[GIFT_EVERY - 1]])
  })
})
