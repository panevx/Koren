import { describe, expect, it } from 'vitest'
import { MISSIONS } from '../src/content/missions'
import { forLevel } from '../src/content/forLevel'
import { PATH } from '../src/content/path'
import { isUnlocked, reachedMilestones, statusOf, unlockedIds } from '../src/content/progress'
import { PATH_ORDER } from '../src/content/pathOrder'

const fresh = { done: {}, badges: [] as string[] }
const played = (ids: string[]) => ({
  done: Object.fromEntries(ids.map((id) => [id, { level: 'young', at: '2026-01-01' }])),
  badges: ids.map((id) => MISSIONS.find((m) => m.id === id)!.badge.id),
})

describe('unlocking (game progression, never a paywall)', () => {
  it('a new child has at least one open mission in every subject — and at least 4 in all', () => {
    const open = MISSIONS.filter((m) => isUnlocked(m, fresh, MISSIONS))
    expect(open.length).toBeGreaterThanOrEqual(4)
    expect(new Set(open.map((m) => m.subject))).toEqual(new Set(['history', 'culture', 'language', 'geography']))
  })

  it('every mission can be reached by playing the open ones (no dead ends, no cycles)', () => {
    const done: string[] = []
    for (let round = 0; round < MISSIONS.length && done.length < MISSIONS.length; round++) {
      for (const m of MISSIONS) if (!done.includes(m.id) && isUnlocked(m, played(done), MISSIONS)) done.push(m.id)
    }
    expect(done.sort()).toEqual(MISSIONS.map((m) => m.id).sort())
  })

  it('"after" opens the next mission; finished missions stay open for replay', () => {
    const simeon = MISSIONS.find((m) => m.id === 'hist-02-simeon')!
    expect(statusOf(simeon, fresh, MISSIONS)).toBe('locked')
    expect(statusOf(simeon, played(['hist-01-asparuh']), MISSIONS)).toBe('open')
    expect(statusOf(simeon, played(['hist-01-asparuh', 'hist-02-simeon']), MISSIONS)).toBe('done')
  })

  it('bonus missions open with badges', () => {
    const treasures = MISSIONS.find((m) => m.id === 'hist-05-treasures')!
    expect(isUnlocked(treasures, played(['hist-01-asparuh', 'cult-01-baba-marta']), MISSIONS)).toBe(false)
    expect(isUnlocked(treasures, played(['hist-01-asparuh', 'cult-01-baba-marta', 'lang-01-azbuka']), MISSIONS)).toBe(true)
  })

  it('keeps old progress: a mission is open when a later one in its chain is already done', () => {
    // A child from v0.11 played Tarnovo without Simeon — Simeon must not be locked for them.
    const simeon = MISSIONS.find((m) => m.id === 'hist-02-simeon')!
    expect(isUnlocked(simeon, played(['hist-03-tarnovo']), MISSIONS)).toBe(true)
  })

  it('a prerequisite missing from this build (e.g. a hidden draft) never blocks', () => {
    const shown = MISSIONS.filter((m) => m.id !== 'hist-01-asparuh')
    const simeon = shown.find((m) => m.id === 'hist-02-simeon')!
    expect(isUnlocked(simeon, fresh, shown)).toBe(true)
  })

  it('newly unlocked missions can be found by comparing before and after', () => {
    const before = unlockedIds(fresh, MISSIONS)
    const after = unlockedIds(played(['hist-01-asparuh']), MISSIONS)
    expect(after.filter((id) => !before.includes(id))).toEqual(['hist-02-simeon'])
  })

  it('medals: bronze at 3 badges, trophy only with all', () => {
    expect(reachedMilestones(2, MISSIONS)).toEqual([])
    expect(reachedMilestones(3, MISSIONS)).toEqual(['bronze'])
    expect(reachedMilestones(MISSIONS.length, MISSIONS)).toEqual(['bronze', 'silver', 'gold', 'trophy'])
  })

  it('every "after" points to an existing mission', () => {
    for (const m of MISSIONS) for (const id of m.unlock?.after ?? []) expect(MISSIONS.some((x) => x.id === id), `${m.id} → ${id}`).toBe(true)
  })
})

describe('adventure path (content/path.json)', () => {
  it('lists every mission exactly once', () => {
    const ids = PATH.chapters.flatMap((c) => c.missions)
    expect(new Set(ids).size).toBe(ids.length)
    expect([...ids].sort()).toEqual(MISSIONS.map((m) => m.id).sort())
    expect(PATH_ORDER).toEqual(ids)
  })

  it('a stop never comes before the mission that opens it', () => {
    for (const m of MISSIONS)
      for (const id of m.unlock?.after ?? []) expect(PATH_ORDER.indexOf(id), `${id} before ${m.id}`).toBeLessThan(PATH_ORDER.indexOf(m.id))
  })
})

describe('missions for 4–6 year olds only', () => {
  const small = forLevel(MISSIONS, 'small')
  const older = forLevel(MISSIONS, 'guard')

  it('there are 30 of them, each with a small level only', () => {
    const only = MISSIONS.filter((m) => m.ages?.length === 1 && m.ages[0] === 'small')
    expect(only).toHaveLength(30)
    for (const m of only) expect(Object.keys(m.levels), m.id).toEqual(['small'])
  })

  it('a 4–6 year old sees them; an older child does not', () => {
    expect(small.length).toBe(older.length + 30)
    expect(older.some((m) => m.ages)).toBe(false)
  })

  it('a small child starts with plenty to play, and can reach everything', () => {
    expect(small.filter((m) => isUnlocked(m, fresh, small)).length).toBeGreaterThanOrEqual(12)
    const done: string[] = []
    for (let round = 0; round < small.length && done.length < small.length; round++)
      for (const m of small) if (!done.includes(m.id) && isUnlocked(m, played(done), small)) done.push(m.id)
    expect(done).toHaveLength(small.length)
  })

  it('the seven new animals are all used', () => {
    const text = JSON.stringify(MISSIONS)
    for (const a of ['roe-deer', 'boar', 'chamois', 'eagle', 'lizard', 'mouflon', 'pheasant']) expect(text, a).toContain(`animals/${a}.webp`)
  })
})
