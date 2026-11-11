import type { TKey } from '../i18n'
import { useT } from '../i18n/useT'
import { AVATARS, type AvatarId, type Profile } from '../store/profiles'
import { img } from './Brand'

/** Children pick a painted sign, never a photo. */
const AVATAR_IMG: Record<AvatarId, string> = {
  bear: 'levels/small.webp',
  compass: 'levels/young.webp',
  helmet: 'levels/guard.webp',
  martenitsa: 'tiles/culture.webp',
  backpack: 'tiles/missions.webp',
  medal: 'tiles/collection.webp',
  book: 'tiles/language.webp',
  tower: 'tiles/history.webp',
}
export const avatarImg = (a: AvatarId) => AVATAR_IMG[a]

export function ProfileAvatar({ avatar, className = 'size-12' }: { avatar: AvatarId; className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-white shadow-soft ${className}`} aria-hidden="true">
      <img src={img(AVATAR_IMG[avatar])} alt="" className="size-[76%] object-contain" />
    </span>
  )
}

/** Nickname, or "Traveller 1/2/3" when the child did not pick one. */
export function useProfileName() {
  const t = useT()
  return (p: Profile, index: number) => p.nickname || t('profile.default', { n: index + 1 })
}

/** Grid of the 8 signs — used in onboarding and in the parents' profile editor. */
export function AvatarPicker({ value, onChange }: { value: AvatarId; onChange: (a: AvatarId) => void }) {
  const t = useT()
  return (
    <div role="radiogroup" aria-label={t('profile.avatar')} className="grid grid-cols-4 gap-3">
      {AVATARS.map((a) => (
        <button
          key={a}
          type="button"
          role="radio"
          aria-checked={value === a}
          aria-label={t(`avatar.${a}` as TKey)}
          onClick={() => onChange(a)}
          className={`tap press grid aspect-square place-items-center rounded-full ${
            value === a ? 'scale-105 bg-green-soft shadow-soft ring-4 ring-green' : 'bg-white shadow-soft'
          }`}
        >
          <img src={img(AVATAR_IMG[a])} alt="" className="pop-3d size-[72%] object-contain" />
        </button>
      ))}
    </div>
  )
}
