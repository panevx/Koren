import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { MISSIONS, parseMissions, pickLevel } from '../src/content/missions'
import { PLACES } from '../src/content/places'
import { Mission, POSES } from '../src/content/schema'
import { BULGARIA_OUTLINE } from '../src/map/geo'
import { insidePolygon, project } from '../src/map/projection'

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

      it('every place it mentions exists on the map', () => {
        const ids = new Set(PLACES.map((p) => p.id))
        if (m.place) expect(ids.has(m.place), `place ${m.place}`).toBe(true)
        for (const level of Object.values(m.levels)) {
          if (level?.game.type !== 'map') continue
          for (const id of level.game.choices) expect(ids.has(id), `choice ${id}`).toBe(true)
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

describe('content/map/places.json', () => {
  it('ids are unique', () => {
    expect(new Set(PLACES.map((p) => p.id)).size).toBe(PLACES.length)
  })

  it('every place lies inside the border of Bulgaria', () => {
    for (const p of PLACES) expect(insidePolygon(p.x, p.y, BULGARIA_OUTLINE), p.id).toBe(true)
  })

  it('points outside Bulgaria are detected (sanity check of the test itself)', () => {
    for (const [lat, lon] of [[44.43, 26.1], [41.01, 28.98], [40.64, 22.94]] as const) {
      const { x, y } = project(lat, lon) // Bucharest, Istanbul, Thessaloniki
      expect(insidePolygon(x, y, BULGARIA_OUTLINE)).toBe(false)
    }
  })
})

describe('map controls never cover a place', () => {
  it('no place is in the bottom-left corner where the zoom buttons sit', () => {
    // Buttons: 3 × 48 px + gaps ≈ 170 × 60 px on a ~360 px wide map → 47% × 24% of the map.
    for (const p of PLACES) expect(p.x < 1000 * 0.47 && p.y > 690 * 0.76, p.id).toBe(false)
  })
})

describe('map games are fair for younger children', () => {
  // ~1 km per 0.009° latitude; good enough at Bulgaria's size.
  const km = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) =>
    Math.hypot((a.lat - b.lat) * 111.2, (a.lon - b.lon) * 111.2 * Math.cos((42.7 * Math.PI) / 180))

  it('for 4–10 year olds no two choices are closer than 50 km (they would overlap on a phone)', () => {
    for (const m of MISSIONS) {
      for (const level of ['small', 'young'] as const) {
        const g = m.levels[level]?.game
        if (g?.type !== 'map') continue
        const pts = g.choices.map((id) => PLACES.find((p) => p.id === id)!)
        for (let i = 0; i < pts.length; i++)
          for (let j = i + 1; j < pts.length; j++)
            expect(km(pts[i]!, pts[j]!), `${m.id} ${level}: ${pts[i]!.id} – ${pts[j]!.id}`).toBeGreaterThan(50)
      }
    }
  })
})
