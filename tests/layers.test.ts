import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LAKES, NEIGHBOURS, PEAKS, PROVINCES, RANGES, RIVERS, provinceAt } from '../src/content/layers'
import { PLACES } from '../src/content/places'
import { MAP_IMAGES } from '../src/map/art'
import { BULGARIA_OUTLINE, MAP_H, MAP_W } from '../src/map/geo'
import { insidePolygon } from '../src/map/projection'

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
      belogradchik: 'BG-05', pliska: 'BG-27', velingrad: 'BG-13', sandanski: 'BG-01', hisarya: 'BG-16', devetashka: 'BG-11', 'devils-throat': 'BG-21',
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
    for (const r of ['danube', 'maritsa', 'struma', 'mesta', 'yantra', 'tundzha', 'arda', 'kamchia']) expect(ids, r).toContain(r)
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
