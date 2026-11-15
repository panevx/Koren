import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LAKES, NEIGHBOURS, PEAKS, PROVINCES, RANGES, RIVERS, provinceAt } from '../src/content/layers'
import { PLACES } from '../src/content/places'
import { MAP_IMAGES } from '../src/map/art'
import { BULGARIA_OUTLINE, MAP_H, MAP_W } from '../src/map/geo'
import { MISSIONS } from '../src/content/missions'
import { UNITS_PER_KM, insidePolygon, project } from '../src/map/projection'

/** v0.15: the layers of the Discover map are real data in the app's projection (scripts/build-layers.py, build-relief.py). */
describe('map layers', () => {
  it('has the 28 provinces of Bulgaria with their ISO codes and names in both languages', () => {
    expect(PROVINCES).toHaveLength(28)
    expect(new Set(PROVINCES.map((p) => p.id)).size).toBe(28)
    for (const p of PROVINCES) {
      expect(p.id).toMatch(/^BG-(0[1-9]|1\d|2[0-8])$/)
      expect(p.name.bg && p.name.en && p.centre.bg && p.centre.en, p.id).toBeTruthy()
    }
  })

  it('every place on the map lies in exactly the right province', () => {
    for (const p of PLACES) expect(provinceAt(p.x, p.y), p.id).toBeTruthy()
    const expected: Record<string, string> = {
      sofia: 'BG-22', plovdiv: 'BG-16', varna: 'BG-03', burgas: 'BG-02', ruse: 'BG-18', 'veliko-tarnovo': 'BG-04', karlovo: 'BG-16',
      gabrovo: 'BG-07', bansko: 'BG-01', 'baba-vida': 'BG-05', madara: 'BG-27', kazanlak: 'BG-24', srebarna: 'BG-19', 'rila-monastery': 'BG-10',
      belogradchik: 'BG-05', pliska: 'BG-27', velingrad: 'BG-13', sandanski: 'BG-01', hisarya: 'BG-16', 'sapareva-banya': 'BG-10', devetashka: 'BG-11', 'devils-throat': 'BG-21',
    }
    for (const [place, province] of Object.entries(expected)) {
      const p = PLACES.find((x) => x.id === place)!
      expect(provinceAt(p.x, p.y)?.id, place).toBe(province)
    }
  })

  it('neighbouring provinces never share a colour', () => {
    const colour = (id: string) => PROVINCES.find((p) => p.id === id)!.color
    for (const [a, b] of [['BG-22', 'BG-23'], ['BG-16', 'BG-13'], ['BG-03', 'BG-08'], ['BG-01', 'BG-10'], ['BG-24', 'BG-16'], ['BG-04', 'BG-07'], ['BG-18', 'BG-17'], ['BG-28', 'BG-02'], ['BG-09', 'BG-26']])
      expect(colour(a!), `${a} – ${b}`).not.toBe(colour(b!))
  })

  it('has the main rivers, each drawn across the map, and the reservoirs', () => {
    const ids = RIVERS.map((r) => r.id)
    for (const r of ['danube', 'iskar', 'vit', 'osam', 'maritsa', 'struma', 'mesta', 'yantra', 'tundzha', 'arda', 'kamchia']) expect(ids, r).toContain(r)
    for (const r of RIVERS) {
      expect(r.d, r.id).toMatch(/^M/)
      expect(r.into.bg && r.into.en, r.id).toBeTruthy()
    }
    expect(LAKES.map((k) => k.id)).toEqual(expect.arrayContaining(['iskar-dam', 'batak-dam']))
  })

  it('peaks lie in Bulgaria; Musala is the highest, then Vihren', () => {
    // Midzhur stands exactly on the border with Serbia: it may fall a hair outside the simplified outline.
    const near = (x: number, y: number) => BULGARIA_OUTLINE.some(([bx, by]) => Math.hypot(bx - x, by - y) < 4)
    for (const p of PEAKS) expect(insidePolygon(p.x, p.y, BULGARIA_OUTLINE) || near(p.x, p.y), p.id).toBe(true)
    const byHeight = [...PEAKS].sort((a, b) => b.height - a.height).map((p) => p.id)
    expect(byHeight.slice(0, 2)).toEqual(['musala', 'vihren'])
    for (const p of PEAKS) expect(RANGES.some((r) => r.id === p.range), p.id).toBe(true)
  })

  it('names the five neighbours with their capitals, all inside the map frame', () => {
    expect(NEIGHBOURS.map((n) => n.id).sort()).toEqual(['greece', 'north-macedonia', 'romania', 'serbia', 'turkey'])
    for (const n of NEIGHBOURS) {
      expect(n.at[0]).toBeGreaterThan(0)
      expect(n.at[0]).toBeLessThan(MAP_W)
      expect(n.at[1]).toBeGreaterThan(0)
      expect(n.at[1]).toBeLessThan(MAP_H)
      expect(insidePolygon(n.at[0], n.at[1], BULGARIA_OUTLINE), n.id).toBe(false)
    }
  })

  it('every map picture exists and the relief is small enough for phones', () => {
    for (const p of MAP_IMAGES) expect(existsSync(resolve(__dirname, '../public/img', p)), p).toBe(true)
    expect(statSync(resolve(__dirname, '../public/img/map/relief.webp')).size).toBeLessThanOrEqual(150 * 1024)
  })
})

