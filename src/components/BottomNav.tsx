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

export function BottomNav() {
  const t = useT()
  return (
    <nav
      aria-label={t('nav.main')}
      className="fixed inset-x-0 bottom-0 z-10 border-t border-sand bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {ITEMS.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `tap flex flex-col items-center justify-center gap-0.5 py-1.5 text-xs font-bold transition ${
                  isActive ? 'text-red' : 'text-muted hover:text-green'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`grid place-items-center rounded-full px-4 py-0.5 ${isActive ? 'bg-red/10' : ''}`}>
                    <Icon name={icon} />
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
