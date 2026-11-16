import { beforeEach, describe, expect, it } from 'vitest'
import { MISSIONS } from '../src/content/missions'
import { COINS_PER_DAY, COINS_PER_MISSION, SHOP, adventureDays, finishedChapters, wallet } from '../src/content/rewards'
import { pathChapters } from '../src/content/path'
import { forLevel } from '../src/content/forLevel'
import { localDay } from '../src/content/shop'
import { activeProfile, sanitizeProfile, useProfiles } from '../src/store/profiles'
import { useSettings } from '../src/store/settings'
import { existsSync } from 'node:fs'

beforeEach(() => {
  localStorage.clear()
  useSettings.getState().reset()
  useProfiles.getState().reset()
})

describe('coins (v0.22) — calculated from progress, never real money', () => {
  it('missions and days bring coins; finished chapters bring pendants; buying spends them', () => {
    const first = pathChapters(MISSIONS)[0]!
    const done = Object.fromEntries(first.missions.map((m) => [m.id, { level: 'young' as const, at: '2026-11-01' }]))
    const w = wallet({ done, days: ['2026-11-01', '2026-11-02'], owned: [] }, MISSIONS)
    expect(w.coins).toBe(first.missions.length * COINS_PER_MISSION + 2 * COINS_PER_DAY)
    expect(w.pendars).toBe(1)
    const spent = wallet({ done, days: ['2026-11-01', '2026-11-02'], owned: ['martenitsa', 'flower-crown'] }, MISSIONS)
    expect(spent.coins).toBe(w.coins - 20)
    expect(spent.pendars).toBe(0)
  })

  it('a mission counts once, whatever the level or the replays; unknown missions count nothing', () => {
    const one = wallet({ done: { 'hist-01-asparuh': { level: 'guard', at: '2026-01-01' }, 'gone-01-x': { level: 'small', at: '2026-01-01' } }, days: [], owned: [] }, MISSIONS)
    expect(one.coins).toBe(COINS_PER_MISSION)
  })

  it('days of adventure: only good news — a missed day ends the row quietly, the total stays', () => {
    expect(adventureDays(['2026-11-10', '2026-11-11', '2026-11-12'], '2026-11-12')).toEqual({ total: 3, row: 3 })
    expect(adventureDays(['2026-11-10', '2026-11-11'], '2026-11-12')).toEqual({ total: 2, row: 2 }) // today not played yet: still a row
    expect(adventureDays(['2026-11-01', '2026-11-11'], '2026-11-20')).toEqual({ total: 2, row: 0 })
    // across a month end and the October summer-time change
    expect(adventureDays(['2026-10-24', '2026-10-25', '2026-10-26', '2026-10-31', '2026-11-01'], '2026-11-01')).toEqual({ total: 5, row: 2 })
    expect(adventureDays(['2026-10-24', '2026-10-25', '2026-10-26'], '2026-10-26')).toEqual({ total: 3, row: 3 })
  })

  it("uses the child's own calendar day, not UTC", () => {
    // 23:30 on 16 Nov local time is still the 16th (in UTC it may already be the 17th, or still the 16th)
    expect(localDay(new Date(2026, 10, 16, 23, 30))).toBe('2026-11-16')
    expect(localDay(new Date(2026, 10, 17, 0, 15))).toBe('2026-11-17')
    expect(localDay(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('a child who turns 7 keeps every coin and pendant (nothing earned is taken away)', () => {
    const small = forLevel(MISSIONS, 'small')
    const minis = small.filter((m) => m.id.startsWith('mini-'))
    expect(minis.length).toBeGreaterThan(5)
    const done = Object.fromEntries(minis.map((m) => [m.id, { level: 'small' as const, at: '2026-11-01' }]))
    const p = { done, days: ['2026-11-01', '2026-11-02'], owned: ['vest', 'kalpak'] }
    const before = wallet(p, MISSIONS)
    expect(before.earnedCoins).toBe(minis.length * COINS_PER_MISSION + 2 * COINS_PER_DAY)
    expect(before.earnedPendars).toBeGreaterThan(0) // the little ones' chapters are finished
    // the same profile after the birthday: the purse is the same (it does not depend on what the age shows now)
    expect(wallet(p, MISSIONS)).toEqual(before)
    const after = wallet({ ...p, done: { ...done, 'hist-01-asparuh': { level: 'young', at: '2026-11-03' } }, days: [...p.days, '2026-11-03'] }, MISSIONS)
    expect(after.coins).toBe(before.coins + COINS_PER_MISSION + COINS_PER_DAY)
  })

  it('buys and wears only real stall items, each in its own slot', () => {
    const s = useProfiles.getState()
    s.buy('no-such-thing', 'head')
    s.buy('kalpak', 'pin') // a wrong slot from the caller is ignored
    s.wear('rose', 'pin') // not owned
    const p = activeProfile(useProfiles.getState())
    expect(p.owned).toEqual(['kalpak'])
    expect(p.outfit).toEqual({ head: 'kalpak' })
    expect(sanitizeProfile({ ...p, outfit: { head: 'rose', pin: 'rose', feet: 'nope' } })?.outfit).toEqual({ pin: 'rose' })
  })

  it('finishing a mission records the day once; buying, wearing and taking off are kept', () => {
    const s = useProfiles.getState()
    s.complete('hist-01-asparuh', 'young', 'asparuh')
    s.complete('geo-01-rila', 'young', 'rila')
    expect(activeProfile(useProfiles.getState()).days).toHaveLength(1)
    s.buy('martenitsa', 'pin')
    expect(activeProfile(useProfiles.getState()).outfit.pin).toBe('martenitsa')
    s.takeOff('pin')
    expect(activeProfile(useProfiles.getState()).outfit.pin).toBeUndefined()
    s.wear('martenitsa', 'pin')
    s.wear('kalpak', 'head') // not bought — nothing happens
    expect(activeProfile(useProfiles.getState()).outfit).toEqual({ pin: 'martenitsa' })
  })

  it('profiles saved before v0.22 get empty purse fields; bad data is dropped', () => {
    const p = sanitizeProfile({ id: 'p1', age: 8, avatar: 'bear', done: {}, badges: [], days: ['2026-11-01', 'x'], outfit: { head: 'kalpak', '<b>': 'y' } })!
    expect(p.owned).toEqual([])
    expect(p.days).toEqual(['2026-11-01'])
    expect(p.outfit).toEqual({ head: 'kalpak' })
    expect(sanitizeProfile({ id: 'p2', age: 8 })!.days).toEqual([])
  })

  it('every thing at the stall has a real picture and a fair price', () => {
    for (const i of SHOP) {
      expect(existsSync(`public/img/${i.img}`), i.img).toBe(true)
      expect(i.price).toBeGreaterThan(0)
    }
    expect(finishedChapters({ done: {} }, MISSIONS)).toBe(0)
  })
})
