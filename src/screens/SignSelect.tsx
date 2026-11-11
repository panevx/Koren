import { useNavigate } from 'react-router'
import { img } from '../components/Brand'
import { Icon } from '../components/Icon'
import { AvatarPicker, avatarImg } from '../components/ProfileAvatar'
import { Button, Screen, TopBar } from '../components/ui'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { activeProfile, useProfiles } from '../store/profiles'
import { useSettings } from '../store/settings'

/** Last onboarding step: the child picks a sign (no name needed — typing is hard at 4). */
export function SignSelect() {
  const t = useT()
  const navigate = useNavigate()
  const avatar = useProfiles((s) => activeProfile(s).avatar)
  const setAvatar = useProfiles((s) => s.setAvatar)
  const completeOnboarding = useSettings((s) => s.completeOnboarding)
  return (
    <Screen>
      <TopBar title={t('sign.title')} fallback="/age" />
      <div className="flex flex-1 flex-col gap-5 px-5 pb-6">
        <p className="text-center font-bold text-muted">{t('sign.subtitle')}</p>

        {/* The chosen sign, big — it jumps in every time the child picks another one. */}
        <div className="grid place-items-center" aria-hidden="true">
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
        <Button
          variant="accent"
          className="mt-auto w-full"
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
