/**
 * npm run export-content [-- out.csv]
 * Writes every mission in content/missions to one CSV (default content/sheet/missions.csv)
 * to open in Google Sheets / Excel.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { missionsToCsv } from '../src/content/csv.ts'
import { Mission } from '../src/content/schema.ts'

const out = process.argv[2] ?? 'content/sheet/missions.csv'
const dir = 'content/missions'
const missions = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => Mission.parse(JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'))))
  .sort((a, b) => a.order - b.order)
mkdirSync(out.replace(/[^/]+$/, '') || '.', { recursive: true })
writeFileSync(out, '﻿' + missionsToCsv(missions)) // BOM: Excel opens Cyrillic correctly
console.log(`${missions.length} missions → ${out}`)
