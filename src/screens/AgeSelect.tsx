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
        {wide && <p className="text-center text-sm text-muted">{t('age.hint')}</p>}
        {/* Phone: "Next" and the note for parents stay at hand in a solid bar at the bottom edge — the worlds scroll above it,
            nothing is half-covered by a fade, and the page ends with the bar's own room (sticky = it takes its place in the flow). */}
        {!wide && (
          <div className="sticky bottom-0 z-10 -mx-4 mt-auto flex flex-col gap-2 bg-cream px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-1px_0_rgb(52_44_24/0.06),0_-14px_24px_-18px_rgb(52_44_24/0.35)] short:static short:shadow-none">
            {next}
            <p className="text-center text-[length:min(0.8125rem,3.5vw)] leading-snug text-muted">{t('age.hint')}</p>
          </div>
        )}
      </div>
    </Screen>
  )
}
