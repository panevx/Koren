import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { MISSIONS } from '../src/content/missions'
import { allImages, missionImages } from '../src/offline/assets'

const IMG = resolve(__dirname, '../public/img')
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]))
const files = walk(IMG).map((f) => relative(IMG, f).replace(/\\/g, '/'))

describe('"Download everything for a trip"', () => {
  const list = allImages(MISSIONS)

  it('every listed image exists', () => {
    for (const p of list) expect(existsSync(join(IMG, p)), p).toBe(true)
  })

  it('covers every image the app ships (app icons are precached separately)', () => {
    const missing = files.filter((f) => !f.startsWith('icons/') && !list.includes(f))
    expect(missing, 'images in public/img that are neither used nor downloaded').toEqual([])
  })

  it('includes the hero poses of every story line', () => {
    for (const m of MISSIONS) for (const p of missionImages(m)) expect(list).toContain(p)
  })
})

describe('web app manifest icons', () => {
  it('exist in the sizes the manifest declares', () => {
    for (const f of ['icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'])
      expect(existsSync(join(IMG, 'icons', f)), f).toBe(true)
  })
})
