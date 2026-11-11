import type { ComponentType } from 'react'
import { BookArt, CastleArt, GamepadArt, MapArt, ShevitsaArt, TrophyArt } from './components/Art'
import type { TKey } from './i18n'

export type SectionId = 'discover' | 'history' | 'culture' | 'language' | 'missions' | 'collection'

export type Section = {
  id: SectionId
  path: string
  label: TKey
  desc: TKey
  Art: ComponentType<{ className?: string }>
  /** Roadmap version in which this section starts working. */
  arrives: string
}

/** The six hub tiles, in display order. Paths are also the bottom-nav targets. */
export const SECTIONS: readonly Section[] = [
  { id: 'discover', path: '/map', label: 'tile.discover', desc: 'tile.discover.desc', Art: MapArt, arrives: '0.4' },
  { id: 'history', path: '/topic/history', label: 'tile.history', desc: 'tile.history.desc', Art: CastleArt, arrives: '0.5' },
  { id: 'culture', path: '/topic/culture', label: 'tile.culture', desc: 'tile.culture.desc', Art: ShevitsaArt, arrives: '0.5' },
  { id: 'language', path: '/topic/language', label: 'tile.language', desc: 'tile.language.desc', Art: BookArt, arrives: '0.5' },
  { id: 'missions', path: '/missions', label: 'tile.missions', desc: 'tile.missions.desc', Art: GamepadArt, arrives: '0.3' },
  { id: 'collection', path: '/collection', label: 'tile.collection', desc: 'tile.collection.desc', Art: TrophyArt, arrives: '0.6' },
]

export function sectionById(id: string | undefined): Section | undefined {
  return SECTIONS.find((s) => s.id === id)
}
