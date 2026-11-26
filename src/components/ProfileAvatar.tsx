import type { TKey } from '../i18n'
import { useT } from '../i18n/useT'
import { AVATARS, visibleAvatar, type AvatarId, type Profile } from '../store/profiles'
import { img } from './Brand'
import { shopItem } from '../content/shop'

export function avatarImg(id: AvatarId) {
  const avatar = visibleAvatar(id)
  return avatar === 'bear' ? 'levels/small.webp' : `plush/${avatar}.webp`
}

/**
 * The child's sign. v0.22: with `outfit`, what the child wears from the fair stall shows on it —
 * the hat on top, the pin on the side (the rest is listed in the shop's wardrobe).
 */
export function ProfileAvatar({ avatar, className = 'size-12', outfit }: { avatar: AvatarId; className?: string; outfit?: Partial<Record<string, string>> }) {
  const head = outfit?.head && shopItem(outfit.head)
  const pin = outfit?.pin && shopItem(outfit.pin)
  return (
    <span className={`edge-light relative grid shrink-0 place-items-center rounded-full mat-paper ${className}`} aria-hidden="true">
      <img src={img(avatarImg(avatar))} alt="" className="size-[76%] object-contain" />
      {head && <img src={img(head.img)} alt="" className="pop-3d absolute -top-[38%] left-1/2 w-[78%] -translate-x-1/2 object-contain" />}
      {pin && <img src={img(pin.img)} alt="" className="pop-3d absolute -right-[12%] -bottom-[8%] w-[42%] object-contain" />}
    </span>
  )
}

/** Nickname, or "Traveller 1/2/3" when the child did not pick one. */
export function useProfileName() {
  const t = useT()
  return (p: Profile, index: number) => p.nickname || t('profile.default', { n: index + 1 })
}

/** Animal avatar picker — used in onboarding and in the parents' profile editor. */
export function AvatarPicker({ value, onChange }: { value: AvatarId; onChange: (a: AvatarId) => void }) {
  const t = useT()
  return (
    <div role="radiogroup" aria-label={t('profile.avatar')} className="grid grid-cols-4 gap-3">
      {AVATARS.map((a) => (
        <button
          key={a}
          type="button"
          role="radio"
          aria-checked={visibleAvatar(value) === a}
          aria-label={t(`avatar.${a}` as TKey)}
          onClick={() => onChange(a)}
          className={`tap press grid aspect-square place-items-center rounded-full ${
            visibleAvatar(value) === a ? 'scale-105 bg-green-soft shadow-soft ring-4 ring-green' : 'bg-white shadow-soft'
          }`}
        >
          <img src={img(avatarImg(a))} alt="" className="pop-3d size-[72%] object-contain" />
        </button>
      ))}
    </div>
  )
}
