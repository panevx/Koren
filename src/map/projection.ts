/**
 * Equirectangular projection used for the KOREN map.
 * Must match the constants in scripts/build-map.mjs (which generated src/map/geo.ts).
 */
export const LON0 = 22.0
export const LAT1 = 44.5
const PHI = 42.7
const LON1 = 29.0
const COS = Math.cos((PHI * Math.PI) / 180)
const K = 1000 / ((LON1 - LON0) * COS)

/** Map units per kilometre (1° of latitude ≈ 111.2 km). */
export const UNITS_PER_KM = K / 111.2

export function project(lat: number, lon: number): { x: number; y: number } {
  return { x: (lon - LON0) * COS * K, y: (LAT1 - lat) * K }
}

/** Ray-casting point-in-polygon. */
export function insidePolygon(x: number, y: number, ring: ReadonlyArray<readonly [number, number]>): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]!
    const [xj, yj] = ring[j]!
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
