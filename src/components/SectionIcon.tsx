import { useT } from '../i18n/useT'
import { sectionIcon, type SectionId } from '../sections'
import type { Level } from '../theme/levels'
import { img } from './Brand'

/**
 * Painted section icon. The language book is drawn with blank pages (image
 * generators distort Cyrillic), so the letters are added here as real text.
 * Decorative: the tile label next to it carries the meaning.
 */
export function SectionIcon({ id, className = 'size-16' }: { id: SectionId; className?: string }) {
  const t = useT()
  return (
    // container-type lets the letters scale with the icon (cqw = % of icon width).
    <span className={`relative inline-block shrink-0 ${className}`} style={{ containerType: 'inline-size' }} aria-hidden="true">
      <img src={img(sectionIcon(id))} alt="" width={256} height={256} className="size-full object-contain" decoding="async" />
      {id === 'language' && (
        <span
          className="absolute top-[31%] left-[13%] w-[38%] -rotate-6 text-center leading-none font-black text-red"
          style={{ fontSize: '12cqw' }}
        >
          {t('tile.language.glyph')}
        </span>
      )}
    </span>
  )
}

export function LevelIcon({ level, className = 'size-11' }: { level: Level; className?: string }) {
  return (
    <img
      src={img(`levels/${level}.webp`)}
      alt=""
      aria-hidden="true"
      width={192}
      height={192}
      className={`object-contain ${className}`}
      decoding="async"
    />
  )
}
