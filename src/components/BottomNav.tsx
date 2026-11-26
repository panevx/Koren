import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { NavLink, useLocation } from 'react-router'
import type { TKey } from '../i18n'
import { useT } from '../i18n/useT'
import { img, Logo } from './Brand'

/** The four main places. Each has a 3D picture (the same art as on the home screen). */
const ITEMS: readonly { to: string; label: TKey; art: string; round?: boolean }[] = [
  { to: '/home', label: 'nav.home', art: 'heroes/koren-joy.webp', round: true },
  { to: '/map', label: 'nav.map', art: 'tiles/discover.webp' },
  { to: '/missions', label: 'nav.missions', art: 'tiles/missions.webp' },
  { to: '/collection', label: 'nav.collection', art: 'tiles/collection.webp' },
]

/**
 * The navigation bar is mounted again on every screen, so the sliding highlight remembers where it was:
 * it starts at the previous tab and glides to the new one (CSS transform only).
 */
let lastIndex = 0

/**
 * Navigation — part of the game, not a toolbar:
 * - phone: a floating pill at the bottom; the active tab's picture jumps up and a soft highlight slides under it;
 * - phone held sideways (`short:`): a rail on the left, so it does not cover the low screen;
 * - computer / tablet sideways (`wide:`): a side bar with the logo and big rows.
 */
export function BottomNav({ refined = false }: { refined?: boolean }) {
  const nav = useRef<HTMLElement>(null)
  useEffect(() => {
    const element = nav.current
    const screen = element?.parentElement
    if (!element || !screen || typeof ResizeObserver === 'undefined') return
    const measure = () => screen.style.setProperty('--nav-height', `${element.offsetHeight}px`)
    const observer = new ResizeObserver(measure)
    measure()
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const t = useT()
  const { pathname } = useLocation()
  const active = ITEMS.findIndex((it) => pathname === it.to || pathname.startsWith(it.to + '/'))
  const [at, setAt] = useState(active >= 0 ? lastIndex : -1)
  useEffect(() => {
    if (active < 0) return
    // next frame: let the browser paint the old position first, then glide
    const id = requestAnimationFrame(() => setAt(active))
    lastIndex = active
    return () => cancelAnimationFrame(id)
  }, [active])

  return (
    <nav
      ref={nav}
      aria-label={t('nav.main')}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] short:inset-y-0 short:right-auto short:flex short:items-center short:pr-0 short:pb-0 short:pl-[max(0.5rem,env(safe-area-inset-left))] wide:inset-y-0 wide:right-auto wide:w-[var(--rail)] wide:p-4 wide:pr-0"
    >
      {/* v0.26 (hub only for now): a soft cream fade under the floating pill, so content scrolling beneath it dissolves
          instead of colliding with it. Phone only — on the side rails nothing scrolls under the nav. */}
      {refined && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[calc(100%+1.75rem)] bg-[linear-gradient(to_top,var(--color-cream)_0%,rgb(248_245_237/0.92)_45%,rgb(248_245_237/0)_100%)] short:hidden wide:hidden"
        />
      )}
      <div className={`${refined ? 'mat-glass edge-light' : 'bg-white shadow-float'} pointer-events-auto relative mx-auto max-w-sm rounded-full px-2 py-1.5 short:w-[4.75rem] short:rounded-[2.25rem] short:px-1 short:py-2 wide:flex wide:h-full wide:max-w-none wide:flex-col wide:gap-6 wide:rounded-[var(--radius-stage)] wide:px-3 wide:py-6`}>
        <Logo size="sm" className="mx-auto hidden h-14 wide:block" />
        <ul className="relative grid grid-cols-4 short:grid-cols-1 short:gap-1 wide:grid-cols-1 wide:gap-2">
          {/* The sliding highlight under the active tab. One cell = 100% of its own size, so translate by the index. */}
          {at >= 0 && (
            <li
              aria-hidden="true"
              className="nav-hl pointer-events-none absolute top-0 left-0 transition-transform duration-500 ease-[var(--ease-spring)]"
              style={{ '--i': at } as CSSProperties}
            >
              <span className={`block size-full rounded-full wide:rounded-[1.25rem] ${refined ? 'nav-marker' : 'bg-green-soft'}`} />
            </li>
          )}
          {ITEMS.map(({ to, label, art, round }) => (
            <li key={to} className="relative">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `press group flex min-h-[var(--tap)] flex-col items-center justify-end gap-0.5 rounded-full pb-1 text-[length:min(0.75rem,3.3vw)] font-extrabold wide:flex-row wide:justify-start wide:gap-3 wide:rounded-[1.25rem] wide:px-3 wide:py-2 wide:text-base ${
                    isActive ? 'text-green-dark' : 'text-muted'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <img
                      src={img(art)}
                      alt=""
                      draggable={false}
                      className={`size-9 object-contain transition-transform duration-500 ease-[var(--ease-spring)] wide:size-11 ${round ? 'rounded-full bg-gold-soft' : ''} ${
                        isActive ? 'pop-3d -translate-y-1.5 scale-125 wide:translate-y-0 wide:scale-110' : 'opacity-80 saturate-[0.7] group-hover:opacity-100'
                      }`}
                    />
                    {t(label)}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
