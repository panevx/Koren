// A checklist for the teacher who reviews the missions: docs/REVIEW.md.
// For every mission: title, ages, games, sources, and every sentence with a number (dates, heights, lengths) — those are
// checked first. The full texts are in the editor's table: `npm run export-content` → content/sheet/missions.csv.
// Usage: npm run review-list
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const dir = resolve(root, 'content/missions')
const path = JSON.parse(readFileSync(resolve(root, 'content/path.json'), 'utf8'))
const missions = Object.fromEntries(
  readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(resolve(dir, f), 'utf8')))
    .map((m) => [m.id, m]),
)
const AGES = { small: '4–6', young: '7–10', guard: '11–14' }
const SUBJECT = { history: 'История', culture: 'Култура', language: 'Език', geography: 'География' }

function numbered(m) {
  const out = new Set()
  const walk = (o) => {
    if (Array.isArray(o)) return o.forEach(walk)
    if (!o || typeof o !== 'object') return
    if (typeof o.bg === 'string' && /\d{2,}/.test(o.bg) && o.bg.length > 12) out.add(o.bg.trim())
    Object.values(o).forEach(walk)
  }
  walk(m.levels)
  return [...out]
}

const lines = [
  '# KOREN — списък за проверка от учител',
  '',
  `Генерирано от \`npm run review-list\` (${new Date().toISOString().slice(0, 10)}). НЕ се редактира на ръка.`,
  '',
  'Как се проверява една мисия:',
  '1. Отвори я в демото (https://panevx.github.io/Koren/mission/<id>) на трите възрасти (смени възрастта от „Кой играе?“ или „За родители“).',
  '2. Провери изреченията с числа по-долу — те са най-рисковите. Целият текст е в таблицата на редактора',
  '   (`npm run export-content` → `content/sheet/missions.csv`).',
  '3. Ако всичко е вярно: в JSON файла на мисията `"review": {"by": "<име>", "date": "ГГГГ-ММ-ДД"}` и `"draft": false`.',
  '   Едва тогава мисията се вижда и в build-а за семейства.',
  '',
  `Мисии: ${Object.keys(missions).length}. Одобрени: ${Object.values(missions).filter((m) => m.review).length}.`,
  '',
]
const listed = new Set()
for (const chapter of path.chapters) {
  lines.push(`## ${chapter.title.bg}`, '')
  for (const id of chapter.missions) {
    const m = missions[id]
    if (!m) continue
    listed.add(id)
    const games = Object.entries(m.levels)
      .map(([lv, c]) => `${AGES[lv]}: ${c.game.type}${c.extra ? ` + ${c.extra.type}` : ''}`)
      .join(' · ')
    lines.push(`### ${m.review ? '[x]' : '[ ]'} ${m.title.bg} — \`${m.id}\``, '')
    lines.push(`${SUBJECT[m.subject]} · ${games}`, '')
    lines.push(`Източници: ${m.sources.join('; ')}`, '')
    const facts = numbered(m)
    if (facts.length) {
      lines.push('Изречения с числа:', '')
      for (const f of facts) lines.push(`- [ ] ${f}`)
      lines.push('')
    }
  }
}
const rest = Object.keys(missions).filter((id) => !listed.has(id))
if (rest.length) lines.push('## Извън пътя', '', ...rest.map((id) => `- \`${id}\``), '')
writeFileSync(resolve(root, 'docs/REVIEW.md'), lines.join('\n'))
console.log(`docs/REVIEW.md: ${Object.keys(missions).length} missions`)
