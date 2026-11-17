import { readdirSync, readFileSync } from 'node:fs'

const missionDir = new URL('../content/missions/', import.meta.url)
const approved = readdirSync(missionDir)
  .filter((name) => name.endsWith('.json'))
  .map((name) => JSON.parse(readFileSync(new URL(name, missionDir), 'utf8')))
  .filter((mission) => !mission.draft && mission.review?.by?.trim() && mission.review?.date)
const { chapters } = JSON.parse(readFileSync(new URL('../content/path.json', import.meta.url), 'utf8'))
const starterIds = chapters[0].missions
const missing = ['small', 'young', 'guard'].filter((level) =>
  !starterIds.every((id) => approved.some((mission) =>
    mission.id === id && mission.levels[level] && (!mission.ages || mission.ages.includes(level)),
  )),
)

if (missing.length) {
  console.error(`Family release blocked: the first chapter needs reviewed missions for ${missing.join(', ')}.`)
  process.exitCode = 1
} else {
  console.log('The first chapter has reviewed missions for all age groups.')
}
