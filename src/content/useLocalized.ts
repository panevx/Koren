import { useCallback } from 'react'
import { useSettings } from '../store/settings'

/** Picks the current language from a content field like { bg: "…", en: "…" }. */
export function useLocalized() {
  const lang = useSettings((s) => s.lang)
  return useCallback((text: { bg: string; en: string }) => text[lang], [lang])
}
