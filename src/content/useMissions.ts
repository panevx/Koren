import { useEffect, useState } from 'react'
import type { Mission } from './schema'

let cache: readonly Mission[] | null = null

/**
 * The mission list for screens that are in the first download (the hub).
 * Missions (and their validation code) arrive in a separate file, so the hub
 * paints immediately and fills in "next mission" and the counters a moment later.
 * Returns null until they are loaded.
 */
export function useMissions(): readonly Mission[] | null {
  const [missions, setMissions] = useState(cache)
  useEffect(() => {
    if (cache) return
    let alive = true
    void import('./missions').then((mod) => {
      cache = mod.MISSIONS
      if (alive) setMissions(cache)
    })
    return () => {
      alive = false
    }
  }, [])
  return missions
}
