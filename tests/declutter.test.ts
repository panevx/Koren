import { describe, expect, it } from 'vitest'
import { PLACES } from '../src/content/places'
import { declutter, markerShrink } from '../src/map/BulgariaMap'
import { MAP_W } from '../src/map/geo'

/** v0.13: landmarks on the map never cover each other — on a small phone, a tablet or a computer, zoomed in or out. */
describe('map markers do not overlap', () => {
  const markers = PLACES.filter((p) => p.onMap)
  it.each([
    [288, 56, 1], // 320 px phone
    [358, 56, 1], // 390 px phone
    [358, 56, 2.56], // zoomed in
    [700, 73, 1], // tablet (--scale 1.3)
    [900, 81, 1], // computer (--scale 1.45)
  ])('map %i px wide, markers %i px, zoom %f', (w, full, zoom) => {
    const px = full * markerShrink(w)
    const sizes = Object.fromEntries(markers.map((m) => [m.id, m.img ? px : px * 0.86]))
    const ppu = (w * zoom) / MAP_W
    const out = declutter(markers, sizes, ppu)
    let worst = 0
    let moved = 0
    for (const a of markers) {
      moved = Math.max(moved, Math.hypot(out[a.id]!.x - a.x, out[a.id]!.y - a.y) * ppu)
      for (const b of markers) {
        if (a.id >= b.id) continue
        const d = Math.hypot(out[a.id]!.x - out[b.id]!.x, out[a.id]!.y - out[b.id]!.y) * ppu
        worst = Math.max(worst, (sizes[a.id]! + sizes[b.id]!) / 2 - d)
      }
    }
    expect(worst).toBeLessThanOrEqual(0.5)
    // …and nothing travels far from its real place (the leader line shows where it is).
    expect(moved).toBeLessThan(px * 2.2)
  })

  it('without a measured frame nothing moves', () => {
    const out = declutter(markers, {}, 0)
    for (const m of markers) expect(out[m.id]).toEqual({ x: m.x, y: m.y })
  })
})

describe('name chips (rivers, lakes) do not overlap either', () => {
  it.each([
    [358, 1],
    [600, 1.45],
  ])('map %i px wide, UI scale %f', async (w, scale) => {
    const { RIVERS, LAKES } = await import('../src/content/layers')
    const items = [...RIVERS, ...LAKES].map((r) => ({ id: r.id, x: r.lx, y: r.ly }))
    // a chip ≈ 7.5 px per letter + padding, 26 px high (× the tablet/computer scale)
    const sizes = Object.fromEntries([...RIVERS, ...LAKES].map((r) => [r.id, { w: (r.name.bg.length * 7.5 + 20) * scale, h: 26 * scale }]))
    const ppu = w / MAP_W
    const out = declutter(items, sizes, ppu)
    for (const a of items)
      for (const b of items) {
        if (a.id >= b.id) continue
        const ox = (sizes[a.id]!.w + sizes[b.id]!.w) / 2 - Math.abs(out[a.id]!.x - out[b.id]!.x) * ppu
        const oy = (sizes[a.id]!.h + sizes[b.id]!.h) / 2 - Math.abs(out[a.id]!.y - out[b.id]!.y) * ppu
        expect(ox <= 0.5 || oy <= 0.5, `${a.id} – ${b.id}`).toBe(true)
      }
  })
})
