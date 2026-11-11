import { useNavigate } from 'react-router'
import { AgePicker } from '../components/AgePicker'
import { Icon } from '../components/Icon'
import { Button, Screen, TopBar } from '../components/ui'
import { useT } from '../i18n/useT'

export function AgeSelect() {
  const t = useT()
  const navigate = useNavigate()

  return (
    <Screen>
      <TopBar title={t('age.title')} />
      <div className="flex flex-1 flex-col gap-5 px-5 pb-6">
        <p className="text-center font-bold text-muted">{t('age.subtitle')}</p>
        <AgePicker />
        <div className="mt-auto flex flex-col items-center gap-3 pt-2">
          <Button variant="accent" className="w-full max-w-xs" onClick={() => navigate('/home')}>
            {t('age.next')}
            <Icon name="chevron" />
          </Button>
          <p className="text-center text-sm text-muted">{t('age.hint')}</p>
        </div>
      </div>
    </Screen>
  )
}
