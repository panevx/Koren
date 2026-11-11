import { create } from 'zustand'
import type { Lang } from '../i18n'
import { DEFAULT_AGE, clampAge } from '../theme/levels'

type SettingsState = {
  lang: Lang
  age: number
  setLang: (lang: Lang) => void
  setAge: (age: number) => void
}

export const useSettings = create<SettingsState>()((set) => ({
  lang: 'bg',
  age: DEFAULT_AGE,
  setLang: (lang) => set({ lang }),
  setAge: (age) => set({ age: clampAge(age) }),
}))
