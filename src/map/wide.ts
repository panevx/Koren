/**
 * Projection of the wide (Balkans) map used by the timeline.
 * Must match the constants in scripts/build-balkans.mjs (which generated src/map/balkans.ts).
 */
const LON0 = 18.3
const LON1 = 30.8
const LAT1 = 47.3
const PHI = 43.3
const COS = Math.cos((PHI * Math.PI) / 180)
const K = 1000 / ((LON1 - LON0) * COS)

/** View limits in degrees — content/timeline points must stay inside (with a margin for points placed in the sea). */
export const WIDE_BOUNDS = { latMin: 38.3, latMax: 48.3, lonMin: 17.3, lonMax: 31.8 } as const

export function projectWide(lat: number, lon: number): [number, number] {
  return [(lon - LON0) * COS * K, (LAT1 - lat) * K]
}

const f = (n: number) => Math.round(n * 10) / 10

/**
 * Closed, smooth SVG path through the points (Catmull-Rom → cubic Bézier).
 * Hand-placed border points become a soft line instead of a jagged polygon.
 */
export function smoothClosedPath(points: ReadonlyArray<readonly [number, number]>): string {
  const n = points.length
  if (n < 3) return ''
  const at = (i: number) => points[((i % n) + n) % n]!
  let d = `M${f(at(0)[0])} ${f(at(0)[1])}`
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2)
    const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`
  }
  return d + 'Z'
}
