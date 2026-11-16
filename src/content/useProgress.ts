import { useMemo } from 'react'
import { useActiveProfile } from '../store/profiles'
import { useSettings } from '../store/settings'
import { TESTER_TOOLS } from './tester'
import { earnedCount } from './badges'
import { statusOf, type Status } from './progress'
import type { Mission } from './schema'

/** Progress of the child who is playing: status of each mission, "new" ribbons and the badge count. */
export function useProgress(missions: readonly Mission[] | null) {
  const profile = useActiveProfile()
  const unlockAll = useUnlockAll()
  return useMemo(() => {
    const all = missions ?? []
    const status = (m: Mission): Status => statusOf(m, { ...profile, unlockAll }, all)
    return {
      status,
      /** Open, not played yet and never opened: shows "New!". */
      isNew: (m: Mission) => status(m) === 'open' && !profile.seen.includes(m.id),
      badges: earnedCount(profile.badges, all),
      /** The first open, unfinished mission in path order (or any order given). */
      next: (order: readonly Mission[] = all) => order.find((m) => status(m) === 'open'),
    }
  }, [profile, missions, unlockAll])
}

/** The testers' "every mission open" switch — always off in a families' build. */
export function useUnlockAll() {
  const on = useSettings((s) => s.unlockAll)
  return TESTER_TOOLS && on
}
