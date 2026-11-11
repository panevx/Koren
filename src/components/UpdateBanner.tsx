import { useT } from '../i18n/useT'
import { usePwa } from '../offline/pwa'
import { Button } from './ui'

/** Hub banner when a new version is waiting. Shown only between missions. */
export function UpdateBanner() {
  const t = useT()
  const { needRefresh, update } = usePwa()
  if (!needRefresh) return null
  return (
    <div role="status" className="rounded-level mb-3 flex items-center gap-3 border-2 border-gold bg-gold/20 px-3 py-2">
      <span className="flex-1 font-extrabold">{t('offline.update')}</span>
      <Button variant="accent" className="px-4 text-base" onClick={update}>
        {t('offline.updateNow')}
      </Button>
    </div>
  )
}
