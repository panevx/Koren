import { Link } from 'react-router'
import { useT } from '../i18n/useT'
import { Icon } from './Icon'

/** Banner that opens the timeline (shown on the History list and under the map). */
export function TimelineLink() {
  const t = useT()
  return (
    <Link to="/timeline" className="press puck flex items-center gap-3 rounded-full bg-sky py-2 pr-5 pl-2 text-ink [--edge:var(--color-sky-deep)]">
      <span className="grid size-[min(3rem,12vw)] shrink-0 place-items-center rounded-full bg-white">
        <Icon name="clock" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[length:min(1.125rem,5.4vw)] leading-tight font-black">{t('timeline.open')}</span>
        <span className="block text-sm leading-snug font-bold">{t('timeline.openHint')}</span>
      </span>
      <Icon name="chevron" className="shrink-0" />
    </Link>
  )
}
