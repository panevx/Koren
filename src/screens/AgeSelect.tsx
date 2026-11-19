import { useNavigate } from 'react-router'
import { AgePicker } from '../components/AgePicker'
import { Icon } from '../components/Icon'
import { Button, Screen, TopBar } from '../components/ui'
import { useT } from '../i18n/useT'
import { useWide } from '../useWide'

/** First visit, step 2: choose one of the three worlds (or the exact age), then the sign. Wide screen: three portals. */
export function AgeSelect() {
  const t = useT()
  const navigate = useNavigate()
  const wide = useWide()
  const next = (
    <Button variant="accent" className={wide ? 'shrink-0 px-10' : 'w-full'} onClick={() => navigate('/sign')}>
      {t('age.next')}
      <Icon name="chevron" />
    </Button>
  )

  return (
    <Screen wide>
      <TopBar title={t('age.title')} fallback="/" />
      <div className="flex flex-1 flex-col gap-4 px-4 wide:px-2">
        <p className="text-center font-bold text-muted">{t('age.subtitle')}</p>
        <AgePicker action={wide ? next : undefined} />
        <p className="text-center text-sm text-muted">{t('age.hint')}</p>
        {/* Phone: "Next" stays at hand — it sticks to the bottom edge (over a soft fade of the page) while the worlds scroll. */}
        {!wide && (
          <div className="sticky bottom-0 z-10 -mx-4 mt-auto bg-[linear-gradient(to_top,var(--color-cream)_62%,rgb(248_245_237/0))] px-4 pt-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            {next}
          </div>
        )}
      </div>
    </Screen>
  )
}
