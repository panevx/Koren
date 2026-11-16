import { describe, expect, it } from 'vitest'
import { IMAGE_CACHE, upgradeImageCache } from '../src/offline/imageCache'

/** A tiny in-memory CacheStorage (jsdom has none). */
function fakeStorage(initial: Record<string, string[]>) {
  const data = new Map(Object.entries(initial).map(([k, urls]) => [k, new Map(urls.map((u) => [u, `body of ${u}`]))]))
  const open = async (name: string) => {
    if (!data.has(name)) data.set(name, new Map())
    const c = data.get(name)!
    return {
      keys: async () => [...c.keys()].map((url) => ({ url }) as Request),
      match: async (r: Request | string) => {
        const body = c.get(typeof r === 'string' ? r : r.url)
        return body ? new Response(body) : undefined
      },
      put: async (r: Request, res: Response) => void c.set(r.url, await res.text()),
    } as unknown as Cache
  }
  const store = { has: async (n: string) => data.has(n), open, delete: async (n: string) => data.delete(n) } as unknown as CacheStorage
  return { store, data }
}

describe('picture cache upgrade (the old 2D heroes)', () => {
  const B = 'https://x.github.io/Koren/img/'
  it('keeps downloaded pictures, drops the replaced heroes and poses, deletes the old cache', async () => {
    const { store, data } = fakeStorage({ 'koren-img': [`${B}poses/koren-point.webp`, `${B}heroes/raya-joy.webp`, `${B}animals/bear.webp`, `${B}badges/rila.webp`] })
    expect(await upgradeImageCache(store)).toBe(2)
    expect(data.has('koren-img')).toBe(false)
    expect([...data.get(IMAGE_CACHE)!.keys()].sort()).toEqual([`${B}animals/bear.webp`, `${B}badges/rila.webp`])
  })
  it('does nothing when there is no old cache, and never overwrites a newer picture', async () => {
    const { store, data } = fakeStorage({ [IMAGE_CACHE]: [`${B}animals/bear.webp`] })
    expect(await upgradeImageCache(store)).toBe(0)
    expect(data.get(IMAGE_CACHE)!.get(`${B}animals/bear.webp`)).toBe(`body of ${B}animals/bear.webp`)
  })
  it('the service worker and the download button use the same, new cache', async () => {
    const { readFileSync } = await import('node:fs')
    expect(readFileSync('vite.config.ts', 'utf8')).toContain('cacheName: IMAGE_CACHE')
    expect(IMAGE_CACHE).not.toBe('koren-img')
  })
})
