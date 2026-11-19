/**
 * KOREN design system (v0.13) — the shared building blocks of the "Playful 3D" look.
 * Every screen composes these instead of inventing its own card, bar or bubble:
 *
 *   PrimaryButton / SecondaryButton  → ui.tsx `Button` (3D pills)
 *   ProgressBar                      → a fill that springs to its value, optional 3D icon at its end
 *   CharacterMessage                 → Koren or Raya speaking in a bubble with a tail
 *   Panel (InteractivePanel)         → a dialog sheet: rises from the bottom on phones, centred on wide screens
 *   Sparkles                         → a short burst of particles for a success (transform + opacity only)
 *   SectionHeading                   → a section title with an optional link on the right
 *
 * Tokens (colours, radii, shadows, easing, type scale) live in src/index.css → @theme.
 */
import { useEffect, useRef, type ComponentProps, type ReactNode } from 'react'
import { Link } from 'react-router'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { Avatar, img, type Hero, type Mood } from './Brand'
import { Icon } from './Icon'
import { Button } from './ui'

export function PrimaryButton(props: Omit<ComponentProps<typeof Button>, 'variant'>) {
  return <Button variant="primary" {...props} />
}
export function SecondaryButton(props: Omit<ComponentProps<typeof Button>, 'variant'>) {
  return <Button variant="secondary" {...props} />
}

type Tone = 'green' | 'gold' | 'coral' | 'sky' | 'white'
const FILL: Record<Tone, string> = {
  green: 'bg-green',
  gold: 'bg-gold',
  coral: 'bg-coral',
  sky: 'bg-sky',
  white: 'bg-white',
}

/**
 * v0.26 meter: a recessed well with a satin fill (curved, lit from the top-left). Same spring as ProgressBar.
 * `tint` = one of the tint-* material classes; `onTint` when it sits on a coloured surface.
 */
export function Meter({
  value,
  max,
  tint = 'tint-green',
  onTint = false,
  label,
  className = '',
}: {
  value: number
  max: number
  tint?: 'tint-green' | 'tint-gold' | 'tint-coral' | 'tint-sky'
  onTint?: boolean
  label?: string
  className?: string
}) {
  const ratio = max > 0 ? Math.min(1, value / max) : 0
  return (
    <span
      className={`relative block h-2 overflow-hidden rounded-full ${onTint ? 'well-on-tint' : 'well'} ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
    >
      <m.span
        className={`fill-satin absolute inset-0 origin-left rounded-full ${tint}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: ratio }}
        transition={{ type: 'spring', stiffness: 110, damping: 22, delay: 0.2 }}
      />
    </span>
  )
}

/**
 * A progress bar whose fill springs from empty to its value (scaleX — no layout work).
 * `icon` is a 3D picture sitting at the start (a gem, a medal). The numbers are for screen readers in `label`.
 */
export function ProgressBar({
  value,
  max,
  tone = 'green',
  track = 'bg-sand',
  icon,
  label,
  className = '',
  height = 'h-3',
}: {
  value: number
  max: number
  tone?: Tone
  track?: string
  icon?: string
  label?: string
  className?: string
  height?: string
}) {
  const ratio = max > 0 ? Math.min(1, value / max) : 0
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
    >
      {icon && <img src={img(icon)} alt="" className="pop-3d -my-2 size-9 shrink-0 object-contain" />}
      <span className={`relative block flex-1 overflow-hidden rounded-full shadow-[inset_0_2px_3px_rgb(28_43_35/0.16)] ${track} ${height}`}>
        <m.span
          className={`absolute inset-0 origin-left rounded-full ${FILL[tone]} shadow-[inset_0_2px_0_rgb(255_255_255/0.4)]`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: ratio }}
          transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.15 }}
        />
      </span>
    </div>
  )
}

/**
 * Koren or Raya says something: a round portrait and a speech bubble whose tail points at them.
 * `side="right"` puts the hero on the right. The text is the message; the portrait is decorative.
 */
