import raw from '../../content/map/layers.json'
import peaksRaw from '../../content/map/peaks.json'
import { insidePolygon, project } from '../map/projection'

/**
 * Data layers of the Discover map (v0.15), generated from real data by scripts/build-layers.py
 * (Natural Earth; OpenStreetMap where Natural Earth has no river) — already in the app's projection.
 * Peaks: content/map/peaks.json (coordinates checked against the elevation data by scripts/build-relief.py).
 */
type Text = { bg: string; en: string }
export type Province = { id: string; name: Text; centre: Text; d: string; lx: number; ly: number; color: number }
export type River = { id: string; name: Text; into: Text; d: string; lx: number; ly: number }
export type Lake = { id: string; name: Text; d: string; lx: number; ly: number }
export type Neighbour = { id: string; name: Text; capital: Text; at: [number, number] }
export type Range = { id: string; name: Text; at: [number, number] }
export type Peak = { id: string; name: Text; height: number; range: string; lat: number; lon: number; x: number; y: number }

const data = raw as unknown as {
  sources: string[]
  provinces: Province[]
  rivers: River[]
  lakes: Lake[]
  neighbours: Neighbour[]
  ranges: Range[]
  sea: { id: string; name: Text; at: [number, number] }
}

export const { provinces: PROVINCES, rivers: RIVERS, lakes: LAKES, neighbours: NEIGHBOURS, ranges: RANGES, sea: SEA, sources: SOURCES } = data

export const PEAKS: Peak[] = (peaksRaw as Omit<Peak, 'x' | 'y'>[]).map((p) => ({ ...p, ...project(p.lat, p.lon) }))

/** Rings of an SVG path made of M…L…Z (what build-layers.py writes). */
export function rings(d: string): [number, number][][] {
  return d
    .split('M')
    .filter(Boolean)
    .map((part) =>
      part
        .replace(/Z$/, '')
        .split('L')
        .map((pt) => pt.trim().split(' ').map(Number) as [number, number]),
    )
}

const RINGS = new Map(PROVINCES.map((p) => [p.id, rings(p.d)]))

/** The province at a point of the map (even-odd over all rings, so Sofia City is a hole in Sofia Province). */
export function provinceAt(x: number, y: number): Province | undefined {
  return PROVINCES.find((p) => RINGS.get(p.id)!.filter((r) => insidePolygon(x, y, r)).length % 2 === 1)
}

/** Soft fill colours of the provinces (neighbours never share one — build-layers.py). */
export const PROVINCE_FILL = ['#ffd35a', '#72c8f5', '#ff9c8f', '#8ed4a6', '#c9b6f2', '#f5b971'] as const
