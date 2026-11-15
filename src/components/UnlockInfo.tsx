import { Link } from 'react-router'
import { missionById } from '../content/missions'
import { earnedCount } from '../content/badges'
import { useChildMissions } from '../content/useChildMissions'
import type { Mission } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { useActiveProfile } from '../store/profiles'
import { ART } from '../world'
import { img } from './Brand'

/** How a locked mission opens: "Play X first" (with a link) or "Collect N badges" (with gems). Always a clear way forward. */
export function UnlockInfo({ mission, className = '' }: { mission: Mission; className?: string }) {
  const t = useT()
  const l = useLocalized()
  const profile = useActiveProfile()
  const u = mission.unlock
  if (!u) return null
  const before = u.after?.map(missionById).find(Boolean)
  const missions = useChildMissions()
  const have = earnedCount(profile.badges, missions)
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {u.badges !== undefined && (
        <div className="flex flex-col gap-1.5">
          <p className="font-bold">{t('unlock.badges', { n: u.badges })}</p>
          <p className="flex flex-wrap items-center gap-1" aria-label={t('unlock.have', { n: have, total: u.badges })}>
            {Array.from({ length: u.badges }, (_, i) => (
              <img key={i} src={img(i < have ? ART.gemGreen : ART.gemBlue)} alt="" className={`size-7 ${i < have ? '' : 'opacity-35 grayscale'}`} />
            ))}
            <span className="ml-1 text-sm font-extrabold text-muted">{t('unlock.have', { n: Math.min(have, u.badges), total: u.badges })}</span>
          </p>
        </div>
      )}
      {before && (
        <p className="font-bold">
          {t('unlock.after')}{' '}
          <Link to={`/mission/${before.id}`} className="font-black text-green-dark underline">
            {l(before.title)}
          </Link>
        </p>
      )}
    </div>
  )
}
