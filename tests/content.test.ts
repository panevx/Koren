import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { MISSIONS, parseMissions, pickLevel } from '../src/content/missions'
import { Mission, POSES } from '../src/content/schema'

const DIR = resolve(__dirname, '../content/missions')
const PUBLIC_IMG = resolve(__dirname, '../public/img')
const files = readdirSync(DIR).filter((f) => f.endsWith('.json'))
const load = (f: string) => JSON.parse(readFileSync(join(DIR, f), 'utf8')) as unknown

describe('content/missions — every file', () => {
  it('there is at least one mission', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  for (const file of files) {
    describe(file, () => {
      const parsed = Mission.safeParse(load(file))

      it('matches the schema', () => {
        expect(parsed.success ? [] : parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)).toEqual([])
      })
      if (!parsed.success) return
      const m = parsed.data

      it('file name equals the id', () => {
        expect(basename(file, '.json')).toBe(m.id)
      })

      it('every image it uses exists', () => {
        const paths = [m.badge.icon]
        for (const level of Object.values(m.levels)) {
          if (!level) continue
          for (const line of level.story) {
            paths.push(`poses/${line.hero}-${line.pose}.webp`)
            if (line.img) paths.push(line.img)
          }
          const questions = [...(level.game.type === 'quiz' ? level.game.questions : []), ...level.check]
          for (const q of questions) for (const o of q.options) if (o.img) paths.push(o.img)
        }
        for (const p of paths) expect(existsSync(join(PUBLIC_IMG, p)), p).toBe(true)
      })

      it('options in a question are all different', () => {
        for (const level of Object.values(m.levels)) {
          if (!level) continue
          const questions = [...(level.game.type === 'quiz' ? level.game.questions : []), ...level.check]
          for (const q of questions) {
            expect(new Set(q.options.map((o) => o.bg)).size, q.q.bg).toBe(q.options.length)
            expect(new Set(q.options.map((o) => o.en)).size, q.q.en).toBe(q.options.length)
          }
        }
      })

      it('an approved mission has no placeholder sources', () => {
        if (m.draft) return
        for (const s of m.sources) expect(s, 'replace the [placeholder] before approval').not.toMatch(/[[\]]|попълва/)
      })
    })
  }

  it('ids and badge ids are unique', () => {
    const ms = files.map((f) => load(f) as { id: string; badge: { id: string } })
    expect(new Set(ms.map((m) => m.id)).size).toBe(ms.length)
    expect(new Set(ms.map((m) => m.badge.id)).size).toBe(ms.length)
  })
})

describe('mission loader', () => {
  const base = load(files[0]!) as Record<string, unknown>

  it('loads every valid file without registration', () => {
    expect(MISSIONS.map((m) => m.id).sort()).toEqual(files.map((f) => basename(f, '.json')).sort())
  })

  it('a new quiz mission needs only a JSON file', () => {
    const extra = { ...base, id: 'cult-01-test', order: 99, badge: { id: 'test', icon: 'tiles/culture.webp' } }
    const ids = parseMissions({ 'a.json': base, 'b.json': extra }, true).map((m) => m.id)
    expect(ids).toContain('cult-01-test')
  })

  it('skips invalid files instead of crashing', () => {
    const errors = console.error
    console.error = () => {}
    const ids = parseMissions({ 'bad.json': { id: 'nope' }, 'ok.json': base }, true).map((m) => m.id)
    console.error = errors
    expect(ids).toEqual([base.id])
  })

  it('hides drafts from the family build', () => {
    const draft = { ...base, draft: true, review: null }
    expect(parseMissions({ 'd.json': draft }, false)).toEqual([])
    expect(parseMissions({ 'd.json': draft }, true)).toHaveLength(1)
  })

  it('rejects an unreviewed mission that is not marked as a draft', () => {
    expect(Mission.safeParse({ ...base, draft: false, review: null }).success).toBe(false)
  })

  it('rejects an answer index outside the options', () => {
    const m = structuredClone(base) as { levels: { young: { check: { answer: number }[] } } }
    m.levels.young.check[0]!.answer = 7
    expect(Mission.safeParse(m).success).toBe(false)
  })

  it('falls back to the closest level the mission has', () => {
    const m = MISSIONS[0]!
    expect(pickLevel(m, 'small').level).toBe(Object.keys(m.levels).includes('small') ? 'small' : 'young')
    expect(POSES).toContain('wave')
  })
})
