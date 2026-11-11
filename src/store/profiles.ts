import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_AGE, LEVELS, clampAge, type Level } from '../theme/levels'
import { STORAGE_KEY as SETTINGS_KEY, safeLocalStorage, useSettings } from './settings'

/**
 * Up to 3 children share one device, each with their own age, sign and collection.
 * Nothing here identifies a child: the nickname is optional, never leaves the device,
 * and the age is only a number for the interface.
 */
export const PROFILES_KEY = 'koren:profiles'
/** Storage key used by v0.3–v0.5 for a single child's progress (migrated on first load). */
export const LEGACY_PROGRESS_KEY = 'koren:progress'
export const MAX_PROFILES = 3
export const NICKNAME_MAX = 16

export const AVATARS = ['bear', 'compass', 'helmet', 'martenitsa', 'backpack', 'medal', 'book', 'tower'] as const
export type AvatarId = (typeof AVATARS)[number]

export type Done = { level: Level; at: string }
export type Profile = {
  id: string
  nickname: string
  age: number
  avatar: AvatarId
  done: Record<string, Done>
  badges: string[]
}

type State = {
  profiles: Profile[]
  activeId: string
  /** Missions finished in a row this session (not saved). After 3, Koren and Raya suggest a break. */
  streak: number
  addProfile: (p: { nickname: string; age: number; avatar: AvatarId }) => string | null
  updateProfile: (id: string, patch: Partial<Pick<Profile, 'nickname' | 'age' | 'avatar'>>) => void
  removeProfile: (id: string) => void
  setActive: (id: string) => void
  setAge: (age: number) => void
  setAvatar: (avatar: AvatarId) => void
  complete: (missionId: string, level: Level, badgeId: string) => void
  takeBreak: () => void
  reset: () => void
}

export const BREAK_AFTER = 3

const newId = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export function cleanNickname(raw: unknown): string {
  return typeof raw === 'string' ? raw.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, NICKNAME_MAX) : ''
}

function sanitizeDone(raw: unknown): Record<string, Done> {
  const out: Record<string, Done> = {}
  if (!raw || typeof raw !== 'object') return out
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    const d = v as Partial<Done> | null
    if (d && typeof d.at === 'string' && LEVELS.includes(d.level as Level)) out[id] = { level: d.level as Level, at: d.at }
  }
  return out
}

const sanitizeBadges = (raw: unknown) =>
  Array.isArray(raw) ? [...new Set(raw.filter((b): b is string => typeof b === 'string'))] : []

export function sanitizeProfile(raw: unknown): Profile | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (typeof r.id !== 'string' || !r.id) return null
  return {
    id: r.id,
    nickname: cleanNickname(r.nickname),
    age: clampAge(typeof r.age === 'number' ? r.age : DEFAULT_AGE),
    avatar: AVATARS.includes(r.avatar as AvatarId) ? (r.avatar as AvatarId) : 'bear',
    done: sanitizeDone(r.done),
    badges: sanitizeBadges(r.badges),
  }
}

export function sanitizeProfiles(raw: unknown): Pick<State, 'profiles' | 'activeId'> | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (!Array.isArray(r.profiles)) return null
  const seen = new Set<string>()
  const profiles = r.profiles
    .map(sanitizeProfile)
    .filter((p): p is Profile => p !== null && !seen.has(p.id) && Boolean(seen.add(p.id)))
    .slice(0, MAX_PROFILES)
  if (!profiles.length) return null
  const activeId = typeof r.activeId === 'string' && profiles.some((p) => p.id === r.activeId) ? r.activeId : profiles[0]!.id
  return { profiles, activeId }
}

/** First run: one profile — carrying over age and badges saved by v0.3–v0.5, if any. */
function initialProfiles(): Pick<State, 'profiles' | 'activeId'> {
  const read = (key: string) => {
    try {
      return (JSON.parse(safeLocalStorage.getItem(key) as string) as { state?: Record<string, unknown> } | null)?.state
    } catch {
      return undefined
    }
  }
  const legacy = read(LEGACY_PROGRESS_KEY)
  const legacyAge = read(SETTINGS_KEY)?.age
  const profile: Profile = {
    id: 'p1',
    nickname: '',
    age: clampAge(typeof legacyAge === 'number' ? legacyAge : DEFAULT_AGE),
    avatar: 'bear',
    done: sanitizeDone(legacy?.done),
    badges: sanitizeBadges(legacy?.badges),
  }
  return { profiles: [profile], activeId: profile.id }
}

