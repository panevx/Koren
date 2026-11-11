import { useT } from '../i18n/useT'
import { usePwa } from '../offline/pwa'
import { Button } from './ui'

/** Hub banner when a new version is waiting. Shown only between missions. */
export function UpdateBanner() {
  const t = useT()
  const { needRefresh, update } = usePwa()
  if (!needRefresh) return null
  return (
    <div role="status" className="flex items-center gap-3 rounded-full bg-gold py-1.5 pr-1.5 pl-5 shadow-soft">
      <span className="min-w-0 flex-1 font-extrabold text-ink">{t('offline.update')}</span>
      <Button variant="secondary" className="px-5 text-base" onClick={update}>
        {t('offline.updateNow')}
      </Button>
    </div>
  )
}
