import { useNavigate } from 'react-router'
import { AgePicker } from '../components/AgePicker'
import { Icon } from '../components/Icon'
import { Button, Screen, TopBar } from '../components/ui'
import { useT } from '../i18n/useT'

/** First visit, step 2: choose one of the three worlds (or the exact age), then the sign. Wide screen: three portals. */
export function AgeSelect() {
  const t = useT()
  const navigate = useNavigate()

  return (
    <Screen wide>
      <TopBar title={t('age.title')} fallback="/" />
      <div className="flex flex-1 flex-col gap-4 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] wide:px-2">
        <p className="text-center font-bold text-muted">{t('age.subtitle')}</p>
        <AgePicker />
        <div className="mt-auto flex flex-col items-center gap-3 pt-3 wide:mx-auto wide:w-full wide:max-w-md">
          <Button variant="accent" className="w-full" onClick={() => navigate('/sign')}>
            {t('age.next')}
            <Icon name="chevron" />
          </Button>
          <p className="text-center text-sm text-muted">{t('age.hint')}</p>
        </div>
      </div>
    </Screen>
  )
}
