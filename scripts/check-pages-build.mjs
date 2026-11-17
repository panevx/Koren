import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
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
for (const file of readdirSync('content/missions').filter((name) => name.endsWith('.json'))) {
  const mission = JSON.parse(readFileSync(join('content/missions', file), 'utf8'))
  const expected = !family || (!mission.draft && Boolean(mission.review))
  const page = join(output, 'mission', `${mission.id}.html`)
  if (existsSync(page) !== expected) throw new Error(`Unexpected static page state for ${mission.id}`)
}

// Budgets cover the measured JS entry and the complete precache independently.
console.log(`Pages entry: ${entryBytes} gzip bytes. Precache: ${precacheBytes} uncompressed bytes.`)
if (entryBytes > 160_000 || precacheBytes > 1_750_000) throw new Error('Pages build exceeds its size budget')