/** v0.16: the rivers of the "follow the river" game — one line from the source to the mouth, through the towns on them. */
describe('river lines (scripts/build-rivers-dem.py)', () => {
  const line = (id: string) => RIVERS.find((r) => r.id === id)!.t!
  const dist = (id: string, lat: number, lon: number) => {
    const { x, y } = project(lat, lon)
    const t = line(id)
    let best = Infinity
    for (let i = 0; i < t.length - 1; i++) {
      const [ax, ay] = t[i]!
      const [bx, by] = t[i + 1]!
      const l2 = (bx - ax) ** 2 + (by - ay) ** 2 || 1
      const k = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / l2))
      best = Math.min(best, Math.hypot(ax + k * (bx - ax) - x, ay + k * (by - ay) - y))
    }
    return best / UNITS_PER_KM
  }

  it('the traced rivers pass their towns (≤ 3 km) and flow the right way', () => {
    const towns: [string, string, number, number][] = [
      ['iskar', 'Самоков', 42.337, 23.556], ['iskar', 'Своге', 42.961, 23.35], ['iskar', 'Мездра', 43.14, 23.708],
      ['vit', 'Тетевен', 42.918, 24.262], ['osam', 'Ловеч', 43.135, 24.716], ['maritsa', 'Пловдив', 42.15, 24.75],
      ['maritsa', 'Свиленград', 41.766, 26.199], ['struma', 'Перник', 42.605, 23.038], ['struma', 'Кресна', 41.725, 23.15],
      ['tundzha', 'Ямбол', 42.484, 26.503], ['arda', 'Кърджали', 41.65, 25.37], ['mesta', 'Якоруда', 42.025, 23.685],
      ['danube', 'Видин', 43.996, 22.877], ['danube', 'Русе', 43.849, 25.954],
    ]
    for (const [r, town, lat, lon] of towns) expect(dist(r, lat, lon), `${r} – ${town}`).toBeLessThan(3)
    // into the Danube: the mouth is north of the source; the Danube runs west → east
    for (const r of ['iskar', 'vit', 'osam']) expect(line(r).at(-1)![1], r).toBeLessThan(line(r)[0]![1] - 100)
    expect(line('danube').at(-1)![0]).toBeGreaterThan(line('danube')[0]![0] + 500)
    // the Iskar ends at the Danube, not further along it (west of the Vit)
    expect(line('iskar').at(-1)![0]).toBeLessThan(line('vit').at(-1)![0])
  })

  it('every "follow the river" mission uses a river with a line and stops that lie on it, in order', () => {
    for (const m of MISSIONS)
      for (const [level, c] of Object.entries(m.levels)) {
        const g = c!.game
        if (g.type !== 'trace') continue
        expect(RIVERS.find((r) => r.id === g.river)?.t, `${m.id} ${level}: ${g.river}`).toBeTruthy()
        const t = line(g.river)
        let last = -1
        for (const s of g.stops) {
          expect(dist(g.river, s.lat, s.lon), `${m.id} ${level}: ${s.bg}`).toBeLessThan(4)
          const { x, y } = project(s.lat, s.lon)
          const at = t.reduce((b, p, i) => (Math.hypot(p[0] - x, p[1] - y) < Math.hypot(t[b]![0] - x, t[b]![1] - y) ? i : b), 0)
          expect(at, `${m.id} ${level}: ${s.bg} comes after the stop before it`).toBeGreaterThanOrEqual(last)
          last = at
        }
      }
  })

  it('the provinces puzzle: only real provinces; tiny provinces are not so close that a drop could count for the wrong one', () => {
    const ids = new Set(PROVINCES.map((p) => p.id))
    for (const m of MISSIONS)
      for (const c of Object.values(m.levels)) if (c!.game.type === 'regions') for (const r of c!.game.regions) expect(ids.has(r), r).toBe(true)
    // Regions.tsx forgives a drop within 24 map units of a province's middle: no two middles may be that close.
    for (const a of PROVINCES)
      for (const b of PROVINCES) if (a.id < b.id) expect(Math.hypot(a.lx - b.lx, a.ly - b.ly), `${a.id} – ${b.id}`).toBeGreaterThan(24)
  })
})
