import { activeProfile, useProfiles } from '../store/profiles'
import { useSettings } from '../store/settings'
import { ageToLevel } from './levels'

/**
 * Mirrors settings onto <html>: `lang` for screen readers and hyphenation,
 * `data-level` for the age theme in index.css. Runs before the first render
 * (no flash of the wrong size) and on every change.
 */
export function syncDocumentWithSettings(): () => void {
  const apply = () => {
    const { lang } = useSettings.getState()
    const { age } = activeProfile(useProfiles.getState())
    const root = document.documentElement
    root.lang = lang
    root.dataset.level = ageToLevel(age)
  }
  apply()
  const offSettings = useSettings.subscribe(apply)
  const offProfiles = useProfiles.subscribe(apply)
  return () => {
    offSettings()
    offProfiles()
  }
}
