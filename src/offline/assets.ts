import type { Mission } from '../content/schema'
import { AVATARS } from '../store/profiles'
import { avatarImg } from '../components/ProfileAvatar'
import { SECTIONS, sectionIcon } from '../sections'

/** Images the interface itself uses (paths inside public/img). */
export const UI_IMAGES: readonly string[] = [
  'logo/koren.svg',
  'logo/koren-compact.svg',
  'logo/koren-white.svg',
  'heroes/koren-raya-512.webp',
  'heroes/koren-raya-768.webp',
  'scenes/header-520.webp',
  'scenes/header-720.webp',
  'ornaments/left.png',
  'ornaments/right.png',
  ...['koren', 'raya'].flatMap((h) => ['joy', 'thoughtful', 'surprise', 'determination', 'laughter'].map((m) => `heroes/${h}-${m}.webp`)),
  ...SECTIONS.map((s) => sectionIcon(s.id)),
  ...AVATARS.map(avatarImg),
]

/** Every image a mission can show: hero poses, badge, puzzle picture, picture answers. */
export function missionImages(m: Mission): string[] {
  const out = [m.badge.icon]
  for (const level of Object.values(m.levels)) {
    if (!level) continue
    for (const s of level.story) {
      out.push(`poses/${s.hero}-${s.pose}.webp`)
      if (s.img) out.push(s.img)
    }
    const g = level.game
    if (g.type === 'puzzle') out.push(g.img)
    const options = [
      ...(g.type === 'quiz' ? g.questions.flatMap((q) => q.options) : []),
      ...(g.type === 'match' ? g.pairs.flatMap((p) => [p.a, p.b]) : []),
      ...(g.type === 'order' ? g.items : []),
      ...level.check.flatMap((q) => q.options),
    ]
    for (const o of options) if (o.img) out.push(o.img)
  }
  return out
}

/** Everything "Download all for the trip" fetches. */
export function allImages(missions: readonly Mission[]): string[] {
  return [...new Set([...UI_IMAGES, ...missions.flatMap(missionImages)])].sort()
}
