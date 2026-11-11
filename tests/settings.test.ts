import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEY, sanitize, useSettings } from '../src/store/settings'

const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')?.state

beforeEach(() => {
  localStorage.clear()
  useSettings.getState().reset()
})

describe('settings store', () => {
  it('persists language, age and onboarding to localStorage', () => {
    const s = useSettings.getState()
    s.setLang('en')
    s.setAge(12)
    s.completeOnboarding()
    expect(stored()).toEqual({ lang: 'en', age: 12, onboarded: true, remember: true })
  })

  it('writes nothing but the flag when "remember" is off', () => {
    const s = useSettings.getState()
    s.setLang('en')
    s.setRemember(false)
    s.setAge(5)
    expect(stored()).toEqual({ remember: false })
  })

  it('clamps ages set from the UI', () => {
    useSettings.getState().setAge(40)
    expect(useSettings.getState().age).toBe(14)
  })

  it('restores saved settings on reload', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { lang: 'en', age: 5, onboarded: true, remember: true }, version: 1 }),
    )
    await useSettings.persist.rehydrate()
    expect(useSettings.getState()).toMatchObject({ lang: 'en', age: 5, onboarded: true })
  })

  it('survives corrupted storage without crashing', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    await useSettings.persist.rehydrate()
    expect(useSettings.getState()).toMatchObject({ lang: 'bg', age: 8, onboarded: false })
  })

  it('ignores tampered values', () => {
    expect(sanitize({ lang: 'de', age: 999, onboarded: 'yes', remember: 1 })).toEqual({ age: 14 })
    expect(sanitize(null)).toEqual({})
    expect(sanitize('x')).toEqual({})
  })
})
