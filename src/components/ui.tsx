import { useEffect, type ComponentProps, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { useT } from '../i18n/useT'
import { m, pageEnter } from '../motion'
import { BottomNav } from './BottomNav'
import { Icon } from './Icon'

/**
 * Phone-width column, centred on tablets and laptops. Every screen slides in softly.
 * The navigation is rendered OUTSIDE the animated column: a transformed ancestor would break its `position: fixed`.
 * - `nav`: shows the navigation (bottom pill, side rail on a sideways phone, side bar on a computer).
 * - `wide`: on a computer the screen may use the whole width next to the side bar (it lays itself out in columns);
 *   without it the phone column stays centred in the free space.
 */
export function Screen({
  children,
  className = '',
  nav = false,
  wide = false,
  atmosphere = false,
}: {
  children: ReactNode
  className?: string
  nav?: boolean
  wide?: boolean
  /** v0.26: the lit "Depth 0" background (sunlight top-left, sky top-right) instead of flat cream. */
  atmosphere?: boolean
}) {
  return (
    <div
      className={`min-h-dvh overflow-x-clip bg-cream ${atmosphere ? 'atmosphere' : ''} ${nav ? 'short:pl-[calc(5.25rem+env(safe-area-inset-left))] wide:pl-[calc(var(--rail)+1rem)]' : ''}`}
    >
      <m.main {...pageEnter} className={`mx-auto flex min-h-dvh w-full max-w-md flex-col ${wide ? 'wide:max-w-6xl wide:px-4' : ''} ${className}`}>
        {children}
      </m.main>
      {nav && <BottomNav refined={atmosphere} />}
    </div>
  )
}

type Variant = 'primary' | 'accent' | 'secondary'

/** Pill buttons with a 3D side. White on green needs bold text-xl (see contrast rules in index.css). */
const variants: Record<Variant, string> = {
  primary: 'puck bg-coral text-coral-ink [--edge:var(--color-coral-deep)]',
  accent: 'puck bg-green text-white [--edge:var(--color-green-deep)]',
  secondary: 'puck bg-white text-ink [--edge:var(--color-sand)]',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ComponentProps<'button'> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`tap press inline-flex items-center justify-center gap-2 rounded-full px-7 py-1.5 text-center text-xl leading-tight font-extrabold disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}

/** White surface with the soft layered shadow — the basic card. No borders. */
export function Card({ children, className = '', as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'li' }) {
  return <Tag className={`rounded-level bg-white shadow-soft ${className}`}>{children}</Tag>
}

/** Round white button with an icon (back, close, settings). */
export const roundButton = 'tap press grid shrink-0 place-items-center rounded-full bg-white text-green-dark shadow-soft'

/** Browser tab / screen reader page title: "Screen – KOREN" (just "KOREN" without a screen name). */
export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} – KOREN` : 'KOREN'
  }, [title])
}

/** Title bar with a back button, used on every inner screen. */
export function TopBar({
  title,
  right,
  onBack,
  fallback = '/home',
}: {
  title: string
  right?: ReactNode
  onBack?: () => void
  /** Where "back" goes when the screen was opened directly (no in-app history). */
  fallback?: string
}) {
  const t = useT()
  const navigate = useNavigate()
  useTitle(title)
  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate(fallback, { replace: true })
  }
  return (
    <header className="flex items-center gap-3 px-4 pt-4 pb-3 short:pt-2 short:pb-2">
      <button type="button" onClick={onBack ?? goBack} className={roundButton} aria-label={t('nav.back')}>
        <Icon name="back" />
      </button>
      {/* Also capped by its own width: between two 64 px buttons on a 280 px folding phone "пътешественика" broke in two. */}
      <h1 className="min-w-0 flex-1 text-center leading-tight font-black [container-type:inline-size]">
        <span className="block text-[length:min(1.5rem,6.4vw,12cqw)]">{title}</span>
      </h1>
      <div className="tap grid shrink-0 place-items-center">{right}</div>
    </header>
  )
}
