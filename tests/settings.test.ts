import { beforeEach, describe, expect, it } from 'vitest'
import {
  LEGACY_PROGRESS_KEY,
  MAX_PROFILES,
  PROFILES_KEY,
  activeProfile,
  cleanNickname,
  sanitizeProfiles,
  useProfiles,
} from '../src/store/profiles'
import { STORAGE_KEY, sanitize, useSettings } from '../src/store/settings'

const stored = (key = STORAGE_KEY) => JSON.parse(localStorage.getItem(key) ?? 'null')?.state
const active = () => activeProfile(useProfiles.getState())

beforeEach(() => {
  localStorage.clear()
  useSettings.getState().reset()
  useProfiles.getState().reset()
})

describe('settings store (device-wide)', () => {
  it('persists language, onboarding and sound', () => {
    const s = useSettings.getState()
    s.setLang('en')
    s.completeOnboarding()
    expect(stored()).toEqual({ lang: 'en', onboarded: true, remember: true, sound: true })
  })

  it('writes nothing but the flag when "remember" is off', () => {
    useSettings.getState().setRemember(false)
    useSettings.getState().setLang('en')
    expect(stored()).toEqual({ remember: false })
  })

  it('survives corrupted storage without crashing', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    await useSettings.persist.rehydrate()
    expect(useSettings.getState()).toMatchObject({ lang: 'bg', onboarded: false })
  })

  it('ignores tampered values', () => {
    expect(sanitize({ lang: 'de', onboarded: 'yes', remember: 1, sound: false })).toEqual({ sound: false })
    expect(sanitize(null)).toEqual({})
  })
})

describe('profiles store (per child)', () => {
  it('starts with one profile', () => {
    expect(useProfiles.getState().profiles).toHaveLength(1)
  })

  it('allows at most 3 profiles', () => {
    const add = () => useProfiles.getState().addProfile({ nickname: 'x', age: 9, avatar: 'bear' })
    expect(add()).not.toBeNull()
    expect(add()).not.toBeNull()
    expect(add()).toBeNull()
    expect(useProfiles.getState().profiles).toHaveLength(MAX_PROFILES)
  })

  it('each child has a separate collection', () => {
    const s = useProfiles.getState()
    const first = s.activeId
    const second = s.addProfile({ nickname: 'Бобчо', age: 5, avatar: 'bear' })!
    s.complete('hist-01-asparuh', 'young', 'asparuh')
    useProfiles.getState().setActive(second)
    expect(active().badges).toEqual([])
    useProfiles.getState().complete('cult-01-baba-marta', 'small', 'baba-marta')
    const byId = Object.fromEntries(useProfiles.getState().profiles.map((p) => [p.id, p.badges]))
    expect(byId[first]).toEqual(['asparuh'])
    expect(byId[second]).toEqual(['baba-marta'])
  })

  it('age belongs to the child, not the device', () => {
    const s = useProfiles.getState()
    const second = s.addProfile({ nickname: '', age: 13, avatar: 'helmet' })!
    s.setAge(5)
    expect(active().age).toBe(5)
    useProfiles.getState().setActive(second)
    expect(active().age).toBe(13)
  })

  it('never deletes the last profile', () => {
    const s = useProfiles.getState()
    s.removeProfile(s.activeId)
    expect(useProfiles.getState().profiles).toHaveLength(1)
  })

  it('deleting the active profile switches to another one', () => {
    const s = useProfiles.getState()
    const first = s.activeId
    const second = s.addProfile({ nickname: '', age: 9, avatar: 'book' })!
    useProfiles.getState().setActive(second)
    useProfiles.getState().removeProfile(second)
    expect(useProfiles.getState().activeId).toBe(first)
  })

  it('clamps ages and cleans nicknames', () => {
    useProfiles.getState().setAge(40)
    expect(active().age).toBe(14)
    expect(cleanNickname('  <b>Мечо</b>\n ')).toBe('bМечо/b')
    expect(cleanNickname('x'.repeat(40))).toHaveLength(16)
    expect(cleanNickname(42)).toBe('')
  })

  it('counts the missions in a row and resets on a break', () => {
    const s = useProfiles.getState()
    s.complete('a', 'young', 'a')
    s.complete('b', 'young', 'b')
    expect(useProfiles.getState().streak).toBe(2)
    useProfiles.getState().takeBreak()
    expect(useProfiles.getState().streak).toBe(0)
  })

  it('rejects tampered or duplicated profiles', () => {
    expect(sanitizeProfiles({ profiles: 'x' })).toBeNull()
    const r = sanitizeProfiles({
      profiles: [
        { id: 'a', nickname: 1, age: 99, avatar: 'dragon', done: { m: { level: 'x', at: 1 } }, badges: ['b', 'b', 3] },
        { id: 'a' },
        { id: 'c' },
        { id: 'd' },
        { id: 'e' },
      ],
      activeId: 'zzz',
    })!
    expect(r.profiles.map((p) => p.id)).toEqual(['a', 'c', 'd'])
    expect(r.profiles[0]).toMatchObject({ nickname: '', age: 14, avatar: 'bear', done: {}, badges: ['b'] })
    expect(r.activeId).toBe('a')
  })

  it('does not write when "remember" is off, and erases what was saved', () => {
    useProfiles.getState().complete('m', 'young', 'b')
    expect(localStorage.getItem(PROFILES_KEY)).not.toBeNull()
    useSettings.getState().setRemember(false)
    expect(localStorage.getItem(PROFILES_KEY)).toBeNull()
    useProfiles.getState().complete('n', 'young', 'c')
    expect(localStorage.getItem(PROFILES_KEY)).toBeNull()
  })

  it('restores saved profiles on reload', async () => {
    localStorage.setItem(
      PROFILES_KEY,
      JSON.stringify({
        state: { profiles: [{ id: 'x', nickname: 'Ани', age: 6, avatar: 'martenitsa', done: {}, badges: ['rila'] }], activeId: 'x' },
        version: 1,
      }),
    )
    await useProfiles.persist.rehydrate()
    expect(active()).toMatchObject({ nickname: 'Ани', age: 6, badges: ['rila'] })
  })
})

describe('migration from v0.5 (single child)', () => {
  it('keeps the age and badges a child already had', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { lang: 'bg', age: 12, onboarded: true, remember: true }, version: 1 }))
    localStorage.setItem(
      LEGACY_PROGRESS_KEY,
      JSON.stringify({ state: { done: { 'hist-01-asparuh': { level: 'guard', at: '2026-11-01' } }, badges: ['asparuh'] }, version: 1 }),
    )
    // A fresh device has no profiles yet: rebuild the initial state from the legacy keys.
    const { profiles } = (await import('../src/store/profiles')).sanitizeProfiles(null) ?? { profiles: null }
    expect(profiles).toBeNull()
    const migrated = useProfiles.persist.getOptions().migrate!(undefined, 0) as unknown as { profiles: { age: number; badges: string[] }[] }
    expect(migrated.profiles[0]).toMatchObject({ age: 12, badges: ['asparuh'] })
  })
})
