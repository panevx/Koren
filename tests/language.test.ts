import { describe, expect, it } from 'vitest'
import { GLAGOLITIC, canWriteGlagolitic } from '../src/content/glagolitic'
import { MISSIONS } from '../src/content/missions'

/** v0.20: the Glagolitic table and every cipher message. */
describe('Glagolitic', () => {
  it('maps 28 of today’s letters to 28 different Glagolitic capitals (block U+2C00–U+2C2F)', () => {
    const glyphs = Object.values(GLAGOLITIC)
    expect(glyphs).toHaveLength(28)
    expect(new Set(glyphs).size).toBe(28)
    for (const g of glyphs) expect(g.codePointAt(0)!).toBeGreaterThanOrEqual(0x2c00)
    for (const g of glyphs) expect(g.codePointAt(0)!).toBeLessThanOrEqual(0x2c2f)
    // spot checks against the Unicode names: AZU, BUKY, VEDE, SHA, YU
    expect([GLAGOLITIC['А'], GLAGOLITIC['Б'], GLAGOLITIC['В'], GLAGOLITIC['Ш'], GLAGOLITIC['Ю']]).toEqual(['Ⰰ', 'Ⰱ', 'Ⰲ', 'Ⱎ', 'Ⱓ'])
  })

  it('every cipher message can be written in Glagolitic (no Й, Я)', () => {
    const ciphers = MISSIONS.flatMap((m) => Object.values(m.levels).map((l) => l!.game)).filter((g) => g.type === 'cipher')
    expect(ciphers.length).toBeGreaterThan(0)
    for (const g of ciphers) expect(canWriteGlagolitic(g.message.bg), g.message.bg).toBe(true)
  })
})

describe('Hall of Fame (v0.21)', () => {
  it('every card points to a mission and a real picture', async () => {
    const { FAME } = await import('../src/content/fame')
    const { existsSync } = await import('node:fs')
    for (const p of FAME) {
      expect(MISSIONS.some((m) => m.id === p.mission), `${p.id}: ${p.mission}`).toBe(true)
      expect(existsSync(`public/img/${p.img}`), p.img).toBe(true)
    }
  })
})
