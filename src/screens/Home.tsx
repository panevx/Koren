import { Link } from 'react-router'
import { BottomNav } from '../components/BottomNav'
import { Landscape, Logo } from '../components/Brand'
import { Icon } from '../components/Icon'
import { Screen } from '../components/ui'
import { useT } from '../i18n/useT'
import { SECTIONS } from '../sections'
import { useSettings } from '../store/settings'
import { ageToLevel, type Level } from '../theme/levels'

/** How the hub adapts per age level, beyond the global size/colour theme. */
const LAYOUT: Record<Level, { art: string; showDesc: boolean; label: string }> = {
  small: { art: 'size-20', showDesc: false, label: 'text-lg' },
  young: { art: 'size-16', showDesc: false, label: 'text-base' },
  guard: { art: 'size-12', showDesc: true, label: 'text-base' },
}

export function Home() {
  const t = useT()
  const level = useSettings((s) => ageToLevel(s.age))
  const layout = LAYOUT[level]

  return (
    <Screen>
      <header className="relative overflow-hidden">
        <Landscape className="absolute inset-0 h-full w-full" />
        <div className="relative flex items-start justify-between px-4 pt-4 pb-14">
          <span className="tap" aria-hidden="true" />
          <Logo size="sm" />
          <Link
            to="/settings"
            className="tap grid place-items-center rounded-full bg-white/85 text-green shadow-sm hover:bg-white"
            aria-label={t('settings.title')}
          >
            <Icon name="gear" />
          </Link>
        </div>
      </header>

      <div className="relative -mt-8 flex-1 rounded-t-[2rem] bg-cream px-4 pt-5 pb-28">
        <h1 className="sr-only">{t('nav.home')}</h1>
        <p className="rounded-level mb-4 border-2 border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-center font-extrabold text-ink">
          {t(`home.greeting.${level}`)}
        </p>
        <ul className="grid grid-cols-2 gap-3">
          {SECTIONS.map(({ id, path, label, desc, Art }) => (
            <li key={id}>
              <Link
                to={path}
                className="rounded-level flex h-full min-h-[9rem] flex-col items-center justify-center gap-2 border-2 border-sand bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-green hover:shadow-md"
              >
                <Art className={layout.art} />
                <span className={`${layout.label} leading-tight font-extrabold text-green-dark`}>{t(label)}</span>
                {layout.showDesc && <span className="text-sm leading-snug text-muted">{t(desc)}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <BottomNav />
    </Screen>
  )
}
