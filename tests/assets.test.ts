import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { SECTIONS, sectionIcon } from '../src/sections'
import { LEVELS } from '../src/theme/levels'

const PUBLIC = resolve(__dirname, '../public')
const SRC = resolve(__dirname, '../src')

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

describe('images', () => {
  it('every section has its painted icon', () => {
    for (const s of SECTIONS) {
      expect(existsSync(join(PUBLIC, 'img', sectionIcon(s.id))), s.id).toBe(true)
    }
  })

  it('every age level has its icon', () => {
    for (const level of LEVELS) {
      expect(existsSync(join(PUBLIC, 'img/levels', `${level}.webp`)), level).toBe(true)
    }
  })

  it('both heroes have every mood used by <Avatar>', () => {
    for (const hero of ['koren', 'raya']) {
      for (const mood of ['joy', 'thoughtful', 'surprise', 'determination', 'laughter']) {
        expect(existsSync(join(PUBLIC, 'img/heroes', `${hero}-${mood}.webp`)), `${hero}-${mood}`).toBe(true)
      }
    }
  })

  it('every hero avatar used on a section screen exists', () => {
    for (const s of SECTIONS) {
      expect(existsSync(join(PUBLIC, 'img/heroes', `${s.host}-thoughtful.webp`)), s.host).toBe(true)
    }
  })

  it('every literal img("…") path in the source exists', () => {
    const literal = /img\(\s*'([^'$]+)'\s*\)/g
    for (const file of walk(SRC).filter((f) => /\.tsx?$/.test(f))) {
      for (const [, path] of readFileSync(file, 'utf8').matchAll(literal)) {
        expect(existsSync(join(PUBLIC, 'img', path!)), `${file}: ${path}`).toBe(true)
      }
    }
  })

  it('shipped images stay within the 150 KB budget', () => {
    for (const file of walk(join(PUBLIC, 'img'))) {
      expect(statSync(file).size, file).toBeLessThanOrEqual(150 * 1024)
    }
  })
})
