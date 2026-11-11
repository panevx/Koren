import { useNavigate } from 'react-router'
import { Icon } from '../components/Icon'
import { AvatarPicker } from '../components/ProfileAvatar'
import { Button, Screen, TopBar } from '../components/ui'
import { useT } from '../i18n/useT'
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
