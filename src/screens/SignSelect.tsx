import { useNavigate } from 'react-router'
import { img } from '../components/Brand'
import { Icon } from '../components/Icon'
import { AvatarPicker, avatarImg } from '../components/ProfileAvatar'
import { Button, Screen, TopBar } from '../components/ui'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { activeProfile, useProfiles, visibleAvatar } from '../store/profiles'
import { useSettings } from '../store/settings'

/** Last onboarding step: the child picks a sign (no name needed — typing is hard at 4). */
export function SignSelect() {
  const t = useT()
  const navigate = useNavigate()
  const avatar = useProfiles((s) => activeProfile(s).avatar)
  const setAvatar = useProfiles((s) => s.setAvatar)
  const completeOnboarding = useSettings((s) => s.completeOnboarding)
  return (
    <Screen className="h-dvh wide:h-auto">
      <TopBar title={t('sign.title')} fallback="/age" />
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pt-1 pb-4 wide:overflow-visible">
        <p className="text-center font-bold text-muted">{t('sign.subtitle')}</p>

        {/* The chosen sign, big — it jumps in every time the child picks another one. */}
        <div className="hidden place-items-center wide:grid" aria-hidden="true">
          <div className="grid size-36 place-items-center rounded-full bg-gold shadow-[inset_0_3px_0_rgb(255_255_255/0.5),0_7px_0_var(--color-gold-deep),0_22px_30px_-14px_rgb(28_43_35/0.45)]">
            <m.img
              key={avatar}
              src={img(avatarImg(avatar))}
              alt=""
              initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={bouncy}
              className="pop-3d size-24 object-contain"
            />
          </div>
        </div>

        <AvatarPicker value={avatar} onChange={setAvatar} />
      </div>
      <div className="flex shrink-0 items-center gap-3 border-t border-green/15 bg-cream px-5 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
        <img src={img(avatarImg(avatar))} alt="" className="size-12 shrink-0 object-contain" />
        <span className="min-w-0 flex-1 font-extrabold leading-tight">{t(`avatar.${visibleAvatar(avatar)}`)}</span>
        <Button
          variant="accent"
          className="shrink-0"
          onClick={() => {
            completeOnboarding()
            navigate('/home')
          }}
        >
          {t('age.next')}
          <Icon name="chevron" />
        </Button>
      </div>
    </Screen>
  )
}
