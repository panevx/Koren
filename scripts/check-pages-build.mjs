import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'

const output = process.argv[2] ?? 'dist'
const base = process.env.BASE_PATH ?? '/'
const family = process.argv.includes('--family')
const html = readFileSync(join(output, 'index.html'), 'utf8')
const scripts = [...html.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+\.js)"/g)]
if (!scripts.length) throw new Error('No entry script in the built page')
const entryBytes = scripts.reduce((total, [, path]) => {
  if (!path.startsWith(base)) throw new Error(`Invalid Pages base in ${path}`)
  return total + gzipSync(readFileSync(join(output, path.slice(base.length)))).length
}, 0)
const sw = readFileSync(join(output, 'sw.js'), 'utf8')
const precache = [...sw.matchAll(/url:"([^"]+)"/g)]
if (!precache.length) throw new Error('No assets in the service worker precache manifest')
const precacheBytes = precache.reduce((total, [, path]) => total + readFileSync(join(output, path)).length, 0)
for (const route of ['404', 'home', 'map', 'missions', 'parents', 'topic/history']) {
  if (!existsSync(join(output, `${route}.html`))) throw new Error(`Missing static page for ${route}`)
}
const hubIds = new Set()
for (const file of readdirSync('content/missions').filter((name) => name.endsWith('.json'))) {
  const mission = JSON.parse(readFileSync(join('content/missions', file), 'utf8'))
  const expected = !family || (!mission.draft && Boolean(mission.review))
  if (expected && (!mission.draft || (!family && process.env.VITE_SHOW_DRAFTS === '1'))) hubIds.add(mission.id)
  const page = join(output, 'mission', `${mission.id}.html`)
  if (existsSync(page) !== expected) throw new Error(`Unexpected static page state for ${mission.id}`)
}

const hubFile = readdirSync(join(output, 'assets')).find((file) => /^hubMissions-.+\.js$/.test(file))
if (!hubFile) throw new Error('No mission index in the built page')
if (!precache.some(([, path]) => path === `assets/${hubFile}`)) throw new Error('Home mission index is not available offline')
const hubPath = resolve(output, 'assets', hubFile)
const hubBytes = gzipSync(readFileSync(hubPath)).length
const { HUB_MISSIONS } = await import(pathToFileURL(hubPath).href)
if (HUB_MISSIONS.length !== hubIds.size || HUB_MISSIONS.some((m) => !hubIds.delete(m.id) || 'levels' in m)) {
  throw new Error('Home mission index contains unexpected data')
}

// Budgets cover the JS entry, home mission index, and complete precache.
// v0.24: precache 1.75 → 2.3 MB (uncompressed): the 7–14 levels got a second round and 3 questions, plus 12 exam missions.
// The missions chunk is ~220 KB gzip and loads only when a mission or the path opens — the hub stays on the small index.
// v0.27.1: precache 2.3 → 2.45 MB (uncompressed), approved by the owner: 18 missions for every place and peak on the map
// (+~120 KB of mission text, ~+30 KB over the network with gzip).
console.log(`Pages entry: ${entryBytes} gzip bytes. Home mission index: ${hubBytes} gzip bytes. Precache: ${precacheBytes} uncompressed bytes.`)
if (entryBytes > 160_000 || hubBytes > 10_000 || precacheBytes > 2_450_000) throw new Error('Pages build exceeds its size budget')
