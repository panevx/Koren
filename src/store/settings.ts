import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { LANGS, type Lang } from '../i18n'

export const STORAGE_KEY = 'koren:settings'

type Persisted = {
  lang: Lang
  onboarded: boolean
  /** When false, nothing but this flag is written to the device. */
  remember: boolean
  /** Sound effects on/off. */
  sound: boolean
  /** Testers only (demo build): every mission open. Ignored in a families' build (src/content/tester.ts). */
  unlockAll: boolean
}

type SettingsState = Persisted & {
  setLang: (lang: Lang) => void
  setRemember: (remember: boolean) => void
  setSound: (sound: boolean) => void
  setUnlockAll: (unlockAll: boolean) => void
  completeOnboarding: () => void
  reset: () => void
}

const DEFAULTS: Persisted = { lang: 'bg', onboarded: false, remember: true, sound: true, unlockAll: false }

/**
 * localStorage can throw (Safari private mode, full quota, blocked site data).
 * Settings must never crash the app — at worst they are not remembered.
 */
export const safeLocalStorage = {
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
} satisfies StateStorage

/** Accept only well-formed values from storage; anything else falls back to defaults. */
export function sanitize(raw: unknown): Partial<Persisted> {
  if (!raw || typeof raw !== 'object') return {}
  const r = raw as Record<string, unknown>
  const out: Partial<Persisted> = {}
  if (typeof r.lang === 'string' && (LANGS as readonly string[]).includes(r.lang)) out.lang = r.lang as Lang
  if (typeof r.onboarded === 'boolean') out.onboarded = r.onboarded
  if (typeof r.remember === 'boolean') out.remember = r.remember
  if (typeof r.sound === 'boolean') out.sound = r.sound
  if (typeof r.unlockAll === 'boolean') out.unlockAll = r.unlockAll
  return out
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setLang: (lang) => set({ lang }),
      setRemember: (remember) => set({ remember }),
      setSound: (sound) => set({ sound }),
      setUnlockAll: (unlockAll) => set({ unlockAll }),
      completeOnboarding: () => set({ onboarded: true }),
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (s): Partial<Persisted> =>
        s.remember
          ? { lang: s.lang, onboarded: s.onboarded, remember: true, sound: s.sound, unlockAll: s.unlockAll }
          : { remember: false },
      merge: (persisted, current) => ({ ...current, ...sanitize(persisted) }),
      // Unknown or older shapes: keep whatever still validates.
      migrate: (persisted) => sanitize(persisted) as SettingsState,
    },
  ),
)

// The app open twice (two tabs, or a tab and the installed app): take the other copy's saves,
// so neither one overwrites the other's progress with stale data.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) void useSettings.persist.rehydrate()
  })
}
