import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { LANGS, type Lang } from '../i18n'
import { DEFAULT_AGE, clampAge } from '../theme/levels'

export const STORAGE_KEY = 'koren:settings'

type Persisted = {
  lang: Lang
  age: number
  onboarded: boolean
  /** When false, nothing but this flag is written to the device. */
  remember: boolean
}

type SettingsState = Persisted & {
  setLang: (lang: Lang) => void
  setAge: (age: number) => void
  setRemember: (remember: boolean) => void
  completeOnboarding: () => void
  reset: () => void
}

const DEFAULTS: Persisted = { lang: 'bg', age: DEFAULT_AGE, onboarded: false, remember: true }

/**
 * localStorage can throw (Safari private mode, full quota, blocked site data).
 * Settings must never crash the app — at worst they are not remembered.
 */
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value)
    } catch {
      /* not remembered — acceptable */
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name)
    } catch {
      /* ignore */
    }
  },
}

/** Accept only well-formed values from storage; anything else falls back to defaults. */
export function sanitize(raw: unknown): Partial<Persisted> {
  if (!raw || typeof raw !== 'object') return {}
  const r = raw as Record<string, unknown>
  const out: Partial<Persisted> = {}
  if (typeof r.lang === 'string' && (LANGS as readonly string[]).includes(r.lang)) out.lang = r.lang as Lang
  if (typeof r.age === 'number') out.age = clampAge(r.age)
  if (typeof r.onboarded === 'boolean') out.onboarded = r.onboarded
  if (typeof r.remember === 'boolean') out.remember = r.remember
  return out
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setLang: (lang) => set({ lang }),
      setAge: (age) => set({ age: clampAge(age) }),
      setRemember: (remember) => set({ remember }),
      completeOnboarding: () => set({ onboarded: true }),
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (s): Partial<Persisted> =>
        s.remember
          ? { lang: s.lang, age: s.age, onboarded: s.onboarded, remember: true }
          : { remember: false },
      merge: (persisted, current) => ({ ...current, ...sanitize(persisted) }),
      // Unknown or older shapes: keep whatever still validates.
      migrate: (persisted) => sanitize(persisted) as SettingsState,
    },
  ),
)
