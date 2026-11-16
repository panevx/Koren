/**
 * The service worker's picture cache (workbox runtimeCaching in vite.config.ts) — no imports, so the config can use it too.
 *
 * Pictures are shown from this cache first and refreshed in the background (StaleWhileRevalidate). So a picture REPLACED
 * under the same name is shown old once more on every device that stored it — that is how the 2D Koren and Raya of v0.8
 * (poses/*-wave|point|think, same names as the 3D ones since v0.10) kept appearing in some missions.
 * Replacing pictures under the same name: bump IMAGE_CACHE and list the replaced folders in REPLACED.
 */
export const IMAGE_CACHE = 'koren-img-2'

/** Earlier names of the cache, and what in them is out of date (not carried over). */
const OLD: readonly { name: string; replaced: readonly string[] }[] = [{ name: 'koren-img', replaced: ['/img/poses/', '/img/heroes/'] }]

/**
 * Moves what an older cache holds into the current one — except the replaced pictures — and deletes the old cache.
 * It copies instead of deleting, so a child who opens the app on a plane keeps every downloaded picture.
 */
export async function upgradeImageCache(store: CacheStorage | undefined = typeof caches === 'undefined' ? undefined : caches) {
  if (!store) return 0
  let moved = 0
  for (const old of OLD) {
    if (!(await store.has(old.name))) continue
    const from = await store.open(old.name)
    const to = await store.open(IMAGE_CACHE)
    for (const req of await from.keys()) {
      if (old.replaced.some((dir) => new URL(req.url).pathname.includes(dir))) continue
      if (await to.match(req)) continue
      const res = await from.match(req)
      if (res) {
        await to.put(req, res)
        moved++
      }
    }
    await store.delete(old.name)
  }
  return moved
}
