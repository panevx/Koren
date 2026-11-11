import { Link } from 'react-router'
import { BottomNav } from '../components/BottomNav'
import { Avatar, Logo, img } from '../components/Brand'
import { Icon } from '../components/Icon'
import { SectionIcon } from '../components/SectionIcon'
import { Screen } from '../components/ui'
import { useT } from '../i18n/useT'
import { SECTIONS } from '../sections'
import { ProfileAvatar, useProfileName } from '../components/ProfileAvatar'
import { activeProfile, useProfiles } from '../store/profiles'
import { ageToLevel, type Level } from '../theme/levels'

/** How the hub adapts per age level, beyond the global size/colour theme. */
const LAYOUT: Record<Level, { art: string; showDesc: boolean; label: string }> = {
  small: { art: 'size-20', showDesc: false, label: 'text-lg' },
  young: { art: 'size-16', showDesc: false, label: 'text-base' },
  guard: { art: 'size-12', showDesc: true, label: 'text-base' },
}

export function Home() {
  const t = useT()
  const profiles = useProfiles((s) => s.profiles)
  const profile = useProfiles(activeProfile)
  const name = useProfileName()
  const level = ageToLevel(profile.age)
  const layout = LAYOUT[level]

  return (
    <Screen>
      <header className="relative overflow-hidden">
        <img
          src={img('scenes/sunset-600.webp')}
          srcSet={`${img('scenes/sunset-600.webp')} 600w, ${img('scenes/sunset-900.webp')} 900w`}
          sizes="(max-width: 448px) 100vw, 448px"
          alt=""
          width={900}
          height={450}
          className="absolute inset-0 h-full w-full object-cover object-[70%_30%]"
          decoding="async"
        />
        <div className="relative flex items-start justify-between px-4 pt-4 pb-16">
          <Link
            to="/who"
            className="tap grid place-items-center rounded-full"
            aria-label={`${t('profile.who')} ${name(profile, profiles.indexOf(profile))}`}
          >
            <ProfileAvatar avatar={profile.avatar} className="size-12 shadow-md" />
          </Link>
          <div className="rounded-full bg-white/90 px-5 py-1.5 shadow-md">
            <Logo size="sm" />
          </div>
          <Link
            to="/parents"
            className="tap grid place-items-center rounded-full bg-white/90 text-green shadow-md hover:bg-white"
            aria-label={t('parents.title')}
          >
            <Icon name="gear" />
          </Link>
        </div>
      </header>

      <div className="relative -mt-8 flex-1 rounded-t-[2rem] bg-cream px-4 pt-5 pb-28">
        <h1 className="sr-only">{t('nav.home')}</h1>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex shrink-0 -space-x-4" aria-hidden="true">
            <Avatar hero="raya" mood="joy" className="size-14" />
            <Avatar hero="koren" mood="joy" className="size-14" />
          </div>
          <p className="rounded-level flex-1 rounded-bl-sm border-2 border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 font-extrabold text-ink">
            {t(`home.greeting.${level}`)}
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-3">
          {SECTIONS.map(({ id, path, label, desc }) => (
            <li key={id}>
              <Link
                to={path}
                className="rounded-level flex h-full min-h-[9rem] flex-col items-center justify-center gap-2 border-2 border-sand bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-green hover:shadow-md"
              >
                <SectionIcon id={id} className={layout.art} />
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
