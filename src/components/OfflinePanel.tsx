import { useEffect, useMemo, useState } from 'react'
import { MISSIONS } from '../content/missions'
import { useT } from '../i18n/useT'
import { allImages } from '../offline/assets'
import { countCached, downloadAll, offlineSupported } from '../offline/download'
import { isIos, promptInstall, usePwa } from '../offline/pwa'
import { Icon } from './Icon'
import { Button } from './ui'

/** Parents' section: install the app and download everything for a trip without internet. */
export function OfflinePanel() {
  const t = useT()
  const paths = useMemo(() => allImages(MISSIONS), [])
  const { installEvent, installed, offlineReady } = usePwa()
  const [cached, setCached] = useState<number | null>(null)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [failed, setFailed] = useState(0)
  const supported = offlineSupported()

  useEffect(() => {
    if (supported) void countCached(paths).then(setCached)
  }, [paths, supported])

  const download = async () => {
    setFailed(0)
    setProgress({ done: 0, total: paths.length })
    const r = await downloadAll(paths, (done, total) => setProgress({ done, total }))
    setFailed(r.failed)
    setProgress(null)
    setCached(await countCached(paths))
  }

  const all = cached !== null && cached >= paths.length

  return (
    <div className="flex flex-col gap-3">
      {!supported ? (
        <p className="text-sm text-muted">{t('offline.unsupported')}</p>
      ) : (
        <>
          <p className="text-sm text-muted">{offlineReady || navigator.serviceWorker?.controller ? t('offline.ready') : t('offline.preparing')}</p>

          <div className="rounded-level flex flex-col gap-2 bg-cream p-3">
            <p className="font-bold" aria-live="polite">
              {progress
                ? t('offline.downloading', { n: progress.done, total: progress.total })
                : all
                  ? t('offline.allDone', { n: paths.length })
                  : t('offline.status', { n: cached ?? 0, total: paths.length })}
            </p>
            {progress && (
              <div className="h-3 overflow-hidden rounded-full bg-sand" aria-hidden="true">
                <div className="h-full rounded-full bg-green transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
              </div>
            )}
            {failed > 0 && <p className="text-sm font-bold text-red">{t('offline.failed', { n: failed })}</p>}
            {!all && (
              <Button variant="accent" onClick={download} disabled={progress !== null}>
                <Icon name="save" />
                {t('offline.download')}
              </Button>
            )}
          </div>
        </>
      )}

      <div className="rounded-level flex flex-col gap-2 bg-cream p-3">
        {installed ? (
          <p className="flex items-center gap-2 font-bold text-green-dark">
            <Icon name="check" />
            {t('offline.installed')}
          </p>
        ) : installEvent ? (
          <Button variant="secondary" onClick={() => void promptInstall()}>
            {t('offline.install')}
          </Button>
        ) : (
          <p className="text-sm text-muted">{isIos() ? t('offline.installIos') : t('offline.installOther')}</p>
        )}
      </div>
    </div>
  )
}
