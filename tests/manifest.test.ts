import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import manifest from '../content/assets/manifest.json'
import { MISSIONS } from '../src/content/missions'
import { allImages } from '../src/offline/assets'

/**
 * v0.14: the 300 assets of design/v5 — every one has a decision in content/assets/manifest.json
 * (made by scripts/assets-v5.py): used · ready (for a later stage) · source (data) · duplicate · review.
 */
type Entry = { id: string; original: string; status: string; path?: string; same?: string; stage?: number; usedIn?: string; check?: string }
const ROOT = resolve(__dirname, '..')
const IMG = join(ROOT, 'public/img')
const assets = manifest.assets as Entry[]
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]))

describe('asset manifest (design/v5)', () => {
  it('accounts for every original, exactly once', () => {
    const originals = walk(join(ROOT, 'design/v5')).map((f) => relative(ROOT, f).replace(/\\/g, '/')).sort()
    expect(originals).toHaveLength(300)
    expect(assets.map((a) => a.original).sort()).toEqual(originals)
    expect(new Set(assets.map((a) => a.id)).size).toBe(assets.length)
  })

  it('used and ready assets are exported, small enough, and never twice', () => {
    const shipped = assets.filter((a) => a.status === 'used' || a.status === 'ready')
    for (const a of shipped) {
      expect(a.path, a.id).toBeTruthy()
      expect(existsSync(join(IMG, a.path!)), a.path).toBe(true)
      expect(statSync(join(IMG, a.path!)).size, a.path).toBeLessThanOrEqual(150 * 1024)
    }
    expect(new Set(shipped.map((a) => a.path)).size).toBe(shipped.length)
    for (const a of assets.filter((x) => x.status === 'ready')) expect(a.stage, a.id).toBeGreaterThanOrEqual(2)
  })

  it('duplicates point to the picture that already ships; review/source assets are not published', () => {
    for (const a of assets.filter((x) => x.status === 'duplicate')) expect(existsSync(join(IMG, a.same!)), a.id).toBe(true)
    for (const a of assets.filter((x) => x.status === 'review' || x.status === 'source')) expect(a.path, a.id).toBeUndefined()
    for (const a of assets.filter((x) => x.status === 'review')) expect(a.check, a.id).toBeTruthy()
  })

  it('the offline catalog includes referenced "used" assets and excludes future art', () => {
    const inApp = new Set(allImages(MISSIONS))
    for (const a of assets.filter((x) => x.status === 'used')) {
      expect(inApp.has(a.path!), `${a.id} → ${a.path}`).toBe(true)
    }
    for (const a of assets.filter((x) => x.status === 'ready')) {
      expect(inApp.has(a.path!), `${a.id} is referenced and must be marked used`).toBe(false)
    }
  })

  it('composites are shipped and shown', () => {
    const inApp = new Set(allImages(MISSIONS))
    for (const path of Object.keys(manifest.composites)) {
      expect(existsSync(join(IMG, path)), path).toBe(true)
      expect(inApp.has(path), path).toBe(true)
    }
  })

  it('the summary matches the list', () => {
    const count = (s: string) => assets.filter((a) => a.status === s).length
    expect(manifest.total).toBe(300)
    expect(manifest.summary).toEqual({ used: count('used'), ready: count('ready'), source: count('source'), duplicate: count('duplicate'), review: count('review') })
  })
})
