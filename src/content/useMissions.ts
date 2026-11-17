import { useEffect, useState } from 'react'
import type { MissionSummary } from './missionSummary'

let cache: readonly MissionSummary[] | null = null

/** Home loads only the fields it needs for progress and the next mission. */
export function useMissions() {
  const [missions, setMissions] = useState(cache)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (cache) {
      setMissions(cache)
      return
    }
    let alive = true
    void import('./hubMissions').then(({ HUB_MISSIONS }) => {
      cache = HUB_MISSIONS
      if (alive) setMissions(cache)
    }, () => {
      if (alive) setFailed(true)
    })
    return () => {
      alive = false
    }
  }, [])
  return { missions, failed }
}
