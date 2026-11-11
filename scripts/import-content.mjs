/**
 * npm run import-content -- table.csv
 * Reads the content team's sheet (CSV) and writes/updates content/missions/<id>.json.
 * Nothing is written if any row has an error — the errors are listed with row numbers.
 * Afterwards run `npm test`: it checks images, places and plays every level to the badge.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { csvToMissions } from '../src/content/csv.ts'

const file = process.argv[2]
if (!file) {
  console.error('Употреба: npm run import-content -- таблица.csv')
  process.exit(1)
}
const { missions, errors } = csvToMissions(readFileSync(file, 'utf8'))
if (errors.length) {
  console.error(`✗ ${errors.length} грешки — нищо не е записано:\n`)
  for (const e of errors) console.error('  • ' + e)
  process.exit(1)
}
for (const m of missions) writeFileSync(`content/missions/${m.id}.json`, JSON.stringify(m, null, 2) + '\n')
console.log(`✓ ${missions.length} мисии записани: ${missions.map((m) => m.id).join(', ')}`)
console.log('Сега пусни: npm test')
