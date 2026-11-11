import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { LEVELS, type Level } from '../theme/levels'
import { safeLocalStorage, useSettings } from './settings'

export const PROGRESS_KEY = 'koren:progress'

type Done = { level: Level; at: string }

type ProgressState = {
  /** Finished missions by id, with the level played and the date. */
  done: Record<string, Done>
  /** Earned badge ids, in the order they were won. */
  badges: string[]
  complete: (missionId: string, level: Level, badgeId: string) => void
  reset: () => void
}

export function sanitizeProgress(raw: unknown): Pick<ProgressState, 'done' | 'badges'> {
  const out = { done: {} as Record<string, Done>, badges: [] as string[] }
  if (!raw || typeof raw !== 'object') return out
  const r = raw as Record<string, unknown>
  if (r.done && typeof r.done === 'object') {
    for (const [id, v] of Object.entries(r.done as Record<string, unknown>)) {
      const d = v as Partial<Done> | null
      if (d && typeof d.at === 'string' && LEVELS.includes(d.level as Level)) out.done[id] = { level: d.level as Level, at: d.at }
    }
  }
  if (Array.isArray(r.badges)) out.badges = [...new Set(r.badges.filter((b): b is string => typeof b === 'string'))]
  return out
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      done: {},
      badges: [],
      complete: (missionId, level, badgeId) =>
        set((s) => ({
          done: { ...s.done, [missionId]: { level, at: new Date().toISOString().slice(0, 10) } },
          badges: s.badges.includes(badgeId) ? s.badges : [...s.badges, badgeId],
        })),
      reset: () => set({ done: {}, badges: [] }),
    }),
    {
      name: PROGRESS_KEY,
      version: 1,
      // Same privacy switch as settings: "Remember" off → nothing is written at all.
      storage: createJSONStorage(() => ({
        ...safeLocalStorage,
        setItem: (name: string, value: string) => {
          if (useSettings.getState().remember) safeLocalStorage.setItem(name, value)
        },
      })),
      partialize: (s) => ({ done: s.done, badges: s.badges }),
      merge: (persisted, current) => ({ ...current, ...sanitizeProgress(persisted) }),
      migrate: (persisted) => sanitizeProgress(persisted) as unknown as ProgressState,
    },
  ),
)

// Turning "Remember" off erases saved progress from the device; turning it on saves it again.
useSettings.subscribe((s, prev) => {
  if (s.remember === prev.remember) return
  if (s.remember) useProgress.setState({})
  else void useProgress.persist.clearStorage()
})
