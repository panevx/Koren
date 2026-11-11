import type { Hero } from './components/Brand'
import type { TKey } from './i18n'

export type SectionId = 'discover' | 'history' | 'culture' | 'language' | 'missions' | 'collection'

export type Section = {
  id: SectionId
  path: string
  label: TKey
  desc: TKey
  /** Roadmap version in which this section starts working. */
  arrives: string
  /** Which hero talks on this section's screens. */
  host: Hero
}

/** The six hub tiles, in display order. Paths are also the bottom-nav targets. */
export const SECTIONS: readonly Section[] = [
  { id: 'discover', path: '/map', label: 'tile.discover', desc: 'tile.discover.desc', arrives: '0.4', host: 'koren' },
  { id: 'history', path: '/topic/history', label: 'tile.history', desc: 'tile.history.desc', arrives: '0.5', host: 'raya' },
  { id: 'culture', path: '/topic/culture', label: 'tile.culture', desc: 'tile.culture.desc', arrives: '0.5', host: 'raya' },
  { id: 'language', path: '/topic/language', label: 'tile.language', desc: 'tile.language.desc', arrives: '0.5', host: 'koren' },
  { id: 'missions', path: '/missions', label: 'tile.missions', desc: 'tile.missions.desc', arrives: '0.3', host: 'koren' },
  { id: 'collection', path: '/collection', label: 'tile.collection', desc: 'tile.collection.desc', arrives: '0.6', host: 'raya' },
]

/** Painted icon of a section (design/characters/v2/tile_*.png → public/img/tiles). */
export const sectionIcon = (id: SectionId) => `tiles/${id}.webp`

export function sectionById(id: string | undefined): Section | undefined {
  return SECTIONS.find((s) => s.id === id)
}
