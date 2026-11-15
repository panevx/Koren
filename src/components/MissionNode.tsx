import { BadgeArt } from './BadgeArt'
import { img } from './Brand'
import { Icon } from './Icon'
import { placeById } from '../content/places'
import type { Mission } from '../content/schema'
import type { Status } from '../content/progress'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { ART } from '../world'

/** The picture of a stop: its landmark, the treasure chest for bonus missions, else its badge. */
export function stopArt(mission: Mission, open: boolean): { src: string; badge: boolean } {
  if (mission.unlock?.badges) return { src: open ? ART.chestOpen : ART.chestClosed, badge: false }
  const place = placeById(mission.place)
  return place?.img ? { src: place.img, badge: false } : { src: mission.badge.icon, badge: true }
}

/**
 * One stop on the adventure path — a big round 3D button with clear states:
 * - done: golden ring and a green tick;
 * - open: white with a coral ring; the NEXT one also glows and the balloon floats beside it;
 * - locked: sand colour, faded picture and a key (tapping it says how it opens — never a dead end);
 * - new (just unlocked, never opened): pops in with a burst of light and a "New!" ribbon.
 */
export function MissionNode({
  mission,
  x,
  status,
  isNew,
  isNext,
  onOpen,
}: {
  mission: Mission
  x: number
  status: Status
  isNew: boolean
  isNext: boolean
  onOpen: () => void
}) {
  const t = useT()
  const l = useLocalized()
  const art = stopArt(mission, status !== 'locked')
  const label = `${l(mission.title)} – ${status === 'done' ? t('missions.done') : status === 'locked' ? t('path.locked') : t('path.play')}`
  return (
    <li id={`stop-${mission.id}`} className="relative h-[var(--path-row)]">
      <div className="absolute top-1/2 flex w-[min(9.5rem,40vw)] -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${x}%` }}>
        {/* entrance on a wrapper: the button's own transform belongs to the springy press */}
        <m.div initial={isNew ? { scale: 0.3, rotate: -12 } : false} animate={{ scale: 1, rotate: 0 }} transition={{ ...bouncy, delay: 0.25 }}>
        <button
          type="button"
          onClick={onOpen}
          aria-label={label}
          className={`press puck relative grid size-[min(5.75rem,24vw)] place-items-center rounded-full ${
            status === 'done'
              ? 'bg-gold-soft ring-4 ring-gold [--edge:var(--color-gold-deep)]'
              : status === 'open'
                ? 'bg-white ring-4 ring-coral [--edge:var(--color-coral-deep)]'
                : 'bg-sand [--edge:#d6ccb6]'
          }`}
        >
          {isNew && (
            <m.img
              src={img(ART.burst)}
              alt=""
              initial={{ scale: 0.4, rotate: 0, opacity: 0 }}
              animate={{ scale: 1.3, rotate: 60, opacity: [0, 0.9, 0] }}
              transition={{ duration: 1.1, delay: 0.3 }}
              className="pointer-events-none absolute inset-0 size-full"
            />
          )}
          {isNext && <span className="anim-glow pointer-events-none absolute inset-[-16%] rounded-full bg-coral/25" aria-hidden="true" />}
          {art.badge ? (
            <BadgeArt icon={art.src} earned={status !== 'locked'} className="relative size-[86%]" />
          ) : (
            <img src={img(art.src)} alt="" className={`pop-3d relative size-[84%] object-contain ${status === 'locked' ? 'opacity-45 grayscale' : ''}`} />
          )}
          {status === 'locked' && <img src={img(ART.key)} alt="" className="absolute -right-1 -bottom-1 size-10 drop-shadow" />}
          {status === 'done' && (
            <span className="absolute -right-1 -bottom-1 grid size-9 place-items-center rounded-full bg-green-dark text-white ring-[3px] ring-white" aria-hidden="true">
              <Icon name="check" width="1.1em" height="1.1em" />
            </span>
          )}
          {isNew && (
            <m.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: -8 }}
              transition={{ ...bouncy, delay: 0.5 }}
              className="absolute -top-2 -left-3 rounded-full bg-coral px-2.5 py-0.5 text-xs font-black text-coral-ink shadow-soft"
              aria-hidden="true"
            >
              {t('unlock.new')}
            </m.span>
          )}
        </button>
        </m.div>
        <span
          className={`mt-2 line-clamp-2 rounded-full px-2.5 py-0.5 text-center text-[length:min(0.85rem,3.6vw)] leading-tight font-extrabold ${
            status === 'locked' ? 'bg-white/80 text-muted' : 'bg-white text-ink shadow-soft'
          }`}
          aria-hidden="true"
        >
          {l(mission.title)}
        </span>
      </div>
      {isNext && (
        <img
          src={img(ART.balloon)}
          alt={t('path.here')}
          className="anim-float pointer-events-none absolute top-[4%] size-[min(4.5rem,19vw)]"
          style={{ left: `${x < 50 ? x + 22 : x - 38}%` }}
        />
      )}
    </li>
  )
}