export function CharacterMessage({
  hero,
  mood = 'joy',
  side = 'left',
  tone = 'bg-white',
  children,
  className = '',
  size = 'size-[min(3.75rem,15vw)]',
}: {
  hero: Hero
  mood?: Mood
  side?: 'left' | 'right'
  tone?: string
  children: ReactNode
  className?: string
  size?: string
}) {
  const right = side === 'right'
  return (
    <div className={`flex items-end gap-2.5 ${right ? 'flex-row-reverse' : ''} ${className}`}>
      <m.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={bouncy} className="shrink-0">
        <Avatar hero={hero} mood={mood} className={size} />
      </m.span>
      <m.div
        initial={{ opacity: 0, scale: 0.85, x: right ? 10 : -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ ...bouncy, delay: 0.08 }}
        className={`relative min-w-0 flex-1 rounded-[1.5rem] px-4 py-3 shadow-soft ${tone} ${right ? 'origin-bottom-right rounded-br-md' : 'origin-bottom-left rounded-bl-md'}`}
      >
        {children}
      </m.div>
    </div>
  )
}

/**
 * Interactive panel (dialog). Rises from the bottom on phones, sits in the middle on wide screens.
 * Closes with Esc, the × button or a tap outside. Focus moves into it and back to where it was on close.
 */
export function Panel({ label, onClose, children, className = '' }: { label: string; onClose: () => void; children: ReactNode; className?: string }) {
  const t = useT()
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    // Focus the first real action (Play), not the close button.
    const target = box.current?.querySelector<HTMLElement>('[data-autofocus]') ?? box.current
    target?.focus({ preventScroll: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      before?.focus?.({ preventScroll: true })
    }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/35 short:items-center wide:items-center" onClick={onClose}>
      <m.div
        ref={box}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        initial={{ y: 90, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={bouncy}
        onClick={(e) => e.stopPropagation()}
        className={`relative m-3 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col gap-3 overflow-y-auto rounded-[var(--radius-stage)] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-stage outline-none ${className}`}
      >
        {/* a grab handle on phones — the sheet "belongs" to the bottom edge */}
        <span className="mx-auto -mt-2 mb-1 block h-1.5 w-12 rounded-full bg-sand wide:hidden" aria-hidden="true" />
        <button type="button" onClick={onClose} aria-label={t('path.close')} className="tap press absolute top-1 right-1 grid place-items-center rounded-full text-muted">
          <Icon name="close" />
        </button>
        {children}
      </m.div>
    </div>
  )
}

/** Fixed pattern (no randomness → no jitter between renders). */
const SPARKS = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2 + 0.3
  const d = 34 + (i % 3) * 12
  return { x: Math.cos(a) * d, y: Math.sin(a) * d, color: ['bg-gold', 'bg-coral', 'bg-sky', 'bg-mint', 'bg-white'][i % 5]!, round: i % 2 === 0 }
})

/**
 * A short burst of particles from the centre of the parent (which must be `relative`).
 * Change `burst` (a counter) to play it again. Hidden from screen readers; still with reduced motion.
 */
export function Sparkles({ burst, className = '' }: { burst: number | string; className?: string }) {
  return (
    <span key={burst} className={`pointer-events-none absolute inset-0 grid place-items-center ${className}`} aria-hidden="true">
      {SPARKS.map((s, i) => (
        <m.span
          key={i}
          className={`absolute size-2 ${s.color} ${s.round ? 'rounded-full' : 'rotate-45 rounded-[2px]'} shadow-sm`}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x: s.x, y: s.y, scale: [0, 1.3, 0], opacity: [1, 1, 0] }}
          transition={{ duration: 0.75, ease: 'easeOut', delay: i * 0.01 }}
        />
      ))}
    </span>
  )
}

/** Section title with an optional "see all" link on the right. */
export function SectionHeading({ id, children, to, more }: { id?: string; children: ReactNode; to?: string; more?: string }) {
  return (
    <div className="flex items-end justify-between gap-3 px-1">
      <h2 id={id} className="text-title min-w-0">
        {children}
      </h2>
      {to && more && (
        <Link to={to} className="press -my-2 flex min-h-[var(--tap)] shrink-0 items-center gap-0.5 rounded-full px-2 text-sm font-extrabold text-green-dark">
          {more}
          <Icon name="chevron" width="1.1em" height="1.1em" />
        </Link>
      )}
    </div>
  )
}
