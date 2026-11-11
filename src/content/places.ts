import { z } from 'zod'
import raw from '../../content/map/places.json'
import { project } from '../map/projection'
import { Place } from './schema'

/** All places, validated, with their position on the map (in map units). */
export const PLACES = z
  .array(Place)
  .parse(raw)
  .map((p) => ({ ...p, ...project(p.lat, p.lon) }))

export type MapPlace = (typeof PLACES)[number]

export function placeById(id: string | undefined): MapPlace | undefined {
  return PLACES.find((p) => p.id === id)
}
