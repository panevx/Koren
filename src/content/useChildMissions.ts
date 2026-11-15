import { useMemo } from 'react'
import { useAge } from '../store/profiles'
import { ageToLevel } from '../theme/levels'
import { forLevel } from './forLevel'
import { MISSIONS } from './missions'

/** Missions for the child who is playing now (missions for 4–6 year olds only appear for them). */
export function useChildMissions() {
  const level = ageToLevel(useAge())
  return useMemo(() => forLevel(MISSIONS, level), [level])
}
