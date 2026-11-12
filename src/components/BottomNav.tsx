import { NavLink } from 'react-router'
import type { TKey } from '../i18n'
import { useT } from '../i18n/useT'
import { Icon, type IconName } from './Icon'

const ITEMS: readonly { to: string; label: TKey; icon: IconName }[] = [
  { to: '/home', label: 'nav.home', icon: 'home' },
  { to: '/map', label: 'nav.map', icon: 'map' },
  { to: '/missions', label: 'nav.missions', icon: 'flag' },
  { to: '/collection', label: 'nav.collection', icon: 'star' },
]

/**
 * Floating pill navigation. The active tab's icon sits in a raised green ball
 * that springs up (CSS transform only).
 */
export function BottomNav() {
  const t = useT()
  return (
    <nav
      aria-label={t('nav.main')}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <ul className="pointer-events-auto mx-auto grid max-w-sm grid-cols-4 rounded-full bg-white px-2 py-1.5 shadow-float">
        {ITEMS.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `press flex min-h-[var(--tap)] flex-col items-center justify-end gap-0.5 rounded-full pb-1 text-[length:min(0.75rem,3.3vw)] font-extrabold ${
                  isActive ? 'text-green-dark' : 'text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid size-9 place-items-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                      isActive ? 'puck -translate-y-1 scale-110 bg-green text-white [--edge:var(--color-green-deep)]' : ''
                    }`}
                  >
                    <Icon name={icon} width="1.35em" height="1.35em" />
                  </span>
                  {t(label)}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
