import { useCallback } from 'react'
import { useSettings } from '../store/settings'
import { translate, type TKey } from '.'

export function useT() {
  const lang = useSettings((s) => s.lang)
  return useCallback(
    (key: TKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  )
}
