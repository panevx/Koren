import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The first download: everything that main.tsx reaches through STATIC imports (lazy screens and `import()` are not
 * followed). The validation library and the mission files must stay out of it — they arrive a moment later, after the
 * hub has painted. Stage 9 broke this once (the hat on the child's sign pulled in the path → zod, +100 KB).
 */
function staticGraph(entry: string) {
  const seen = new Set<string>()
  const packages = new Set<string>()
  const stack = [entry]
  while (stack.length) {
    const file = stack.pop()!
    if (seen.has(file)) continue
    seen.add(file)
    if (!/\.(ts|tsx)$/.test(file)) continue
    const src = readFileSync(file, 'utf8')
    for (const m of src.matchAll(/^\s*import\s+(?!type\b)(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/gm)) {
      const spec = m[1]!
      if (!spec.startsWith('.')) {
        packages.add(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]!)
        continue
      }
      const base = resolve(dirname(file), spec)
      const hit = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find((p) => existsSync(p) && !p.endsWith('/'))
      if (hit && !seen.has(hit)) stack.push(hit)
    }
  }
  return { files: [...seen].map((f) => f.replace(`${resolve(__dirname, '..')}/`, '')), packages }
}

describe('first download', () => {
  const { files, packages } = staticGraph(resolve(__dirname, '../src/main.tsx'))

  it('does not include the validation library', () => {
    expect([...packages]).not.toContain('zod')
    expect(files).not.toContain('src/content/schema.ts')
  })

  it('does not include the missions, the map layers or the path', () => {
    expect(files.some((f) => f.startsWith('content/missions/'))).toBe(false)
    expect(files).not.toContain('src/content/missions.ts')
    expect(files).not.toContain('src/content/layers.ts')
    expect(files).not.toContain('src/content/path.ts')
  })

  it('does include the hub (sanity check that the graph is followed)', () => {
    expect(files).toContain('src/screens/Home.tsx')
    expect(files).toContain('src/content/shop.ts')
  })
})
