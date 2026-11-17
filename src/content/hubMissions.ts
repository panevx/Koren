import { MISSIONS } from './missions'
import { summarizeMission } from './missionSummary'

// The production build generates this index directly from validated mission data.
export const HUB_MISSIONS = MISSIONS.map(summarizeMission)