export const useProfiles = create<State>()(
  persist(
    (set, get) => {
      const patchActive = (fn: (p: Profile) => Profile) =>
        set((s) => ({ profiles: s.profiles.map((p) => (p.id === s.activeId ? fn(p) : p)) }))
      return {
        ...initialProfiles(),
        streak: 0,
        addProfile: ({ nickname, age, avatar }) => {
          if (get().profiles.length >= MAX_PROFILES) return null
          const id = newId()
          set((s) => ({
            profiles: [...s.profiles, { id, nickname: cleanNickname(nickname), age: clampAge(age), avatar, done: {}, badges: [] }],
          }))
          return id
        },
        updateProfile: (id, patch) =>
          set((s) => ({
            profiles: s.profiles.map((p) =>
              p.id !== id
                ? p
                : {
                    ...p,
                    ...(patch.nickname !== undefined && { nickname: cleanNickname(patch.nickname) }),
                    ...(patch.age !== undefined && { age: clampAge(patch.age) }),
                    ...(patch.avatar !== undefined && { avatar: patch.avatar }),
                  },
            ),
          })),
        removeProfile: (id) =>
          set((s) => {
            if (s.profiles.length <= 1) return s // there is always at least one profile
            const profiles = s.profiles.filter((p) => p.id !== id)
            return { profiles, activeId: s.activeId === id ? profiles[0]!.id : s.activeId, streak: 0 }
          }),
        setActive: (id) => set((s) => (s.profiles.some((p) => p.id === id) ? { activeId: id, streak: 0 } : s)),
        setAge: (age) => patchActive((p) => ({ ...p, age: clampAge(age) })),
        setAvatar: (avatar) => patchActive((p) => ({ ...p, avatar })),
        complete: (missionId, level, badgeId) => {
          patchActive((p) => ({
            ...p,
            done: { ...p.done, [missionId]: { level, at: new Date().toISOString().slice(0, 10) } },
            badges: p.badges.includes(badgeId) ? p.badges : [...p.badges, badgeId],
          }))
          set((s) => ({ streak: s.streak + 1 }))
        },
        takeBreak: () => set({ streak: 0 }),
        reset: () => {
          const fresh: Profile = { id: 'p1', nickname: '', age: DEFAULT_AGE, avatar: 'bear', done: {}, badges: [] }
          set({ profiles: [fresh], activeId: fresh.id, streak: 0 })
        },
      }
    },
    {
      name: PROFILES_KEY,
      version: 1,
      // "Remember" off in Settings → nothing is written at all.
      storage: createJSONStorage(() => ({
        ...safeLocalStorage,
        setItem: (name: string, value: string) => {
          if (useSettings.getState().remember) safeLocalStorage.setItem(name, value)
        },
      })),
      partialize: (s) => ({ profiles: s.profiles, activeId: s.activeId }),
      merge: (persisted, current) => ({ ...current, ...(sanitizeProfiles(persisted) ?? {}) }),
      migrate: (persisted) => (sanitizeProfiles(persisted) ?? initialProfiles()) as unknown as State,
      // Save right after loading, so profiles migrated from v0.5 are stored under the new key at once.
      onRehydrateStorage: () => (_state, error) => {
        if (!error) queueMicrotask(() => useProfiles.setState({}))
      },
    },
  ),
)

// Turning "Remember" off erases saved profiles from the device; turning it on saves them again.
useSettings.subscribe((s, prev) => {
  if (s.remember === prev.remember) return
  if (s.remember) useProfiles.setState({})
  else void useProfiles.persist.clearStorage()
})

export function activeProfile(s: Pick<State, 'profiles' | 'activeId'>): Profile {
  return s.profiles.find((p) => p.id === s.activeId) ?? s.profiles[0]!
}

/** The child who is playing now. */
export const useActiveProfile = () => useProfiles(activeProfile)
/** Age of the child who is playing now. */
export const useAge = () => useProfiles((s) => activeProfile(s).age)
