import type { Mission } from '../content/schema'
import { PLACES } from '../content/places'
import { ART, GAME_ART, MODE_ART } from '../world'
import { AVATARS } from '../store/profiles'
import { avatarImg } from '../components/ProfileAvatar'
import { SECTIONS, sectionIcon } from '../sections'
import { MAP_IMAGES } from '../map/art'
import { SHOP } from '../content/shop'
import { FAME } from '../content/fame'

/** Images the interface itself uses (paths inside public/img). */
export const UI_IMAGES: readonly string[] = [
  'logo/koren.svg',
  'logo/koren-compact.svg',
  'logo/koren-white.svg',
  'heroes/koren-wave.webp',
  'heroes/raya-wave.webp',
  'ornaments/left.png',
  'ornaments/right.png',
  ...['koren', 'raya'].flatMap((h) => ['joy', 'thoughtful', 'surprise', 'determination', 'laughter'].map((m) => `heroes/${h}-${m}.webp`)),
  ...SECTIONS.map((s) => sectionIcon(s.id)),
  'levels/guard.webp',
  ...AVATARS.map(avatarImg),
  ...Object.values(ART),
  ...Object.values(GAME_ART),
  ...Object.values(MODE_ART).flatMap((m) => [m.hero, m.far]),
  ...PLACES.flatMap((p) => (p.img ? [p.img] : [])),
  ...MAP_IMAGES,
  // v0.21–0.22: the Hall of Fame and the fair stall
  ...FAME.map((p) => p.img),
  ...SHOP.map((i) => i.img),
]

/** Every image a mission can show: hero poses, badge and every picture named anywhere in its games. */
export function missionImages(m: Mission): string[] {
  const out = [m.badge.icon]
  for (const level of Object.values(m.levels)) {
    if (!level) continue
    for (const s of level.story) out.push(`poses/${s.hero}-${s.pose}.webp`)
  }
  // Any "folder/name.webp" string inside the mission (story pictures, answers, scene objects, covers…).
  const walk = (v: unknown): void => {
    if (typeof v === 'string') {
      if (/^[a-z0-9/_-]+\.(webp|png|svg)$/.test(v)) out.push(v)
    } else if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v === 'object') Object.values(v).forEach(walk)
  }
  walk(m.levels)
  return out
}

/** Everything "Download all for the trip" fetches. */
export function allImages(missions: readonly Mission[]): string[] {
  return [...new Set([...UI_IMAGES, ...missions.flatMap(missionImages)])].sort()
}
