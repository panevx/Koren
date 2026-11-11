import { img } from '../components/Brand'

/** Same cache the service worker uses for images (see workbox runtimeCaching in vite.config.ts). */
export const IMAGE_CACHE = 'koren-img'

export const offlineSupported = () => typeof window !== 'undefined' && 'caches' in window && 'serviceWorker' in navigator

/** How many of the given images are already stored on the device. */
export async function countCached(paths: readonly string[]): Promise<number> {
  if (!offlineSupported()) return 0
  const cache = await caches.open(IMAGE_CACHE)
  const hits = await Promise.all(paths.map((p) => cache.match(img(p))))
  return hits.filter(Boolean).length
}

/**
 * Downloads every image not yet stored, 4 at a time. A failed file does not stop the rest;
 * the result says how many are on the device now.
 */
export async function downloadAll(paths: readonly string[], onProgress: (done: number, total: number) => void) {
  const cache = await caches.open(IMAGE_CACHE)
  const total = paths.length
  let done = 0
  let failed = 0
  const queue = [...paths]
  const worker = async () => {
    for (let p = queue.shift(); p; p = queue.shift()) {
      const url = img(p)
      try {
        if (!(await cache.match(url))) await cache.add(url)
      } catch {
        failed++
      }
      onProgress(++done, total)
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()])
  return { total, failed }
}
