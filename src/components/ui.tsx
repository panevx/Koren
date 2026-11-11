import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { useT } from '../i18n/useT'
import { Icon } from './Icon'

/** Phone-width column, centred on tablets and laptops. */
export function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-dvh overflow-x-clip bg-cream">
      <main className={`mx-auto flex min-h-dvh w-full max-w-md flex-col ${className}`}>{children}</main>
    </div>
  )
}

type Variant = 'primary' | 'accent' | 'secondary'

const variants: Record<Variant, string> = {
  primary: 'bg-red text-white shadow-[0_4px_0_var(--color-red-dark)] active:translate-y-[2px] active:shadow-[0_2px_0_var(--color-red-dark)]',
  accent: 'bg-green text-white shadow-[0_4px_0_var(--color-green-dark)] active:translate-y-[2px] active:shadow-[0_2px_0_var(--color-green-dark)]',
  secondary: 'bg-white text-ink border-2 border-sand hover:border-green',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`tap rounded-level inline-flex items-center justify-center gap-2 px-6 text-lg font-extrabold transition disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  )
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
  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate(fallback, { replace: true })
  }
  return (
    <header className="flex items-center gap-2 px-3 pt-3 pb-2">
      <button
        type="button"
        onClick={onBack ?? goBack}
        className="tap grid place-items-center rounded-full text-green hover:bg-white"
        aria-label={t('nav.back')}
      >
        <Icon name="back" />
      </button>
      <h1 className="flex-1 text-center text-2xl font-black">{title}</h1>
      <div className="tap grid place-items-center">{right}</div>
    </header>
  )
}
